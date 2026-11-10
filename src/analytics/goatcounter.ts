import {analyticsStatus,startAnalytics,subscribeAnalyticsStatus} from './client';

export type GoatCounterClickType='部首'|'汉字'|'词语';
export interface GoatCounterData{path:string;title:string;event?:boolean;no_session?:boolean}
interface Counter{count?:(data:GoatCounterData)=>void}
interface RelayOptions{
 status:()=>{enabled:boolean;connected:boolean};
 page:()=>{path:string;title:string};
 counter:()=>Counter|undefined;
 now?:()=>number;
}
declare global{interface Window{goatcounter?:Counter}}

const MAX_PENDING=100,MAX_AGE=60000;

/** Keep the external tracker behind the same founder exclusion and opt-out as our private analytics. */
export class GoatCounterRelay{
 private pageRecorded=false;
 private queue:Array<{data:GoatCounterData;at:number}>=[];
 constructor(private options:RelayOptions){}
 private time(){return this.options.now?.()??Date.now();}
 private allowed(){
  const status=this.options.status(),path=this.options.page().path;
  if(!status.enabled||path==='/admin'||path.startsWith('/admin/')){this.queue=[];return false;}
  return status.connected;
 }
 sync(){
  if(!this.allowed())return;
  const counter=this.options.counter();if(typeof counter?.count!=='function')return;
  if(!this.pageRecorded){
   this.pageRecorded=true;
   try{counter.count(this.options.page());}catch{/* Statistics must never interrupt learning. */}
  }
  const queue=this.queue;this.queue=[];
  for(const item of queue){
   if(this.time()-item.at>MAX_AGE||!this.allowed())continue;
   try{counter.count(item.data);}catch{/* Consume once rather than risk duplicate click events. */}
  }
 }
 click(type:GoatCounterClickType,text:string){
  if(!text)return;
  const status=this.options.status(),path=this.options.page().path;
  if(!status.enabled||path==='/admin'||path.startsWith('/admin/')){this.queue=[];return;}
  this.queue.push({data:{path:`click/${type}/${text}`,title:text,event:true,no_session:true},at:this.time()});
  if(this.queue.length>MAX_PENDING)this.queue.splice(0,this.queue.length-MAX_PENDING);
  this.sync();
 }
}

let relay:GoatCounterRelay|undefined;
function browserRelay(){
 if(typeof window==='undefined')return undefined;
 return relay??=new GoatCounterRelay({
  status:analyticsStatus,
  page:()=>({path:window.location.pathname,title:document.title}),
  counter:()=>window.goatcounter,
 });
}

export function trackGoatCounterClick(type:GoatCounterClickType,text:string){browserRelay()?.click(type,text);}

/** Script may finish before or after React; onload capture plus the initial check covers either order. */
export function startGoatCounterBridge(){
 const current=browserRelay();if(!current||window.location.pathname.startsWith('/admin'))return()=>{};
 const sync=()=>current.sync();
 const unsubscribe=subscribeAnalyticsStatus(sync);
 const onLoad=(event:Event)=>{if(event.target instanceof HTMLScriptElement&&event.target.id==='goatcounter-script')sync();};
 document.addEventListener('load',onLoad,true);
 startAnalytics();sync();
 return()=>{unsubscribe();document.removeEventListener('load',onLoad,true);};
}
