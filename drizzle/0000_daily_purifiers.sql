CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`name` text NOT NULL,
	`occurred_at` text NOT NULL,
	`received_at` text NOT NULL,
	`mode` text,
	`course` text,
	`level` integer,
	`word_range` text,
	`family_id` text,
	`character_id` text,
	`word_id` text,
	`trial_id` text,
	`attempt_no` integer,
	`result` text,
	`hint_used` integer,
	`active_ms` integer,
	`source` text,
	`first_part` text,
	`second_part` text,
	`value` text,
	`event_count` integer,
	`app_version` text DEFAULT 'auto-analytics-v1' NOT NULL,
	`instrument_version` text DEFAULT '1' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `analytics_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`visitor_id`) REFERENCES `analytics_visitors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `analytics_events_time_idx` ON `analytics_events` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_session_idx` ON `analytics_events` (`session_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_family_idx` ON `analytics_events` (`family_id`,`name`);--> statement-breakpoint
CREATE INDEX `analytics_events_trial_idx` ON `analytics_events` (`session_id`,`trial_id`,`attempt_no`);--> statement-breakpoint
CREATE TABLE `analytics_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`revoked_at` text,
	`excluded` integer DEFAULT 0 NOT NULL,
	`rate_window` text NOT NULL,
	`rate_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`visitor_id`) REFERENCES `analytics_visitors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `analytics_sessions_visitor_idx` ON `analytics_sessions` (`visitor_id`);--> statement-breakpoint
CREATE TABLE `analytics_visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
