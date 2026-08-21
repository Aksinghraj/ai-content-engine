CREATE TABLE `twoFactorAuthenticators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`encryptedSecret` text NOT NULL,
	`recoveryCodeHashes` json,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`enabledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `twoFactorAuthenticators_id` PRIMARY KEY(`id`),
	CONSTRAINT `two_factor_authenticators_user_unique` UNIQUE(`userId`)
);
