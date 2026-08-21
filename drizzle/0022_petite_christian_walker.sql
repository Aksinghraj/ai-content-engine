CREATE TABLE `trustedDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trustedDevices_id` PRIMARY KEY(`id`),
	CONSTRAINT `trusted_devices_token_unique` UNIQUE(`tokenHash`),
	CONSTRAINT `trusted_devices_user_expiry_unique` UNIQUE(`userId`,`expiresAt`)
);
