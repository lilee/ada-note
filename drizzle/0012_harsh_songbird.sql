DROP TABLE IF EXISTS thread_refer;

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
ALTER TABLE `thread` ADD `pin_on_group` integer DEFAULT 0 NOT NULL;