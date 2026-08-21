CREATE TABLE `localAuthSessionVersions` (
	`userId` int NOT NULL,
	`version` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localAuthSessionVersions_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `localPasswordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `localPasswordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_password_reset_tokens_token_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE INDEX `local_password_reset_tokens_user_index` ON `localPasswordResetTokens` (`userId`);