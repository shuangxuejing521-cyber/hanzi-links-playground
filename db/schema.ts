import {integer,sqliteTable,text,index} from 'drizzle-orm/sqlite-core';

export const analyticsVisitors=sqliteTable('analytics_visitors',{
 id:text('id').primaryKey(),createdAt:text('created_at').notNull(),lastSeenAt:text('last_seen_at').notNull(),
});
export const analyticsSessions=sqliteTable('analytics_sessions',{
 id:text('id').primaryKey(),visitorId:text('visitor_id').notNull().references(()=>analyticsVisitors.id),createdAt:text('created_at').notNull(),lastSeenAt:text('last_seen_at').notNull(),revokedAt:text('revoked_at'),excluded:integer('excluded').notNull().default(0),rateWindow:text('rate_window').notNull(),rateCount:integer('rate_count').notNull().default(0),
},table=>[index('analytics_sessions_visitor_idx').on(table.visitorId)]);
export const analyticsEvents=sqliteTable('analytics_events',{
 id:text('id').primaryKey(),sessionId:text('session_id').notNull().references(()=>analyticsSessions.id),visitorId:text('visitor_id').notNull().references(()=>analyticsVisitors.id),name:text('name').notNull(),occurredAt:text('occurred_at').notNull(),receivedAt:text('received_at').notNull(),mode:text('mode'),course:text('course'),level:integer('level'),range:text('word_range'),familyId:text('family_id'),characterId:text('character_id'),wordId:text('word_id'),trialId:text('trial_id'),attemptNo:integer('attempt_no'),result:text('result'),hintUsed:integer('hint_used'),activeMs:integer('active_ms'),source:text('source'),firstPart:text('first_part'),secondPart:text('second_part'),value:text('value'),count:integer('event_count'),appVersion:text('app_version').notNull().default('auto-analytics-v1'),instrumentVersion:text('instrument_version').notNull().default('1'),
},table=>[index('analytics_events_time_idx').on(table.occurredAt),index('analytics_events_session_idx').on(table.sessionId,table.occurredAt),index('analytics_events_family_idx').on(table.familyId,table.name),index('analytics_events_trial_idx').on(table.sessionId,table.trialId,table.attemptNo)]);
