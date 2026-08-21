CREATE TABLE `webAuthnCeremonies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(32) NOT NULL,
	`challenge` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webAuthnCeremonies_id` PRIMARY KEY(`id`),
	CONSTRAINT `web_authn_ceremonies_user_type_unique` UNIQUE(`userId`,`type`)
);
--> statement-breakpoint
CREATE TABLE `webAuthnPasskeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`credentialId` varchar(512) NOT NULL,
	`publicKey` text NOT NULL,
	`counter` int NOT NULL DEFAULT 0,
	`deviceType` varchar(32) NOT NULL,
	`backedUp` boolean NOT NULL DEFAULT false,
	`transports` json,
	`name` varchar(80) NOT NULL DEFAULT 'Passkey',
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webAuthnPasskeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `web_authn_passkeys_credential_unique` UNIQUE(`credentialId`),
	CONSTRAINT `web_authn_passkeys_user_credential_unique` UNIQUE(`userId`,`credentialId`)
);
