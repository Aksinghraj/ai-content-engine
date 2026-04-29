CREATE TABLE `automationSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`niche` varchar(255) NOT NULL,
	`targetAudience` varchar(255) NOT NULL,
	`platform` varchar(100) NOT NULL,
	`goal` varchar(100) NOT NULL,
	`contentStyle` varchar(100) NOT NULL,
	`cronExpression` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automationSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokensUsed` int NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','pro') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tokenBalance` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `theme` enum('light','dark','auto') DEFAULT 'auto' NOT NULL;