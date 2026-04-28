CREATE TABLE `contentHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`niche` varchar(255) NOT NULL,
	`targetAudience` varchar(255) NOT NULL,
	`platform` varchar(100) NOT NULL,
	`goal` varchar(100) NOT NULL,
	`contentStyle` varchar(100) NOT NULL,
	`generatedContent` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentHistory_id` PRIMARY KEY(`id`)
);
