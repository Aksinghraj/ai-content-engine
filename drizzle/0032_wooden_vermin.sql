CREATE TABLE `socialPostDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`platforms` json NOT NULL,
	`hashtags` json NOT NULL,
	`mentions` json NOT NULL,
	`mediaUrl` varchar(2048),
	`mediaType` enum('image','video'),
	`mediaKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialPostDrafts_id` PRIMARY KEY(`id`)
);
