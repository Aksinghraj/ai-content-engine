CREATE TABLE `trendCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cacheKey` varchar(100) NOT NULL,
	`payload` json NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trendCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `trendCache_cacheKey_unique` UNIQUE(`cacheKey`)
);
