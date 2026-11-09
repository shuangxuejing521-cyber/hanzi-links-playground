import type {AnalyticsEvent,EventName} from './contracts';

type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
type Context=Partial<Omit<AnalyticsEvent,'id'|'sessionId'|'name'|'occurredAt'>>;
type Status={enabled:boolean;connected:boolean;pending:number;state:'starting'|'saved'|'pending'|'disabled'|'unavailable'};
interface Options{local:Store;session:Store;now:()=>number;id:()=>string;send:(url:string,body:unknown)=>Promise<any>}
const SESSION='hanzi-analytics-session-v1',PENDING='hanzi-analytics-pending-v1',DISABLED='hanzi-analytics-disabled',SEEN='hanzi-analytics-seen-v1';
const MAX_PENDING=300,MAX_BATCH=50,MAX_AGE=24*60*60*1000;
const safeGet=(store:Store,key:string)=>{try{return store.getItem(key);}catch{return null;}};
const safeSet=(store:Store,key:string,value:string)=>{try{store.setItem(key,value);}catch{/* Learning must work with browser storage disabled. */}};
const safeRemove=(store:Store,key:string)=>{try{store.removeItem(key);}catch{/* no-op */}};

/** Injectable transport lets retry, attribution and opt-out be tested without a browser. */
export class AnalyticsClient{
 private queue:AnalyticsEvent[]=[];private sessionId='';private enabled=true;private connected=false;private starting:Promise<void>|null=null;private uploading:Promise<void>|null=null;
 private state:Status['state']='starting';private listeners=new Set<()=>void>();private once=new Set<string>();private generation=0;
 constructor(private options:Options){
  this.enabled=safeGet(options.local,DISABLED)!=='1';this.sessionId=safeGet(options.session,SESSION)??'';
  try{const q=JSON.parse(safeGet(options.session,PENDING)??'[]');if(Array.isArray(q))this.queue=q.filter(e=>e&&typeof e.id==='string'&&typeof e.sessionId==='string'&&typeof e.name==='string').slice(-MAX_PENDING);}catch{}
  try{const keys=JSON.parse(safeGet(options.session,SEEN)??'[]');if(Array.isArray(keys))this.once=new Set(keys.filter(k=>typeof k==='string').slice(-500));}catch{}
  if(!this.enabled){this.queue=[];this.state='disabled';this.persist();}
 }
 status():Status{return {enabled:this.enabled,connected:this.connected,pending:this.queue.length,state:this.state};}
 subscribe(fn:()=>void){this.listeners.add(fn);return()=>{this.listeners.delete(fn);};}
 private notify(){for(const fn of this.listeners)fn();}
 private persist(){safeSet(this.options.session,PENDING,JSON.stringify(this.queue));this.notify();}
 private clearSession(){this.connected=false;this.sessionId='';this.queue=[];this.once.clear();safeRemove(this.options.session,SESSION);safeRemove(this.options.session,SEEN);this.persist();}
 private serverDisabled(){this.generation++;this.enabled=false;this.clearSession();this.state='disabled';this.notify();}
 async start(resume=false):Promise<void>{
  if(!this.enabled)return;if(this.connected)return;if(this.starting)return this.starting;
  const generation=this.generation;this.state='starting';this.notify();
  let startup!:Promise<void>;startup=(async()=>{try{
   const result=await this.options.send('/api/analytics/session',{...(this.sessionId?{sessionId:this.sessionId}:{}),...(resume?{resume:true}:{})});
   if(generation!==this.generation)return;
   if(!result?.enabled){this.serverDisabled();return;}
   if(typeof result.sessionId!=='string'||!result.sessionId)throw new Error('invalid session');
   if(this.sessionId&&this.sessionId!==result.sessionId){this.once.clear();safeRemove(this.options.session,SEEN);}
   this.sessionId=result.sessionId;safeSet(this.options.session,SESSION,this.sessionId);
   this.queue=this.queue.filter(e=>!e.sessionId||e.sessionId===this.sessionId).map(e=>({...e,sessionId:this.sessionId}));
   this.connected=true;this.state=this.queue.length?'pending':'saved';this.persist();
  }catch{if(generation===this.generation){this.connected=false;this.state='unavailable';this.notify();}}finally{if(this.starting===startup)this.starting=null;}})();
  this.starting=startup;return startup;
 }
 record(name:EventName,details:Context={}){
  if(!this.enabled)return;
  const event:AnalyticsEvent={...details,id:this.options.id(),sessionId:this.sessionId,name,occurredAt:new Date(this.options.now()).toISOString()};
  this.queue.push(event);if(this.queue.length>MAX_PENDING)this.queue.splice(0,this.queue.length-MAX_PENDING);
  this.state=this.connected?'pending':this.state;this.persist();
 }
 recordOnce(name:EventName,details:Context,key:string){
  if(!this.enabled||this.once.has(key))return;this.once.add(key);safeSet(this.options.session,SEEN,JSON.stringify([...this.once].slice(-500)));this.record(name,details);
 }
 recordExposure(familyId:string,details:Context){
  const scope=JSON.stringify([familyId,details.course??'',details.level??0,details.range??'',details.mode??'']);
  this.recordOnce('radical_impression',{...details,familyId,source:'visible'},`radical-impression:${scope}`);
 }
 async flush():Promise<void>{
  if(!this.enabled)return;if(this.uploading)return this.uploading;await this.start();if(!this.connected||!this.enabled)return;
  const generation=this.generation;
  this.uploading=(async()=>{try{
   while(this.enabled&&this.queue.length&&generation===this.generation){
    const now=this.options.now();this.queue=this.queue.filter(e=>e.sessionId===this.sessionId&&now-Date.parse(e.occurredAt)<MAX_AGE);
    const batch=this.queue.slice(0,MAX_BATCH);if(!batch.length)break;
    const response=await this.options.send('/api/analytics/events',{sessionId:this.sessionId,events:batch});
    if(generation!==this.generation)return;
    if(response?.enabled===false){this.serverDisabled();return;}
    const saved=new Set(batch.map(e=>e.id));this.queue=this.queue.filter(e=>!saved.has(e.id));this.persist();
   }
   this.state='saved';this.notify();
  }catch(error){if(generation===this.generation){const status=(error as {status?:number})?.status;
   if(status===409||status===401){this.clearSession();this.state='unavailable';this.notify();await this.start();}
   else if(status===403)this.serverDisabled();
   else{this.state='pending';this.persist();}
  }}finally{this.uploading=null;}})();
  return this.uploading;
 }
 async setEnabled(enabled:boolean){
  this.generation++;this.enabled=enabled;this.connected=false;this.sessionId='';this.queue=[];this.once.clear();safeRemove(this.options.session,SESSION);safeRemove(this.options.session,SEEN);
  if(enabled)safeRemove(this.options.local,DISABLED);else safeSet(this.options.local,DISABLED,'1');
  this.state=enabled?'starting':'disabled';this.persist();
  if(enabled){this.starting=null;await this.start(true);}else{try{await this.options.send('/api/analytics/optout',{});}catch{/* Local optout still takes effect immediately. */}}
 }
 async resetIdentity(){
  const enabled=this.enabled;this.generation++;this.connected=false;this.sessionId='';this.queue=[];this.once.clear();safeRemove(this.options.session,SESSION);safeRemove(this.options.session,SEEN);this.persist();
  try{await this.options.send('/api/analytics/optout',{reset:true});}catch{this.enabled=false;safeSet(this.options.local,DISABLED,'1');this.state='unavailable';this.notify();throw new Error('기기 코드 초기화를 완료하지 못해 통계 기록을 중지했어요. 연결 후 다시 시도해 주세요.');}
  if(enabled){this.starting=null;await this.start(true);}else{this.state='disabled';this.notify();}
 }
}

