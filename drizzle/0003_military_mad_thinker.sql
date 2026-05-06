CREATE TABLE `automationExecutionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`generatedContent` json,
	`errorMessage` text,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automationExecutionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentHistoryId` int,
	`platform` varchar(100) NOT NULL,
	`engagement` int NOT NULL DEFAULT 0,
	`reach` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`comments` int NOT NULL DEFAULT 0,
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentAnalytics_id` PRIMARY KEY(`id`)
);
