CREATE TABLE `accountLanguagePreferences` (
	`userId` int NOT NULL,
	`language` varchar(32) NOT NULL DEFAULT 'en',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountLanguagePreferences_userId` PRIMARY KEY(`userId`)
);
