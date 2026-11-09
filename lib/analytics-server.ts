import {env} from 'cloudflare:workers';
import type {AnalyticsDb,SessionRow} from './analytics-store';
import {appendEvents,readSummary,exportEventPage,exportSnapshot} from './analytics-store';
import {adminIdentity,AnalyticsError,csvDocument,csvCell,idPattern,parseFilters,validateEventBatch} from './analytics-core';

const VISITOR='hanzi_analytics_visitor',DISABLED='hanzi_analytics_disabled';
const HOUR=3600000,DAY=24*HOUR;
const privateHeaders={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Vary':'Cookie'};
function database():AnalyticsDb{if(!env.DB)throw new AnalyticsError('统计数据库尚未连接，请稍后重试。',503);return env.DB as unknown as AnalyticsDb;}
function identity(request:Request){return adminIdentity(request.headers.get('oai-authenticated-user-id'),env.ADMIN_USER_IDS);}
function assertFounder(request:Request){const who=identity(request);if(!who.signedIn)throw new AnalyticsError('请先使用创始人账号登录。',401);if(!who.founder)throw new AnalyticsError('只有已绑定的创始人账号可以查看统计。',403);return who;}
function cookies(request:Request):Record<string,string>{return Object.fromEntries((request.headers.get('cookie')??'').split(';').map(part=>part.trim().split('=')).filter(pair=>pair.length===2));}
function cookie(request:Request,name:string,value:string,maxAge:number){return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
function json(value:unknown,status=200,setCookies:string[]=[]){const headers=new Headers({...privateHeaders,'Content-Type':'application/json; charset=utf-8'});for(const value of setCookies)headers.append('Set-Cookie',value);return new Response(JSON.stringify(value),{status,headers});}
function writeOrigin(request:Request){const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin)throw new AnalyticsError('统计请求来源无效。',403);if(!(request.headers.get('content-type')??'').toLowerCase().startsWith('application/json'))throw new AnalyticsError('请求格式无效。',415);}
async function readJson(request:Request):Promise<Record<string,unknown>>{
 const length=Number(request.headers.get('content-length')??0);if(length>65536)throw new AnalyticsError('统计请求过大。',413);
 const reader=request.body?.getReader();if(!reader)return {};
 const chunks:Uint8Array[]=[];let bytes=0;
 while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>65536){await reader.cancel();throw new AnalyticsError('统计请求过大。',413);}chunks.push(value);}
 const merged=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){merged.set(chunk,offset);offset+=chunk.length;}
 try{const value=JSON.parse(new TextDecoder().decode(merged)||'{}');if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value;}catch{throw new AnalyticsError('请求JSON无效。');}
}
function bodyFields(body:Record<string,unknown>,keys:string[]){if(Object.keys(body).some(key=>!keys.includes(key)))throw new AnalyticsError('请求包含不支持的字段。');}
async function digest(value:string):Promise<string>{const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
function randomVisitor(){return crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');}
async function visitorId(request:Request){const raw=cookies(request)[VISITOR];return raw&&/^[a-f0-9]{64}$/.test(raw)?digest(raw):null;}
async function ownedSession(db:AnalyticsDb,request:Request,id:unknown):Promise<SessionRow>{
 const visitor=await visitorId(request);if(!visitor||typeof id!=='string'||!idPattern.test(id))throw new AnalyticsError('统计会话已失效。',409);
 const session=await db.prepare('SELECT * FROM analytics_sessions WHERE id=? AND visitor_id=? AND revoked_at IS NULL').bind(id,visitor).first<SessionRow>();
 if(!session||Date.parse(session.created_at)<Date.now()-DAY)throw new AnalyticsError('统计会话已失效。',409);
 return session;
}
async function excludeFounder(request:Request){const visitor=await visitorId(request);if(visitor&&env.DB)await database().prepare('UPDATE analytics_sessions SET excluded=1 WHERE visitor_id=?').bind(visitor).run();}
export async function apiResponse(action:()=>Promise<Response>):Promise<Response>{try{return await action();}catch(error){if(error instanceof AnalyticsError)return json({error:error.message},error.status);console.error('Analytics service request failed');return json({error:'统计服务暂时不可用，请稍后重试。'},503);}}

export async function sessionResponse(request:Request):Promise<Response>{return apiResponse(async()=>{
 writeOrigin(request);const body=await readJson(request);bodyFields(body,['sessionId','resume']);
 if(body.resume!==undefined&&typeof body.resume!=='boolean')throw new AnalyticsError('请求格式无效。');
 if(identity(request).founder){await excludeFounder(request);return json({sessionId:'',enabled:false,reason:'founder'});}
 const existing=cookies(request);
 if(existing[DISABLED]==='1'&&body.resume!==true)return json({sessionId:'',enabled:false});
 const db=database(),now=new Date().toISOString(),setCookies:string[]=[];
 if(body.resume===true)setCookies.push(cookie(request,DISABLED,'',0));
 let raw=existing[VISITOR];if(!raw||!/^[a-f0-9]{64}$/.test(raw)){raw=randomVisitor();setCookies.push(cookie(request,VISITOR,raw,365*86400));}
 const visitor=await digest(raw);
 await db.prepare('INSERT INTO analytics_visitors (id,created_at,last_seen_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET last_seen_at=excluded.last_seen_at').bind(visitor,now,now).run();
 if(typeof body.sessionId==='string'&&idPattern.test(body.sessionId)){
  const previous=await db.prepare('SELECT id,created_at FROM analytics_sessions WHERE id=? AND visitor_id=? AND revoked_at IS NULL AND excluded=0').bind(body.sessionId,visitor).first<{id:string;created_at:string}>();
  if(previous&&Date.parse(previous.created_at)>=Date.now()-DAY)return json({sessionId:previous.id,enabled:true},200,setCookies);
 }
 const recent=await db.prepare('SELECT COUNT(*) count FROM analytics_sessions WHERE visitor_id=? AND created_at>?').bind(visitor,new Date(Date.now()-HOUR).toISOString()).first<{count:number}>();
 if((recent?.count??0)>=30)throw new AnalyticsError('浏览会话创建过于频繁，请稍后重试。',429);
 const sessionId=crypto.randomUUID();
 await db.prepare('INSERT INTO analytics_sessions (id,visitor_id,created_at,last_seen_at,rate_window,rate_count,excluded) VALUES (?,?,?,?,?,0,0)').bind(sessionId,visitor,now,now,now.slice(0,16)).run();
 return json({sessionId,enabled:true},200,setCookies);
 });}
export async function eventsResponse(request:Request):Promise<Response>{return apiResponse(async()=>{
 writeOrigin(request);if(identity(request).founder){await excludeFounder(request);return json({accepted:0,enabled:false});}
 if(cookies(request)[DISABLED]==='1')return json({accepted:0,enabled:false});
 const body=await readJson(request);bodyFields(body,['sessionId','events']);const db=database();
 const session=await ownedSession(db,request,body.sessionId);if(session.excluded)return json({accepted:0,enabled:false});
 const events=validateEventBatch(body.events,session.id);await appendEvents(db,session,events,new Date().toISOString());
 return json({accepted:events.length,enabled:true});
 });}
export async function optoutResponse(request:Request):Promise<Response>{return apiResponse(async()=>{
 writeOrigin(request);const body=await readJson(request);bodyFields(body,['reset']);if(body.reset!==undefined&&typeof body.reset!=='boolean')throw new AnalyticsError('请求格式无效。');
 const visitor=await visitorId(request);if(visitor&&env.DB)await database().prepare('UPDATE analytics_sessions SET revoked_at=? WHERE visitor_id=? AND revoked_at IS NULL').bind(new Date().toISOString(),visitor).run();
 const setCookies=[cookie(request,VISITOR,'',0)];if(!body.reset)setCookies.push(cookie(request,DISABLED,'1',365*86400));
 return json({enabled:body.reset?cookies(request)[DISABLED]!=='1':false},200,setCookies);
 });}
export async function meResponse(request:Request):Promise<Response>{return apiResponse(async()=>{const who=identity(request);if(who.founder)await excludeFounder(request);return json(who);});}
export async function summaryResponse(request:Request):Promise<Response>{return apiResponse(async()=>{assertFounder(request);return json(await readSummary(database(),parseFilters(new URL(request.url).searchParams)));});}

export async function exportResponse(request:Request):Promise<Response>{return apiResponse(async()=>{
 assertFounder(request);const params=new URL(request.url).searchParams,filters=parseFilters(params),kind=params.get('kind')||'events';
 if(!['events','radicals','daily'].includes(kind))throw new AnalyticsError('导出类型无效。');
 const headers=new Headers({...privateHeaders,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="hanzi-${kind}-${filters.from}-${filters.to}.csv"`});
 const db=database();
 if(kind!=='events'){
  const summary=await readSummary(db,filters),rows=kind==='daily'?summary.daily:summary.radicals;
  const keys=kind==='daily'?['date','visitors','sessions','clicks','attempts','correct','activeMs']:['id','form','name','korean','clicks','visitors','visibleSessions','clickSessions','ctr','characters'];
  return new Response(csvDocument(keys,rows.map(row=>keys.map(key=>(row as unknown as Record<string,unknown>)[key]))),{headers});
 }
 const keys=['id','browser_code','session_id','name','occurred_at','received_at','mode','course','level','word_range','family_id','character_id','word_id','trial_id','attempt_no','result','hint_used','active_ms','source','first_part','second_part','value','event_count','app_version','instrument_version'];
 const encoder=new TextEncoder(),snapshot=await exportSnapshot(db);let offset=0,started=false;
 const stream=new ReadableStream<Uint8Array>({async pull(controller){try{if(!started){started=true;controller.enqueue(encoder.encode('\uFEFF'+keys.join(',')+'\r\n'));return;}const rows=await exportEventPage(db,filters,offset,snapshot);if(!rows.length){controller.close();return;}offset+=rows.length;controller.enqueue(encoder.encode(rows.map(row=>keys.map(key=>csvCell(row[key])).join(',')).join('\r\n')+'\r\n'));if(rows.length<500)controller.close();}catch{controller.error(new Error('导出中断，请重新下载。'));}}});
 return new Response(stream,{headers});
 });}
