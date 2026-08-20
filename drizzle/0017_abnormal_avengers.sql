CREATE TABLE `professionalProfileViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`viewDate` date NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professionalProfileViews_id` PRIMARY KEY(`id`),
	CONSTRAINT `professional_profile_views_owner_date_unique` UNIQUE(`userId`,`viewDate`)
);
