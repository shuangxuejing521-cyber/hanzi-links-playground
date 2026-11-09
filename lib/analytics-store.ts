import type {AnalyticsEvent,AnalyticsSummary} from '../src/analytics/contracts';
import {AnalyticsError,type AnalyticsFilters} from './analytics-core';
import {sidebarFamilies} from '../src/lib/sidebar-families';
import characters from '../src/data/characters.json';

export interface Statement{bind(...values:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[]}>;run():Promise<unknown>}
export interface AnalyticsDb{prepare(sql:string):Statement;batch(statements:Statement[]):Promise<unknown[]>}
export interface SessionRow{id:string;visitor_id:string;created_at:string;last_seen_at:string;revoked_at:string|null;excluded:number;rate_window:string;rate_count:number}
const canonicalCharacters=new Map(characters.map(c=>[c.id,c]));
const numeric=(v:unknown)=>Number(v)||0;

export async function appendEvents(db:AnalyticsDb,session:SessionRow,events:AnalyticsEvent[],now:string):Promise<void>{
 for(const event of events)if(event.name==='practice_attempt'&&(!event.characterId||!canonicalCharacters.has(event.characterId)||!event.firstPart||!event.secondPart))throw new AnalyticsError('作答事件缺少有效目标或部件。');
 const window=now.slice(0,16);
 const slot=await db.prepare(`UPDATE analytics_sessions SET rate_window=?,rate_count=CASE WHEN rate_window=? THEN rate_count+? ELSE ? END,last_seen_at=? WHERE id=? AND visitor_id=? AND revoked_at IS NULL AND excluded=0 AND (rate_window<>? OR rate_count+?<=120) RETURNING id`).bind(window,window,events.length,events.length,now,session.id,session.visitor_id,window,events.length).first();
 if(!slot)throw new AnalyticsError('统计请求过于频繁，请稍后重试。',429);
 const inserts=events.map(event=>{
  let result=event.result;
  if(event.name==='practice_attempt'){
   const target=canonicalCharacters.get(event.characterId!);
   const found=characters.find(c=>c.firstPart===event.firstPart&&c.secondPart===event.secondPart);
   result=!found?'uncollected':target?.id===found.id?'correct':'incorrect';
  }
  return db.prepare(`INSERT INTO analytics_events (id,session_id,visitor_id,name,occurred_at,received_at,mode,course,level,word_range,family_id,character_id,word_id,trial_id,attempt_no,result,hint_used,active_ms,source,first_part,second_part,value,event_count,app_version,instrument_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'auto-analytics-v1','1') ON CONFLICT(id) DO NOTHING`).bind(event.id,session.id,session.visitor_id,event.name,event.occurredAt,now,event.mode??null,event.course??null,event.level??null,event.range??null,event.familyId??null,event.characterId??null,event.wordId??null,event.trialId??null,event.attemptNo??null,result??null,event.hintUsed===undefined?null:event.hintUsed?1:0,event.activeMs??null,event.source??null,event.firstPart??null,event.secondPart??null,event.value??null,event.count??null);
 });
 if(inserts.length)await db.batch(inserts);
 await db.prepare('UPDATE analytics_visitors SET last_seen_at=? WHERE id=?').bind(now,session.visitor_id).run();
}
export function filteredQuery(filters:AnalyticsFilters):{sql:string;values:unknown[]}{
 const clauses=['e.occurred_at>=?','e.occurred_at<?','s.excluded=0'];
 const values:unknown[]=[filters.fromUtc,filters.untilUtc];
 if(filters.level!==undefined){clauses.push('e.level=?');values.push(filters.level);}
 if(filters.mode){clauses.push('e.mode=?');values.push(filters.mode);}
 if(filters.course){clauses.push('e.course=?');values.push(filters.course);}
 return {sql:`SELECT e.*,e.rowid AS event_order FROM analytics_events e INNER JOIN analytics_sessions s ON s.id=e.session_id WHERE ${clauses.join(' AND ')}`,values};
}
const firstCte=`ranked AS (SELECT *,ROW_NUMBER() OVER(PARTITION BY session_id,trial_id ORDER BY attempt_no,occurred_at,event_order) AS rn FROM filtered WHERE name='practice_attempt' AND trial_id IS NOT NULL)`;
export async function readSummary(db:AnalyticsDb,filters:AnalyticsFilters):Promise<AnalyticsSummary>{
 const query=filteredQuery(filters);
 const all=async(sql:string)=>(await db.prepare(`WITH filtered AS (${query.sql}),${firstCte} ${sql}`).bind(...query.values).all<Record<string,unknown>>()).results;
 const [totalsRows,radicalRows,dailyRows,modeRows,charRows,wordRows,pathRows,recentRows]=await Promise.all([
  all(`SELECT COUNT(DISTINCT visitor_id) visitors,COUNT(DISTINCT session_id) sessions,COUNT(*) events,COALESCE(SUM(CASE WHEN name='active_time' THEN active_ms ELSE 0 END),0) activeMs,SUM(name='radical_click') radicalClicks,SUM(name='practice_attempt') attempts,SUM(name='composition_submit') freeCompositions,SUM(name='practice_attempt' AND attempt_no>1) retryAttempts,(SELECT COUNT(*) FROM ranked WHERE rn=1 AND attempt_no=1 AND COALESCE(hint_used,0)=0) firstAttempts,(SELECT COUNT(*) FROM ranked WHERE rn=1 AND attempt_no=1 AND COALESCE(hint_used,0)=0 AND result='correct') firstCorrect,SUM(name IN ('practice_attempt','composition_submit') AND result='uncollected') uncollected FROM filtered`),
  all(`SELECT family_id id,SUM(name='radical_click') clicks,COUNT(DISTINCT CASE WHEN name='radical_click' THEN visitor_id END) visitors,COUNT(DISTINCT CASE WHEN name IN ('radical_impression','radical_click') THEN session_id END) visibleSessions,COUNT(DISTINCT CASE WHEN name='radical_click' THEN session_id END) clickSessions FROM filtered WHERE family_id IS NOT NULL GROUP BY family_id`),
  all(`SELECT date(occurred_at,'+9 hours') date,COUNT(DISTINCT visitor_id) visitors,COUNT(DISTINCT session_id) sessions,SUM(name='radical_click') clicks,SUM(name='practice_attempt') attempts,SUM(name='practice_attempt' AND result='correct') correct,SUM(CASE WHEN name='active_time' THEN active_ms ELSE 0 END) activeMs FROM filtered GROUP BY date ORDER BY date`),
  all(`SELECT mode,SUM(name='mode_view') views,SUM(name='mode_click') clicks,SUM(CASE WHEN name='active_time' THEN active_ms ELSE 0 END) activeMs FROM filtered WHERE mode IS NOT NULL GROUP BY mode ORDER BY clicks DESC,views DESC,mode`),
  all(`SELECT character_id id,SUM(name='character_view') views,COUNT(DISTINCT CASE WHEN name='character_view' THEN visitor_id END) visitors,SUM(name='practice_attempt') attempts,(SELECT COUNT(*) FROM ranked r WHERE r.character_id=f.character_id AND r.rn=1 AND r.attempt_no=1 AND COALESCE(r.hint_used,0)=0 AND r.result='correct') firstCorrect FROM filtered f WHERE character_id IS NOT NULL GROUP BY character_id ORDER BY views DESC,attempts DESC LIMIT 30`),
  all(`SELECT word_id id,COUNT(*) views,COUNT(DISTINCT visitor_id) visitors FROM filtered WHERE name='word_view' AND word_id IS NOT NULL GROUP BY word_id ORDER BY views DESC LIMIT 30`),
  all(`SELECT previous AS "from",node AS "to",COUNT(*) count FROM (SELECT node,LAG(node) OVER(PARTITION BY session_id ORDER BY occurred_at,event_order) previous FROM (SELECT session_id,occurred_at,event_order,CASE name WHEN 'mode_view' THEN 'mode:'||mode WHEN 'radical_click' THEN 'family:'||family_id WHEN 'character_view' THEN 'character:'||character_id WHEN 'word_view' THEN 'word:'||word_id END node FROM filtered WHERE name IN ('mode_view','radical_click','character_view','word_view'))) WHERE previous IS NOT NULL AND node IS NOT NULL AND previous<>node GROUP BY previous,node ORDER BY count DESC LIMIT 30`),
  all(`SELECT occurred_at at,name,mode,substr(visitor_id,1,12) visitorLabel,session_id sessionId,family_id familyId,character_id characterId,word_id wordId,result FROM filtered ORDER BY occurred_at DESC,event_order DESC LIMIT 40`),
 ]);
 const total=totalsRows[0]??{};
 const radicalMap=new Map(radicalRows.map(row=>[row.id,row]));
 return {
  range:{from:filters.from,to:filters.to},
  totals:Object.fromEntries(['visitors','sessions','events','activeMs','radicalClicks','attempts','firstAttempts','firstCorrect','uncollected','freeCompositions','retryAttempts'].map(key=>[key,numeric(total[key])])) as unknown as AnalyticsSummary['totals'],
  radicals:sidebarFamilies.map(radical=>{const r=radicalMap.get(radical.id)??{};const visible=numeric(r.visibleSessions);return {id:radical.id,form:radical.form,name:radical.name,korean:radical.korean,clicks:numeric(r.clicks),visitors:numeric(r.visitors),visibleSessions:visible,clickSessions:numeric(r.clickSessions),ctr:visible?numeric(r.clickSessions)/visible:null,characters:radical.characters.length};}).sort((a,b)=>b.clicks-a.clicks),
  daily:dailyRows.map(r=>({date:String(r.date),visitors:numeric(r.visitors),sessions:numeric(r.sessions),clicks:numeric(r.clicks),attempts:numeric(r.attempts),correct:numeric(r.correct),activeMs:numeric(r.activeMs)})),
  modes:modeRows.map(r=>({mode:String(r.mode),views:numeric(r.views),clicks:numeric(r.clicks),activeMs:numeric(r.activeMs)})),
  characters:charRows.map(r=>({id:String(r.id),hanzi:canonicalCharacters.get(String(r.id))?.hanzi??String(r.id),views:numeric(r.views),visitors:numeric(r.visitors),attempts:numeric(r.attempts),firstCorrect:numeric(r.firstCorrect)})),
  words:wordRows.map(r=>({id:String(r.id),views:numeric(r.views),visitors:numeric(r.visitors)})),
  paths:pathRows.map(r=>({from:String(r.from),to:String(r.to),count:numeric(r.count)})),
  recent:recentRows.map(r=>({at:String(r.at),name:String(r.name),mode:r.mode as string|null,visitorLabel:`browser-${r.visitorLabel}`,sessionId:String(r.sessionId),familyId:r.familyId as string|null,characterId:r.characterId as string|null,wordId:r.wordId as string|null,result:r.result as string|null})),
 };
}
export async function exportSnapshot(db:AnalyticsDb):Promise<number>{return Number((await db.prepare('SELECT COALESCE(MAX(rowid),0) lastRow FROM analytics_events').first<{lastRow:number}>())?.lastRow??0);}
export async function exportEventPage(db:AnalyticsDb,filters:AnalyticsFilters,offset:number,snapshot=Number.MAX_SAFE_INTEGER):Promise<Record<string,unknown>[]>{
 const query=filteredQuery(filters);
 return (await db.prepare(`WITH filtered AS (${query.sql}) SELECT id,visitor_id browser_code,session_id,name,occurred_at,received_at,mode,course,level,word_range,family_id,character_id,word_id,trial_id,attempt_no,result,hint_used,active_ms,source,first_part,second_part,value,event_count,app_version,instrument_version FROM filtered WHERE event_order<=? ORDER BY occurred_at,event_order LIMIT 500 OFFSET ?`).bind(...query.values,snapshot,offset).all<Record<string,unknown>>()).results;
}
