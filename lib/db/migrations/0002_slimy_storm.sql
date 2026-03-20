CREATE TABLE `outlook_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`user_email` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
