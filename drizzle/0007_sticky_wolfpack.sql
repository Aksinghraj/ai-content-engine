ALTER TABLE `socialConnections` MODIFY COLUMN `isConnected` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `socialConnections` ADD `isValidated` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `socialConnections` ADD `validationError` text;--> statement-breakpoint
ALTER TABLE `socialConnections` ADD `lastValidationAt` timestamp;