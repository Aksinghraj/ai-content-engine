CREATE TABLE `businessConsentEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int NOT NULL,
	`channel` enum('email','whatsapp') NOT NULL,
	`action` enum('granted','withdrawn') NOT NULL,
	`source` varchar(120) NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `businessConsentEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businessContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160),
	`email` varchar(320),
	`phone` varchar(40),
	`source` varchar(120) NOT NULL DEFAULT 'manual',
	`emailConsent` boolean NOT NULL DEFAULT false,
	`emailConsentAt` timestamp,
	`whatsappConsent` boolean NOT NULL DEFAULT false,
	`whatsappConsentAt` timestamp,
	`unsubscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessContacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_contacts_user_email_unique` UNIQUE(`userId`,`email`),
	CONSTRAINT `business_contacts_user_phone_unique` UNIQUE(`userId`,`phone`)
);
--> statement-breakpoint
CREATE TABLE `whatsappBusinessConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('not_configured','ready_to_link','linking','connected','needs_reconnect','error') NOT NULL DEFAULT 'not_configured',
	`wabaId` varchar(255),
	`phoneNumberId` varchar(255),
	`displayPhoneNumber` varchar(40),
	`encryptedBusinessToken` text,
	`lastError` varchar(255),
	`connectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappBusinessConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_business_connections_user_unique` UNIQUE(`userId`)
);
