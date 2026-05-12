CREATE TABLE `registered_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wa_user_id` text NOT NULL,
	`registration_state` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`platform_updates_opt_in` integer,
	`early_access_opt_in` integer,
	`club` text,
	`city` text,
	`role` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registered_users_wa_user_id_unique` ON `registered_users` (`wa_user_id`);--> statement-breakpoint
CREATE INDEX `registered_users_wa_user_id_idx` ON `registered_users` (`wa_user_id`);--> statement-breakpoint
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