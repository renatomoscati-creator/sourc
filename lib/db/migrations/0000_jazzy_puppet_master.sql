CREATE TABLE `call_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startup_id` integer NOT NULL,
	`date` text NOT NULL,
	`participants` text,
	`founder_background` text,
	`what_they_do` text,
	`problem_and_market` text,
	`product_maturity` text,
	`traction` text,
	`customers` text,
	`business_model` text,
	`fundraising_status` text,
	`milestones` text,
	`key_risks` text,
	`overall_impression` text,
	`recommendation` text,
	`next_step` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `founders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startup_id` integer NOT NULL,
	`name` text NOT NULL,
	`title` text,
	`email` text,
	`linkedin` text,
	`notes` text,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outreach_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startup_id` integer NOT NULL,
	`founder_id` integer,
	`date` text NOT NULL,
	`channel` text,
	`status` text DEFAULT 'Outreach Sent' NOT NULL,
	`message_type` text,
	`follow_up_date` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`founder_id`) REFERENCES `founders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text,
	`geography_relevance` text,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `startup_sources` (
	`startup_id` integer NOT NULL,
	`source_id` integer NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `startups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`city` text DEFAULT 'Milan',
	`geography_tag` text,
	`stage` text,
	`sector` text,
	`founded_year` integer,
	`description` text,
	`problem` text,
	`product` text,
	`business_model` text,
	`traction` text,
	`funding_status` text,
	`accelerator` text,
	`score_relevance` real,
	`score_stage_fit` real,
	`score_source_quality` real,
	`score_team_quality` real,
	`score_problem_attractiveness` real,
	`score_product_clarity` real,
	`score_traction_quality` real,
	`score_market_potential` real,
	`score_founder_responsiveness` real,
	`score_overall_conviction` real,
	`priority_score` real,
	`status` text DEFAULT 'New' NOT NULL,
	`recommendation` text DEFAULT 'TBD',
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
