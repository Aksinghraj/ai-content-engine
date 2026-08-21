CREATE TABLE `localAuthCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`verificationTokenHash` varchar(128),
	`verificationExpiresAt` timestamp,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localAuthCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_auth_credentials_user_unique` UNIQUE(`userId`),
	CONSTRAINT `local_auth_credentials_verification_token_unique` UNIQUE(`verificationTokenHash`)
);
