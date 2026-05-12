CREATE TABLE `wa_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `wa_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text
);
