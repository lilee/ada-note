CREATE TABLE `thread_refer` (
	`thread_id` text NOT NULL,
	`lead_thread_id` text NOT NULL,
	`refer_thread_id` text NOT NULL,
	`user_id` text,
	PRIMARY KEY(`refer_thread_id`, `thread_id`),
	FOREIGN KEY (`thread_id`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lead_thread_id`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`refer_thread_id`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `thread` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_thread_id` text,
	`topic_id` text NOT NULL,
	`thread_content` text NOT NULL,
	`thread_content_long` text,
	`group_name` text,
	`pin_on_group` integer DEFAULT 0 NOT NULL,
	`command` text,
	`color` text DEFAULT 'none' NOT NULL,
	`task_done_at` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text,
	FOREIGN KEY (`lead_thread_id`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `topic` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_name` text NOT NULL,
	`builtin_topic_name` text,
	`topic_desc` text,
	`pin` integer DEFAULT false NOT NULL,
	`group_name` text,
	`group_config` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`nickname` text,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`reflect_prompts` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topic_builtin_topic_name_unique` ON `topic` (`builtin_topic_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);