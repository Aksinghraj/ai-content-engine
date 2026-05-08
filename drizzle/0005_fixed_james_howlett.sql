CREATE TABLE `scheduledPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`socialConnectionId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`mediaUrl` varchar(2048),
	`mediaType` enum('image','video'),
	`mediaKey` varchar(255),
	`scheduledAt` timestamp NOT NULL,
	`publishedAt` timestamp,
	`status` enum('pending','published','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`platformPostId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`username` varchar(255) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`platformUserId` varchar(255) NOT NULL,
	`isConnected` boolean NOT NULL DEFAULT true,
	`autoPost` boolean NOT NULL DEFAULT false,
	`autoReply` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialConnections_id` PRIMARY KEY(`id`)
);
