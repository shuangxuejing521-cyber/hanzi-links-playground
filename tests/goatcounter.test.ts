import test from 'node:test';
import assert from 'node:assert/strict';
import {GoatCounterRelay,type GoatCounterData} from '../src/analytics/goatcounter.ts';

function fixture(){
 let enabled=true,connected=false,ready=false,pathname='/',now=0;
 const calls:GoatCounterData[]=[];
 const relay=new GoatCounterRelay({
  status:()=>({enabled,connected}),
  page:()=>({path:pathname,title:'字有意思'}),
  counter:()=>ready?{count:(data)=>{calls.push(data);}}:undefined,
  now:()=>now,
 });
 return {relay,calls,setStatus:(e:boolean,c:boolean)=>{enabled=e;connected=c;},setReady:()=>{ready=true;},setPath:(v:string)=>{pathname=v;},setNow:(v:number)=>{now=v;}};
}

test('waits for both script readiness and allowed session; records a pageview once before queued clicks',()=>{
 const f=fixture();f.relay.click('部首','氵');f.relay.sync();assert.deepEqual(f.calls,[]);
 f.setReady();f.relay.sync();assert.deepEqual(f.calls,[]);
 f.setStatus(true,true);f.relay.sync();f.relay.sync();
 assert.deepEqual(f.calls,[{path:'/',title:'字有意思'},{path:'click/部首/氵',title:'氵',event:true,no_session:true}]);
});

test('intentional repeat clicks remain distinct across all three categories',()=>{
 const f=fixture();f.setReady();f.setStatus(true,true);f.relay.sync();
 f.relay.click('部首','氵');f.relay.click('汉字','汉');f.relay.click('词语','汉语');f.relay.click('词语','汉语');
 assert.deepEqual(f.calls.slice(1).map(c=>c.path),['click/部首/氵','click/汉字/汉','click/词语/汉语','click/词语/汉语']);
 assert.ok(f.calls.slice(1).every(c=>c.event&&c.no_session));
});

test('founder exclusion and optout clear startup clicks; resuming never replays disabled activity',()=>{
 const f=fixture();f.relay.click('词语','旧记录');
 f.setStatus(false,false);f.relay.sync();f.relay.click('汉字','禁');
 f.setReady();f.setStatus(true,true);f.relay.sync();f.relay.click('词语','新记录');
 assert.deepEqual(f.calls.map(c=>c.path),['/','click/词语/新记录']);
});

test('never sends pageviews or clicks on private admin paths',()=>{
 const f=fixture();f.setReady();f.setStatus(true,true);f.setPath('/admin');
 f.relay.sync();f.relay.click('汉字','秘');f.setPath('/admin/export');f.relay.sync();
 assert.deepEqual(f.calls,[]);
});

test('a blocked or throwing third-party tracker cannot break learning; pending clicks stay bounded and expire',()=>{
 const f=fixture();for(let i=0;i<120;i++)f.relay.click('词语',`词${i}`);
 f.setReady();f.setStatus(true,true);f.relay.sync();assert.equal(f.calls.length,101);
 assert.equal(f.calls[1].title,'词20');
 const expired=fixture();expired.relay.click('汉字','旧');expired.setNow(60001);expired.setReady();expired.setStatus(true,true);expired.relay.sync();
 assert.equal(expired.calls.length,1);
 const relay=new GoatCounterRelay({status:()=>({enabled:true,connected:true}),page:()=>({path:'/',title:'x'}),counter:()=>({count:()=>{throw new Error('blocked');}})});
 assert.doesNotThrow(()=>{relay.sync();relay.click('汉字','学');});
});
