export const EVENT_NAMES=['mode_view','mode_click','radical_view','radical_click','radical_impression','character_view','word_view','composition_submit','practice_start','practice_attempt','practice_complete','stage_select','trace_toggle','audio_play','favorite_toggle','search_result','active_time','panda_interaction','language_toggle','course_change'] as const;
export type EventName=typeof EVENT_NAMES[number];
export interface AnalyticsEvent{
 id:string;sessionId:string;name:EventName;occurredAt:string;mode?:string;course?:string;level?:number;range?:string;familyId?:string;characterId?:string;wordId?:string;trialId?:string;attemptNo?:number;result?:'correct'|'incorrect'|'found'|'uncollected';hintUsed?:boolean;activeMs?:number;source?:string;firstPart?:string;secondPart?:string;value?:string;count?:number;
}
export interface AnalyticsSummary{
 range:{from:string;to:string};
 totals:{visitors:number;sessions:number;events:number;activeMs:number;radicalClicks:number;attempts:number;firstAttempts:number;firstCorrect:number;uncollected:number;freeCompositions?:number;retryAttempts?:number};
 radicals:Array<{id:string;form:string;name:string;korean:string;clicks:number;visitors:number;visibleSessions:number;clickSessions:number;ctr:number|null;characters:number}>;
 daily:Array<{date:string;visitors:number;sessions:number;clicks:number;attempts:number;correct:number;activeMs:number}>;
 modes:Array<{mode:string;views:number;clicks:number;activeMs:number}>;
 characters:Array<{id:string;hanzi:string;views:number;visitors:number;attempts:number;firstCorrect:number}>;
 words:Array<{id:string;views:number;visitors:number}>;
 paths:Array<{from:string;to:string;count:number}>;
 recent:Array<{at:string;name:string;mode:string|null;visitorLabel:string;sessionId:string;familyId:string|null;characterId:string|null;wordId:string|null;result:string|null}>;
}
export interface AdminIdentity{signedIn:boolean;founder:boolean;founderConfigured:boolean;userId?:string}
