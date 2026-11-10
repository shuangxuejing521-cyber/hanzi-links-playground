import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ANALYTICS_DISABLED_KEY,NetlifyAnalyticsPreference} from '../src/analytics/netlify-client.ts';
import {GoatCounterRelay,type GoatCounterData} from '../src/analytics/goatcounter.ts';

function storage(){
 const data=new Map<string,string>();
 return {data,getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};
}

test('Netlify optout uses the existing preference and creates no visitor/session identifiers',()=>{
 const local=storage();local.setItem(ANALYTICS_DISABLED_KEY,'1');
 const preference=new NetlifyAnalyticsPreference(local);
 assert.deepEqual(preference.status(),{enabled:false,connected:false,pending:0,state:'disabled'});
 preference.setEnabled(true);assert.equal(local.data.size,0);
 preference.setEnabled(false);assert.deepEqual([...local.data],[[ANALYTICS_DISABLED_KEY,'1']]);
});

test('disabling clears queued GoatCounter clicks and resuming does not replay disabled activity',()=>{
 const preference=new NetlifyAnalyticsPreference(storage());let ready=false;
 const calls:GoatCounterData[]=[];
 const relay=new GoatCounterRelay({status:()=>preference.status(),page:()=>({path:'/',title:'字有意思'}),counter:()=>ready?{count:data=>{calls.push(data);}}:undefined});
 const unsubscribe=preference.subscribe(()=>relay.sync());
 relay.click('词语','启用前点击');preference.setEnabled(false);relay.click('部首','氵');
 ready=true;preference.setEnabled(true);relay.click('汉字','学');unsubscribe();
 assert.deepEqual(calls.map(call=>call.path),['/','click/汉字/学']);
});

test('a storage error does not undo a current-visit optout; cross-tab preference updates notify subscribers',()=>{
 const unavailable={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');},removeItem:()=>{throw new Error('blocked');}};
 const preference=new NetlifyAnalyticsPreference(unavailable);let updates=0;
 const unsubscribe=preference.subscribe(()=>{updates++;});
 preference.setEnabled(false);assert.equal(preference.status().enabled,false);
 preference.setEnabled(true);assert.equal(preference.status().enabled,true);
 preference.applyStorageValue('1');assert.equal(preference.status().enabled,false);
 unsubscribe();preference.applyStorageValue(null);assert.equal(updates,3);
});

test('the static adapter and founder access never request private APIs or claim a server save',()=>{
 const client=readFileSync(new URL('../src/analytics/netlify-client.ts',import.meta.url),'utf8');
 const notice=readFileSync(new URL('../src/analytics/NetlifyAnalyticsNotice.tsx',import.meta.url),'utf8');
 const founder=readFileSync(new URL('../src/analytics/NetlifyFounderAccess.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(client+founder,/fetch\s*\(|\/api\/|oai-authenticated|crypto\.randomUUID|document\.cookie/);
 assert.doesNotMatch(notice,/서버에 저장|동기화 대기|status\.pending/);
 assert.match(notice,/https:\/\/ziyouyisi\.goatcounter\.com\//);
 assert.match(notice,/https:\/\/hanzi-links-playground\.jazzybay4\.chatgpt\.site\/admin/);
});
