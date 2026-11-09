import {EVENT_NAMES,type AnalyticsEvent,type AdminIdentity} from '../src/analytics/contracts';
import {sidebarFamilies} from '../src/lib/sidebar-families';
import characters from '../src/data/characters.json';

export const MODES=['explore','lab','challenge','connections','lesson'] as const;
const eventNames=new Set<string>(EVENT_NAMES),modes=new Set<string>(MODES);
const familyIds=new Set(sidebarFamilies.map(r=>r.id)),characterIds=new Set(characters.map(c=>c.id));
const partForms=new Set(characters.flatMap(c=>[c.firstPart,c.secondPart]));
const sources=new Set(['initial','auto','click','keyboard','drag','grade','navigation','family-card','related','search','word-chain','lesson','composition','practice','manual','toggle','heartbeat','visible','hidden','favorite','panda']);
const values=new Set(['on','off','save','unsave','ko-on','ko-off','start','stop','play','kick','甲骨文','金文','楚系简帛','说文','秦系简牍','隶书','楷书','《说文》小篆']);
const fields=new Set(['id','sessionId','name','occurredAt','mode','course','level','range','familyId','characterId','wordId','trialId','attemptNo','result','hintUsed','activeMs','source','firstPart','secondPart','value','count']);
export const MAX_EVENTS=50;
export const idPattern=/^[A-Za-z0-9_-]{8,96}$/;
export class AnalyticsError extends Error{constructor(message:string,public status=400){super(message);}}
export function parseAdminIds(raw:unknown):string[]{
 if(typeof raw!=='string'||!raw.trim())return [];
 try{const ids=raw.trim().startsWith('[')?JSON.parse(raw):raw.split(',').map(v=>v.trim());return Array.isArray(ids)?ids.filter(id=>typeof id==='string'&&/^[A-Za-z0-9_:@.-]{1,256}$/.test(id)):[];}catch{return [];}
}
export function adminIdentity(userId:string|null,raw:unknown):AdminIdentity{
 const admins=parseAdminIds(raw);return {signedIn:!!userId,founder:!!userId&&admins.includes(userId),founderConfigured:admins.length>0,...(userId?{userId}:{})};
}
export interface AnalyticsFilters{from:string;to:string;fromUtc:string;untilUtc:string;level?:number;mode?:string;course?:'legacy5'|'official'}
const dayMs=86400000;
const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
export function parseFilters(params:URLSearchParams,now=Date.now()):AnalyticsFilters{
 const today=new Date(now+9*3600000).toISOString().slice(0,10);
 const to=params.get('to')||today;
 if(!validDate(to))throw new AnalyticsError('请选择有效的结束日期。');
 const from=params.get('from')||new Date(Date.parse(to)-29*dayMs).toISOString().slice(0,10);
 if(!validDate(from)||!validDate(to)||from>to||(Date.parse(to)-Date.parse(from))>365*dayMs)throw new AnalyticsError('请选择不超过366天的有效日期范围。');
 const levelValue=params.get('level'),mode=params.get('mode')||undefined;
 const course=params.get('course')||undefined;
 const level=levelValue?Number(levelValue):undefined;
 if(level!==undefined&&(!Number.isInteger(level)||level<1||level>7))throw new AnalyticsError('HSK范围无效。');
 if(mode&&!modes.has(mode))throw new AnalyticsError('学习模式无效。');
 if(course&&course!=='legacy5'&&course!=='official')throw new AnalyticsError('词库范围无效。');
 return {from,to,fromUtc:new Date(Date.parse(from)-9*3600000).toISOString(),untilUtc:new Date(Date.parse(to)+15*3600000).toISOString(),...(level!==undefined?{level}:{}),...(mode?{mode}:{}),...(course?{course:course as 'legacy5'|'official'}:{})};
}
export function validateEventBatch(input:unknown,sessionId:string,now=Date.now()):AnalyticsEvent[]{
 if(!idPattern.test(sessionId)||!Array.isArray(input)||input.length<1||input.length>MAX_EVENTS)throw new AnalyticsError('统计批次无效。');
 return input.map((raw:unknown)=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new AnalyticsError('统计事件无效。');
  const event=raw as Record<string,unknown>;
  if(Object.keys(event).some(key=>!fields.has(key)))throw new AnalyticsError('统计事件包含不支持的字段。');
  if(typeof event.id!=='string'||!idPattern.test(event.id)||event.sessionId!==sessionId||typeof event.name!=='string'||!eventNames.has(event.name))throw new AnalyticsError('统计事件标识无效。');
  const time=typeof event.occurredAt==='string'?Date.parse(event.occurredAt):NaN;
  if(!Number.isFinite(time)||time>now+5*60000||time<now-7*dayMs)throw new AnalyticsError('统计时间无效。');
  const optional=(field:string,check:(v:unknown)=>boolean)=>{if(event[field]!==undefined&&!check(event[field]))throw new AnalyticsError(`统计字段${field}无效。`);};
  optional('mode',v=>typeof v==='string'&&modes.has(v));
  optional('course',v=>v==='legacy5'||v==='official');
  optional('range',v=>v==='cumulative'||v==='level');
  optional('level',v=>typeof v==='number'&&Number.isInteger(v)&&v>=1&&v<=7);
  optional('familyId',v=>typeof v==='string'&&familyIds.has(v));
  optional('characterId',v=>typeof v==='string'&&characterIds.has(v));
  optional('wordId',v=>typeof v==='string'&&(/^(?:hsk-\d{1,5}|hsk3-\d{1,5})$/.test(v)||['course-thread','course-radical','course-red'].includes(v)));
  optional('trialId',v=>typeof v==='string'&&idPattern.test(v));
  optional('attemptNo',v=>typeof v==='number'&&Number.isInteger(v)&&v>=1&&v<=1000);
  optional('result',v=>['correct','incorrect','found','uncollected'].includes(v as string));
  optional('hintUsed',v=>typeof v==='boolean');
  optional('activeMs',v=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=60000);
  optional('source',v=>typeof v==='string'&&sources.has(v));
  optional('value',v=>typeof v==='string'&&values.has(v));
  optional('firstPart',v=>typeof v==='string'&&partForms.has(v));
  optional('secondPart',v=>typeof v==='string'&&partForms.has(v));
  optional('count',v=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=100000);
  if(event.name==='mode_click'&&!event.mode)throw new AnalyticsError('学习功能标识缺失。');
  if(event.name==='practice_attempt'&&(!event.trialId||!event.attemptNo||!event.result||!event.characterId||!event.firstPart||!event.secondPart))throw new AnalyticsError('作答事件缺少目标、部件或题次。');
  if(event.name==='practice_start'&&(!event.trialId||!event.characterId))throw new AnalyticsError('练习事件缺少目标或题次。');
  if(event.name==='active_time'&&event.activeMs===undefined)throw new AnalyticsError('活跃时间缺失。');
  if(['radical_click','radical_impression','radical_view'].includes(event.name)&&!event.familyId)throw new AnalyticsError('偏旁标识缺失。');
  return {...event,occurredAt:new Date(time).toISOString()} as unknown as AnalyticsEvent;
 });
}
export function csvCell(value:unknown):string{
 if(value===undefined||value===null)return '';
 let s=String(value);if(/^[=+\-@\t\r]/.test(s))s=`'${s}`;
 return /[,"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
}
export function csvDocument(headers:string[],rows:unknown[][]):string{return '\uFEFF'+[headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';}
