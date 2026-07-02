CREATE TABLE `contentIdeas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedTrendId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`hook` text NOT NULL,
	`caption` text NOT NULL,
	`hashtags` json NOT NULL,
	`contentType` varchar(50) NOT NULL,
	`estimatedEngagement` int,
	`aiGeneratedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentIdeas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedTrends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trendTitle` varchar(500) NOT NULL,
	`trendScore` int NOT NULL,
	`growthPercentage` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`estimatedReach` varchar(50) NOT NULL,
	`platforms` json NOT NULL,
	`summary` text NOT NULL,
	`relatedKeywords` json NOT NULL,
	`suggestedHooks` json NOT NULL,
	`bestPostingTime` varchar(100),
	`externalTrendId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedTrends_id` PRIMARY KEY(`id`)
);