/** Counts foreground time only until 60 seconds after the last real activity. */
export class ForegroundClock{
 private lastActivity:number;private accrued=0;constructor(private previous:number,private visible:boolean){this.lastActivity=previous;}
 private advance(now:number){const elapsed=this.visible?Math.max(0,Math.min(now,this.lastActivity+60000)-this.previous):0;this.previous=now;return elapsed;}
 activity(now:number){this.accrued+=this.advance(now);this.lastActivity=now;}
 sample(now:number,visible:boolean){const elapsed=this.accrued+this.advance(now);this.accrued=0;this.visible=visible;return Math.min(elapsed,60000);}
}

let engine:AnalyticsClient|undefined,installed=false,context:Context={},clock:ForegroundClock|undefined;
const lastViews=new Map<string,number>();
function client(){
 if(typeof window==='undefined'||window.location.pathname.startsWith('/admin'))return undefined;
 if(!engine){
  const unavailable:Store={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  let local:Store=unavailable,session:Store=unavailable;try{local=window.localStorage;}catch{}try{session=window.sessionStorage;}catch{}
  engine=new AnalyticsClient({local,session,now:()=>Date.now(),id:()=>crypto.randomUUID(),send:async(url,body)=>{
   const response=await fetch(url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true});
   if(!response.ok)throw Object.assign(new Error(`analytics ${response.status}`),{status:response.status});return response.json();
  }});
 }
 return engine;
}
function pulse(){
 if(!clock||typeof document==='undefined')return;
 const activeMs=clock.sample(Date.now(),!document.hidden);if(activeMs>0)track('active_time',{activeMs,source:'heartbeat'});
}
export function setAnalyticsContext(next:Context){if(JSON.stringify(next)!==JSON.stringify(context)){pulse();context={...next};}}
export function track(name:EventName,details:Context={}){client()?.record(name,{...context,...details});}
export function trackView(name:EventName,details:Context={},key=''){
 const fingerprint=`${name}:${key||JSON.stringify({...context,...details})}`,now=Date.now();
 if(now-(lastViews.get(fingerprint)??0)<1000)return;lastViews.set(fingerprint,now);track(name,details);
 if(lastViews.size>200)lastViews.delete(lastViews.keys().next().value!);
}
export function trackOnce(name:EventName,details:Context,key:string){client()?.recordOnce(name,{...context,...details},key);}
export function startAnalytics(){
 const current=client();if(!current)return;void current.start().then(()=>current.flush());
 if(installed)return;installed=true;clock=new ForegroundClock(Date.now(),!document.hidden);
 const activity=()=>{if(!document.hidden)clock?.activity(Date.now());};
 for(const name of ['pointerdown','keydown','scroll','touchstart'])window.addEventListener(name,activity,{passive:true});
 document.addEventListener('visibilitychange',()=>{pulse();if(!document.hidden)activity();void current.flush();});
 window.addEventListener('pagehide',()=>{pulse();void current.flush();});
 window.setInterval(()=>{pulse();void current.flush();},10000);
 window.addEventListener('online',()=>{void current.flush();});
 window.addEventListener('storage',event=>{if(event.key===DISABLED)void current.setEnabled(event.newValue!=='1');});
}
export function analyticsStatus(){return client()?.status()??{enabled:false,connected:false,pending:0,state:'disabled' as const};}
export function subscribeAnalyticsStatus(listener:()=>void){return client()?.subscribe(listener)??(()=>{});}
export async function setAnalyticsEnabled(enabled:boolean){await client()?.setEnabled(enabled);if(enabled)startAnalytics();}
export async function resetAnalyticsIdentity(){await client()?.resetIdentity();}

