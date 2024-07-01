CREATE TABLE `thread_image` (
	`thread_id` text NOT NULL,
	`image_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`user_id` text,
	PRIMARY KEY(`image_id`, `thread_id`),
	FOREIGN KEY (`thread_id`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
