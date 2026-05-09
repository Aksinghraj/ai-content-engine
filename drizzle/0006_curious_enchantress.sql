CREATE TABLE `autoReplyRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`intent` enum('question','praise','support_issue','spam','other') NOT NULL,
	`platform` varchar(50),
	`replyTemplate` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autoReplyRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagementEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`socialConnectionId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`eventType` enum('comment','dm','like','share','mention') NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorId` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`sentiment` enum('positive','neutral','negative') NOT NULL,
	`sentimentScore` decimal(3,2) NOT NULL DEFAULT '0.50',
	`intent` enum('question','praise','support_issue','spam','other') NOT NULL,
	`postId` varchar(255),
	`isEscalated` boolean NOT NULL DEFAULT false,
	`escalationReason` varchar(255),
	`autoReplyGenerated` text,
	`autoReplySent` boolean NOT NULL DEFAULT false,
	`manualReviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagementEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeBase` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100),
	`tags` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeBase_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `neulinkIntegration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`apiToken` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `neulinkIntegration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`socialConnectionId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`engagementCount` int NOT NULL DEFAULT 0,
	`engagementRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`autoRepliesGenerated` int NOT NULL DEFAULT 0,
	`autoRepliesSent` int NOT NULL DEFAULT 0,
	`autoReplySuccessRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repurposedContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceUrl` varchar(2048) NOT NULL,
	`sourceType` enum('youtube_video','article','podcast') NOT NULL,
	`transcription` text,
	`linkedinPost` text,
	`facebookPost` text,
	`tiktokScript` text,
	`instagramCaption` text,
	`youtubeDescription` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `repurposedContent_id` PRIMARY KEY(`id`)
);
