CREATE TABLE `generatorLengthPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoLength` varchar(32) NOT NULL DEFAULT '60s',
	`scriptLength` varchar(32) NOT NULL DEFAULT 'medium',
	`customVideoSeconds` int,
	`customScriptWordTarget` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generatorLengthPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `generator_length_preferences_user_unique` UNIQUE(`userId`)
);
