import type {AnalyticsEvent,EventName} from './contracts';

type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
type Context=Partial<Omit<AnalyticsEvent,'id'|'sessionId'|'name'|'occurredAt'>>;
export const ANALYTICS_DISABLED_KEY='hanzi-analytics-disabled';
type Status={enabled:boolean;connected:boolean;pending:0;state:'ready'|'disabled'};

/** Netlify has no Sites identity or D1 session. This preference only permits anonymous GoatCounter delivery. */
export class NetlifyAnalyticsPreference{
 private enabled=true;
 private listeners=new Set<()=>void>();
 constructor(private store?:Store){
  try{this.enabled=store?.getItem(ANALYTICS_DISABLED_KEY)!=='1';}catch{/* Storage is optional; a choice still applies to this visit. */}
 }
 status():Status{return {enabled:this.enabled,connected:this.enabled,pending:0,state:this.enabled?'ready':'disabled'};}
 subscribe(listener:()=>void){this.listeners.add(listener);return()=>{this.listeners.delete(listener);};}
 private notify(){for(const listener of this.listeners)listener();}
 setEnabled(enabled:boolean){
  this.enabled=enabled;
  try{if(enabled)this.store?.removeItem(ANALYTICS_DISABLED_KEY);else this.store?.setItem(ANALYTICS_DISABLED_KEY,'1');}catch{/* Keep the in-memory choice when persistence is unavailable. */}
  this.notify();
 }
 applyStorageValue(value:string|null){this.enabled=value!=='1';this.notify();}
}

let preference:NetlifyAnalyticsPreference|undefined,installed=false;
function client(){
 if(typeof window==='undefined'||window.location.pathname.startsWith('/admin'))return undefined;
 if(!preference){
  let local:Store|undefined;try{local=window.localStorage;}catch{}
  preference=new NetlifyAnalyticsPreference(local);
 }
 return preference;
}
export function analyticsStatus():Status{return client()?.status()??{enabled:false,connected:false,pending:0,state:'disabled'};}
export function subscribeAnalyticsStatus(listener:()=>void){return client()?.subscribe(listener)??(()=>{});}
export function startAnalytics(){
 const current=client();if(!current||installed)return;
 installed=true;
 window.addEventListener('storage',event=>{if(event.key===ANALYTICS_DISABLED_KEY)current.applyStorageValue(event.newValue);});
}
export async function setAnalyticsEnabled(enabled:boolean){client()?.setEnabled(enabled);startAnalytics();}

/** No browser identifier is created by this adapter. Kept only for import compatibility. */
export async function resetAnalyticsIdentity(){}

// Existing research/practice events remain in the original private backend's history.
// The separate Netlify site sends only pageviews and explicit card clicks through GoatCounterRelay.
export function setAnalyticsContext(_next:Context){}
export function track(_name:EventName,_details:Context={}){}
export function trackView(_name:EventName,_details:Context={},_key=''){}
export function trackOnce(_name:EventName,_details:Context,_key:string){}
export function observeRadicalImpressions(_root:Element){return()=>{};}
