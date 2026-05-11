CREATE TABLE `wa_entries` (
	`wa_entry_id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text
);
