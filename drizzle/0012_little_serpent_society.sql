CREATE TABLE `dailyFreeActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` varchar(64) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`resetAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyFreeActions_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_free_actions_user_action_unique` UNIQUE(`userId`,`actionType`)
);
