import test from 'node:test';
import assert from 'node:assert/strict';
import {AnalyticsClient,ForegroundClock} from '../src/analytics/client.ts';

const storage=()=>{const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};};
function fixture(){
 const local=storage(),session=storage(),calls:Array<{url:string;body:any}>=[];
 let fail=false,sequence=0;
 const client=new AnalyticsClient({local,session,now:()=>100000,id:()=>`event-${++sequence}`,send:async(url,body)=>{
  calls.push({url,body:structuredClone(body)});
  if(url.endsWith('/session'))return {sessionId:'server-session',enabled:true};
  if(url.endsWith('/events')&&fail)throw new Error('offline');
  return {ok:true};
 }});
 return {client,calls,local,session,setFail:(v:boolean)=>{fail=v;}};
}
test('failed uploads retry the same event identifiers and never exceed fifty records per batch',async()=>{
 const f=fixture();await f.client.start();f.setFail(true);
 for(let i=0;i<60;i++)f.client.record('radical_click',{familyId:'water'});
 await f.client.flush();const first=f.calls.filter(c=>c.url.endsWith('/events'))[0].body.events;
 assert.equal(first.length,50);assert.equal(f.client.status().pending,60);
 f.setFail(false);await f.client.flush();
 const retries=f.calls.filter(c=>c.url.endsWith('/events'));
 assert.deepEqual(retries[1].body.events.map((e:any)=>e.id),first.map((e:any)=>e.id));
 assert.equal(f.client.status().pending,0);
});
test('optout clears pending records and does not recreate a session until explicitly resumed',async()=>{
 const f=fixture();await f.client.start();f.client.record('word_view',{wordId:'hsk-1'});
 await f.client.setEnabled(false);const before=f.calls.length;
 f.client.record('radical_click',{familyId:'water'});await f.client.flush();await f.client.start();
 assert.equal(f.calls.length,before);assert.equal(f.client.status().pending,0);assert.equal(f.client.status().enabled,false);
 await f.client.setEnabled(true);f.client.record('radical_click',{familyId:'water'});await f.client.flush();
 assert.equal(f.client.status().enabled,true);assert.equal(f.calls.at(-1)?.body.events.length,1);
});
test('a rejected stored session is not reassigned to a new browser session',async()=>{
 const f=fixture();f.session.setItem('hanzi-analytics-pending-v1',JSON.stringify([{id:'old-event',sessionId:'expired-session',name:'word_view',occurredAt:'2026-11-07T00:00:00.000Z',wordId:'hsk-1'}]));
 f.session.setItem('hanzi-analytics-session-v1','expired-session');
 const client=new AnalyticsClient({local:f.local,session:f.session,now:()=>100000,id:()=> 'new-event',send:async(url,body)=>{
  f.calls.push({url,body});return url.endsWith('/session')?{sessionId:'different-session',enabled:true}:{ok:true};
 }});
 await client.start();client.record('mode_view',{mode:'explore'});await client.flush();
 const events=f.calls.filter(c=>c.url.endsWith('/events')).flatMap(c=>c.body.events);
 assert.deepEqual(events.map(e=>e.id),['new-event']);assert.ok(events.every(e=>e.sessionId==='different-session'));
});
test('exposure is once per family per session, while intentional repeated clicks remain distinct',async()=>{
 const f=fixture();await f.client.start();
 f.client.recordOnce('radical_impression',{familyId:'water'},'exposure-water');
 f.client.recordOnce('radical_impression',{familyId:'water'},'exposure-water');
 f.client.record('radical_click',{familyId:'water'});f.client.record('radical_click',{familyId:'water'});await f.client.flush();
 assert.deepEqual(f.calls.at(-1)?.body.events.map((e:any)=>e.name),['radical_impression','radical_click','radical_click']);
});
test('foreground time stops at the idle cutoff and excludes hidden-tab intervals',()=>{
 const clock=new ForegroundClock(0,true);
 assert.equal(clock.sample(30000,true),30000);
 assert.equal(clock.sample(90000,true),30000);
 clock.activity(100000);assert.equal(clock.sample(110000,true),10000);
 assert.equal(clock.sample(120000,false),10000);
 assert.equal(clock.sample(200000,false),0);
 assert.equal(clock.sample(210000,true),0);
 clock.activity(210000);assert.equal(clock.sample(215000,true),5000);
});
test('a live tab recovers an expired session without relabeling its old queued events',async()=>{
 const local=storage(),session=storage(),calls:Array<{url:string;body:any}>=[];let sessionCount=0,id=0;
 const client=new AnalyticsClient({local,session,now:()=>100000,id:()=>`fresh-${++id}`,send:async(url,body)=>{
  calls.push({url,body:structuredClone(body)});
  if(url.endsWith('/session'))return {sessionId:++sessionCount===1?'expired-live-session':'renewed-session',enabled:true};
  if(url.endsWith('/events')&&(body as any).sessionId==='expired-live-session')throw Object.assign(new Error('expired'),{status:409});
  return {accepted:1};
 }});
 await client.start();client.record('radical_click',{familyId:'water'});await client.flush();
 assert.equal(sessionCount,2);assert.equal(client.status().connected,true);assert.equal(client.status().pending,0);
 client.record('word_view',{wordId:'hsk-1'});await client.flush();
 const renewed=calls.filter(c=>c.url.endsWith('/events')&&c.body.sessionId==='renewed-session').flatMap(c=>c.body.events);
 assert.deepEqual(renewed.map(e=>e.id),['fresh-2']);
 assert.ok(renewed.every(e=>e.sessionId==='renewed-session'));
});
test('a server-side collection disable immediately clears queued data and stops future uploads',async()=>{
 const calls:Array<{url:string;body:any}>=[];let id=0;
 const client=new AnalyticsClient({local:storage(),session:storage(),now:()=>100000,id:()=>`id-${++id}`,send:async(url,body)=>{
  calls.push({url,body});return url.endsWith('/session')?{sessionId:'s1',enabled:true}:{enabled:false,accepted:0};
 }});
 await client.start();client.record('mode_view',{mode:'explore'});await client.flush();
 assert.equal(client.status().enabled,false);assert.equal(client.status().pending,0);
 const count=calls.length;client.record('radical_click',{familyId:'water'});await client.flush();assert.equal(calls.length,count);
});
test('radical exposure deduplication preserves separate grade, range and mode denominators',async()=>{
 const f=fixture();await f.client.start();
 const base={course:'official',level:1,range:'cumulative',mode:'explore'};
 f.client.recordExposure('water',base);f.client.recordExposure('water',base);
 f.client.recordExposure('water',{...base,level:2});
 f.client.recordExposure('water',{...base,mode:'challenge'});
 f.client.recordExposure('water',{...base,range:'level'});
 f.client.recordExposure('water',{...base,range:'level'});
 await f.client.flush();const events=f.calls.at(-1)?.body.events;
 assert.equal(events.length,4);assert.ok(events.every((e:any)=>e.name==='radical_impression'));
 assert.deepEqual(events.map((e:any)=>[e.level,e.range,e.mode]),[[1,'cumulative','explore'],[2,'cumulative','explore'],[1,'cumulative','challenge'],[1,'level','explore']]);
});
