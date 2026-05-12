CREATE TABLE `wa_message_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text,
	`timestamp` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text
);
--> statement-breakpoint
CREATE INDEX `wa_message_events_message_id_idx` ON `wa_message_events` (`message_id`);--> statement-breakpoint
CREATE TABLE `wa_status_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status_id` text,
	`timestamp` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text
);
--> statement-breakpoint
CREATE INDEX `wa_status_events_status_id_idx` ON `wa_status_events` (`status_id`);