/** Observes actual sidebar exposure; automatic selection remains a separate event. */
export function observeRadicalImpressions(root:Element){
 if(typeof IntersectionObserver==='undefined')return()=>{};
 const timers=new Map<Element,ReturnType<typeof setTimeout>>();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){const old=timers.get(entry.target);if(old)clearTimeout(old);timers.delete(entry.target);
   if(entry.isIntersecting&&entry.intersectionRatio>=.5&&!document.hidden){timers.set(entry.target,setTimeout(()=>{timers.delete(entry.target);if(document.hidden)return;const id=(entry.target as HTMLElement).dataset.analyticsFamily;if(id)client()?.recordExposure(id,{...context});},1000));}
  }
 },{threshold:[0,.5,1]});
 for(const element of root.querySelectorAll('[data-analytics-family]'))observer.observe(element);
 const onHidden=()=>{if(document.hidden){for(const timer of timers.values())clearTimeout(timer);timers.clear();}else{for(const element of root.querySelectorAll('[data-analytics-family]')){observer.unobserve(element);observer.observe(element);}}};
 document.addEventListener('visibilitychange',onHidden);
 const engine=client();let connected=engine?.status().connected??false;
 const unsubscribe=engine?.subscribe(()=>{const next=engine.status().connected;if(next&&!connected)onHidden();connected=next;});
 return()=>{observer.disconnect();for(const timer of timers.values())clearTimeout(timer);document.removeEventListener('visibilitychange',onHidden);unsubscribe?.();};
}
