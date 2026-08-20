CREATE TABLE `lumaePulseIntroDismissals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dismissalDate` date NOT NULL,
	`dismissals` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lumaePulseIntroDismissals_id` PRIMARY KEY(`id`),
	CONSTRAINT `lumae_pulse_intro_dismissals_date_unique` UNIQUE(`dismissalDate`)
);
