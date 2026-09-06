CREATE TABLE `attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`entry_id` integer,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attachments_object_key_unique` ON `attachments` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_attachments_project_entry` ON `attachments` (`project_id`,`entry_id`);--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quote_id` integer NOT NULL,
	`price_item_id` integer,
	`position` integer DEFAULT 1 NOT NULL,
	`description` text NOT NULL,
	`unit` text NOT NULL,
	`quantity` real DEFAULT 0 NOT NULL,
	`unit_cost` real DEFAULT 0 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`actual_quantity` real DEFAULT 0 NOT NULL,
	`invoiced_quantity` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`price_item_id`) REFERENCES `price_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_quote_items_quote_position` ON `quote_items` (`quote_id`,`position`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`title` text NOT NULL,
	`customer_request` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`overhead_pct` real DEFAULT 10 NOT NULL,
	`risk_pct` real DEFAULT 5 NOT NULL,
	`vat_pct` real DEFAULT 19 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_quotes_project_status` ON `quotes` (`project_id`,`status`);--> statement-breakpoint
ALTER TABLE `entries` ADD `worker_name` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `travel_hours` real;--> statement-breakpoint
ALTER TABLE `entries` ADD `invoiced` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_entries_project_created` ON `entries` (`project_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `price_items` ADD `active` integer DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_price_items_category_active` ON `price_items` (`category`,`active`);