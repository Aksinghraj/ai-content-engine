CREATE TABLE `userFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`category` enum('glitch','problem','suggestion','feature_request','other') NOT NULL,
	`message` text NOT NULL,
	`pagePath` varchar(512),
	`status` enum('new','reviewed','resolved') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_feedback_user_created_index` ON `userFeedback` (`userId`,`createdAt`);