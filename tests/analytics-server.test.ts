import test from 'node:test';
import assert from 'node:assert/strict';
import {adminIdentity,parseFilters,validateEventBatch,csvCell} from '../lib/analytics-core.ts';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {appendEvents,readSummary,exportEventPage,type AnalyticsDb,type Statement} from '../lib/analytics-store.ts';
import type {AnalyticsEvent} from '../src/analytics/contracts';

const session='2a0bcf94-281c-4d8b-b32f-9899a7d43f8e';
const now=Date.parse('2026-11-07T07:00:00.000Z');
const event={id:'5aa02641-046d-43d9-a2cb-02490b234062',sessionId:session,name:'radical_click',occurredAt:new Date(now).toISOString(),mode:'explore',familyId:'water',source:'click'};

test('founder access fails closed and never depends on being first to sign in',()=>{
 assert.deepEqual(adminIdentity(null,''),{signedIn:false,founder:false,founderConfigured:false});
 assert.equal(adminIdentity('first-user','').founder,false);
 assert.equal(adminIdentity('owner','["owner"]')?.founder,true);
 assert.equal(adminIdentity('other','owner,second-owner').founder,false);
 assert.equal(adminIdentity('owner','not-valid-json[').founder,false);
});
test('Korean calendar filters are inclusive and reject invalid or unbounded input',()=>{
 const f=parseFilters(new URLSearchParams('from=2026-11-06&to=2026-11-07&level=7&mode=challenge'),now);
 assert.equal(f.fromUtc,'2026-11-05T15:00:00.000Z');
 assert.equal(f.untilUtc,'2026-11-07T15:00:00.000Z');
 assert.equal(f.level,7);assert.equal(f.mode,'challenge');
 assert.throws(()=>parseFilters(new URLSearchParams('from=2026-02-30&to=2026-11-07'),now));
 assert.throws(()=>parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-06'),now));
 assert.throws(()=>parseFilters(new URLSearchParams('mode=admin'),now));
 assert.throws(()=>parseFilters(new URLSearchParams('to=garbage'),now),(e:any)=>e.status===400);
 assert.throws(()=>parseFilters(new URLSearchParams('course=not-a-corpus'),now));
});
test('events accept known action data while rejecting spoofed sessions, arbitrary text and overlarge batches',()=>{
 assert.equal(validateEventBatch([event],session,now)[0].familyId,'water');
 assert.throws(()=>validateEventBatch([{...event,sessionId:'other'}],session,now));
 assert.throws(()=>validateEventBatch([{...event,email:'student@example.com'}],session,now));
 assert.throws(()=>validateEventBatch([{...event,value:'my-name@example.com'}],session,now));
 assert.throws(()=>validateEventBatch([{...event,name:'arbitrary'}],session,now));
 assert.throws(()=>validateEventBatch(Array.from({length:51},()=>event),session,now));
 assert.throws(()=>validateEventBatch([{...event,activeMs:999999}],session,now));
 assert.throws(()=>validateEventBatch([{...event,occurredAt:'2030-01-01'}],session,now));
 const attempt={...event,name:'practice_attempt',trialId:'trial-one',attemptNo:1,result:'correct',mode:'challenge'};
 assert.throws(()=>validateEventBatch([attempt],session,now),'a client correct claim without target and parts must never count');
 assert.throws(()=>validateEventBatch([{...attempt,characterId:'char-6cb9',firstPart:'氵'}],session,now));
 assert.throws(()=>validateEventBatch([{...attempt,characterId:'char-not-real',firstPart:'氵',secondPart:'由'}],session,now));
 assert.throws(()=>validateEventBatch([{...event,name:'practice_start',trialId:'trial-one'}],session,now));
});
test('mode clicks require a known destination without treating initial views as clicks',()=>{
 const click={...event,name:'mode_click',mode:'challenge',source:'navigation'};
 assert.equal(validateEventBatch([click],session,now)[0].mode,'challenge');
 assert.throws(()=>validateEventBatch([{...click,mode:undefined}],session,now));
 assert.throws(()=>validateEventBatch([{...click,mode:'admin'}],session,now));
 assert.equal(validateEventBatch([{...event,name:'mode_view',source:'initial'}],session,now)[0].name,'mode_view');
});
test('registered dictionary families accept views, clicks and impressions while retaining legacy IDs',()=>{
 for(const familyId of ['dict-1','dict-74'])for(const name of ['radical_view','radical_click','radical_impression']){
  assert.equal(validateEventBatch([{...event,name,familyId}],session,now)[0].familyId,familyId);
 }
 for(const familyId of ['water','person','hand','mouth','wood','speech','heart','woman','thread','sun','eye','body','earth','metal','food','animal','ice','fire','rice','ritual','clothes','foot','jade','insect','vehicle','stone']){
  assert.equal(validateEventBatch([{...event,familyId}],session,now)[0].familyId,familyId);
 }
 for(const familyId of ['dict-0','dict-215','dict-999','dict-130','dict-15','74','unknown']){
  assert.throws(()=>validateEventBatch([{...event,familyId}],session,now));
 }
 for(const name of ['radical_view','radical_click','radical_impression']){
  assert.throws(()=>validateEventBatch([{...event,name,familyId:undefined}],session,now));
 }
});
test('CSV escaping protects formula-like values and preserves Korean commas and quotes',()=>{
 assert.equal(csvCell('=SUM(A1:A3)'),"' =SUM(A1:A3)".replace("' ","'"));
 assert.equal(csvCell('말, "물"'),'"말, ""물"""');
 assert.equal(csvCell(0),'0');assert.equal(csvCell(null),'');
});

function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../drizzle/0000_daily_purifiers.sql',import.meta.url),'utf8'));
 const db:AnalyticsDb={prepare(sql:string):Statement{let values:unknown[]=[];const statement:Statement={bind(...bound:unknown[]){values=bound;return statement;},async first<T>(){return sqlite.prepare(sql).get(...values as never[]) as T??null;},async all<T>(){return {results:sqlite.prepare(sql).all(...values as never[]) as T[]};},async run(){return sqlite.prepare(sql).run(...values as never[]);}};return statement;},async batch(statements:Statement[]){return Promise.all(statements.map(s=>s.run()));}};
 sqlite.prepare('INSERT INTO analytics_visitors(id,created_at,last_seen_at) VALUES(?,?,?)').run('visitor',new Date(now).toISOString(),new Date(now).toISOString());
 sqlite.prepare('INSERT INTO analytics_sessions(id,visitor_id,created_at,last_seen_at,rate_window) VALUES(?,?,?,?,?)').run(session,'visitor',new Date(now).toISOString(),new Date(now).toISOString(),'2026-11-07T07:00');
 return {db,sqlite};
}
test('real SQL deduplicates uploads, excludes founder traffic and keeps free composition outside quiz scores',async()=>{
 const {db,sqlite}=fixture();
 const row=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(session).first<any>();
 const make=(id:string,fields:Partial<AnalyticsEvent>):AnalyticsEvent=>({...event,id,...fields}) as AnalyticsEvent;
 const events=[
  make('default-view',{name:'radical_view',familyId:'thread',source:'initial'}),
  make('water-click-one',{}),
  make('quiz-first',{name:'practice_attempt',mode:'challenge',trialId:'trial-one',attemptNo:1,result:'correct',characterId:'char-6cb9',firstPart:'氵',secondPart:'永'}),
  make('quiz-retry',{name:'practice_attempt',mode:'challenge',trialId:'trial-one',attemptNo:2,result:'correct',characterId:'char-6cb9',firstPart:'氵',secondPart:'由'}),
  make('free-compose',{name:'composition_submit',mode:'lab',result:'uncollected'}),
 ];
 await appendEvents(db,row,events,new Date(now).toISOString());
 await appendEvents(db,row,[events[1]],new Date(now).toISOString());
 const summary=await readSummary(db,parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07'),now));
 assert.equal(summary.totals.events,5);
 assert.equal(summary.totals.attempts,2);
 assert.equal(summary.totals.freeCompositions,1);
 assert.equal(summary.totals.retryAttempts,1);
 assert.equal(summary.totals.firstAttempts,1);
 assert.equal(summary.totals.firstCorrect,0,'server must recompute incorrect first composition rather than trust client result');
 assert.equal(summary.radicals.find(r=>r.id==='thread')?.clicks,0);
 const water=summary.radicals.find(r=>r.id==='water')!;
 assert.equal(water.clicks,1);assert.equal(water.visibleSessions,1);assert.equal(water.ctr,1);
 assert.equal((await exportEventPage(db,parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07'),now),0)).length,5);
 sqlite.prepare('UPDATE analytics_sessions SET excluded=1 WHERE id=?').run(session);
 const excluded=await readSummary(db,parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07'),now));
 assert.equal(excluded.totals.events,0);assert.equal(excluded.totals.visitors,0);
 sqlite.close();
});
test('course and level filters keep legacy five separate from official five in summary and raw export',async()=>{
 const {db,sqlite}=fixture();
 const row=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(session).first<any>();
 await appendEvents(db,row,[
  {...event,id:'legacy-five',course:'legacy5',level:5} as AnalyticsEvent,
  {...event,id:'official-five',course:'official',level:5} as AnalyticsEvent,
 ],new Date(now).toISOString());
 const filters=parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07&level=5&course=legacy5'),now);
 assert.equal((await readSummary(db,filters)).totals.events,1);
 const rows=await exportEventPage(db,filters,0);assert.equal(rows.length,1);assert.equal(rows[0].course,'legacy5');
 sqlite.close();
});
test('real SQL ranks new dictionary families, deduplicates uploads and separates moon from body',async()=>{
 const {db,sqlite}=fixture();
 try{
  const row=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(session).first<any>();
  const make=(id:string,name:string,familyId:string):AnalyticsEvent=>({...event,id,name,familyId,course:'official',level:3}) as AnalyticsEvent;
  const click=make('dictionary-click-one','radical_click','dict-1');
  await appendEvents(db,row,[
   make('dictionary-impression','radical_impression','dict-1'),
   make('dictionary-auto-view','radical_view','dict-1'),click,
   make('dictionary-click-two','radical_click','dict-1'),
   make('moon-impression','radical_impression','dict-74'),
   make('moon-auto-view','radical_view','dict-74'),
   make('moon-click','radical_click','dict-74'),
   make('body-click','radical_click','body'),make('water-click','radical_click','water'),
   make('ice-auto-view','radical_view','ice'),
  ],new Date(now).toISOString());
  await appendEvents(db,row,[click],new Date(now).toISOString());
  sqlite.prepare('INSERT INTO analytics_visitors(id,created_at,last_seen_at) VALUES(?,?,?)').run('second-visitor',new Date(now).toISOString(),new Date(now).toISOString());
  const second='second-session';
  sqlite.prepare('INSERT INTO analytics_sessions(id,visitor_id,created_at,last_seen_at,rate_window) VALUES(?,?,?,?,?)').run(second,'second-visitor',new Date(now).toISOString(),new Date(now).toISOString(),'2026-11-07T07:00');
  const secondRow=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(second).first<any>();
  await appendEvents(db,secondRow,[{...make('dictionary-second-exposure','radical_impression','dict-1'),sessionId:second}],new Date(now).toISOString());
  const filters=parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07'),now);
  const summary=await readSummary(db,filters);
  assert.equal(summary.radicals.length,206);
  assert.equal(summary.radicals[0].id,'dict-1');
  assert.deepEqual(summary.radicals.find(r=>r.id==='dict-1'),{id:'dict-1',form:'一',name:'一部',korean:'한 일',clicks:2,visitors:1,visibleSessions:2,clickSessions:1,ctr:.5,characters:30});
  const moon=summary.radicals.find(r=>r.id==='dict-74'),body=summary.radicals.find(r=>r.id==='body');
  assert.equal(moon?.clicks,1);assert.equal(moon?.characters,9);assert.equal(moon?.name,'月部');
  assert.equal(body?.clicks,1);assert.equal(body?.characters,67);assert.equal(body?.name,'月字旁（肉）');
  assert.equal(summary.radicals.find(r=>r.id==='water')?.characters,171);
  const ice=summary.radicals.find(r=>r.id==='ice');
  assert.equal(ice?.clicks,0);assert.equal(ice?.visibleSessions,0);assert.equal(ice?.ctr,null);assert.equal(ice?.characters,18);
  assert.equal(summary.totals.events,11);assert.equal(summary.totals.radicalClicks,5);
  assert.ok(summary.recent.some(r=>r.familyId==='dict-1'));
  assert.ok(summary.paths.some(r=>r.from==='family:dict-1'&&r.to==='family:dict-74'));
  assert.equal((await exportEventPage(db,filters,0)).filter(r=>r.family_id==='dict-1').length,5);
 }finally{sqlite.close();}
});
test('new dictionary family rankings honor filters and include zero-data categories safely',async()=>{
 const {db,sqlite}=fixture();
 try{
  const row=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(session).first<any>();
  await appendEvents(db,row,[
   {...event,id:'dictionary-official-click',familyId:'dict-1',course:'official',level:3},
   {...event,id:'dictionary-legacy-click',familyId:'dict-1',course:'legacy5',level:5},
   {...event,id:'dictionary-other-mode',familyId:'dict-1',course:'official',level:3,mode:'lab'},
   {...event,id:'dictionary-old-click',familyId:'dict-1',course:'official',level:3,occurredAt:'2026-11-05T07:00:00.000Z'},
  ] as AnalyticsEvent[],new Date(now).toISOString());
  const filters=parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07&course=official&level=3&mode=explore'),now);
  const summary=await readSummary(db,filters);
  assert.equal(summary.radicals.find(r=>r.id==='dict-1')?.clicks,1);assert.equal(summary.totals.radicalClicks,1);
  assert.equal((await exportEventPage(db,filters,0)).length,1);
  const empty=await readSummary(db,parseFilters(new URLSearchParams('from=2026-11-06&to=2026-11-06'),now));
  assert.equal(empty.radicals.length,206);
  assert.ok(empty.radicals.every(r=>r.clicks===0&&r.visitors===0&&r.visibleSessions===0&&r.clickSessions===0&&r.ctr===null));
  assert.equal(empty.totals.radicalClicks,0);assert.deepEqual(empty.recent,[]);
 }finally{sqlite.close();}
});
test('mode rankings count explicit clicks separately, deduplicate retries and preserve destination in recent events',async()=>{
 const {db,sqlite}=fixture();
 try{
  const row=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(session).first<any>();
  const make=(id:string,name:string,mode:string,details:Partial<AnalyticsEvent>={}):AnalyticsEvent=>({...event,id,name,mode,...details}) as AnalyticsEvent;
  const clicks=[make('lab-click-one','mode_click','lab'),make('lab-click-two','mode_click','lab'),make('challenge-click','mode_click','challenge')];
  await appendEvents(db,row,[
   make('initial-explore','mode_view','explore',{source:'initial'}),
   make('repeat-explore','mode_view','explore'),
   make('third-explore','mode_view','explore'),
   ...clicks,
   make('lab-mode-view','mode_view','lab'),
   make('challenge-view','mode_view','challenge'),
   make('lab-active-time','active_time','lab',{activeMs:1000}),
  ],new Date(now).toISOString());
  await appendEvents(db,row,[clicks[0]],new Date(now).toISOString());
  const summary=await readSummary(db,parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07'),now));
  assert.deepEqual(summary.modes,[
   {mode:'lab',views:1,clicks:2,activeMs:1000},
   {mode:'challenge',views:1,clicks:1,activeMs:0},
   {mode:'explore',views:3,clicks:0,activeMs:0},
  ]);
  assert.equal(summary.totals.events,9);
  assert.equal(summary.recent.find(r=>r.name==='mode_click'&&r.mode==='challenge')?.mode,'challenge');
 }finally{sqlite.close();}
});
test('mode click rankings honor date, course, level and destination filters and return safe empty results',async()=>{
 const {db,sqlite}=fixture();
 try{
  const row=await db.prepare('SELECT * FROM analytics_sessions WHERE id=?').bind(session).first<any>();
  await appendEvents(db,row,[
   {...event,id:'official-lab-one',name:'mode_click',mode:'lab',course:'official',level:2},
   {...event,id:'legacy-lab-one',name:'mode_click',mode:'lab',course:'legacy5',level:5},
   {...event,id:'official-quiz-one',name:'mode_click',mode:'challenge',course:'official',level:2},
   {...event,id:'official-lab-old',name:'mode_click',mode:'lab',course:'official',level:2,occurredAt:'2026-11-05T07:00:00.000Z'},
  ] as AnalyticsEvent[],new Date(now).toISOString());
  const summary=await readSummary(db,parseFilters(new URLSearchParams('from=2026-11-07&to=2026-11-07&level=2&course=official&mode=lab'),now));
  assert.deepEqual(summary.modes,[{mode:'lab',views:0,clicks:1,activeMs:0}]);
  const empty=await readSummary(db,parseFilters(new URLSearchParams('from=2026-11-06&to=2026-11-06'),now));
  assert.deepEqual(empty.modes,[]);
  assert.deepEqual(empty.recent,[]);
  assert.equal(empty.totals.events,0);
 }finally{sqlite.close();}
});
