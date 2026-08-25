ALTER TABLE `userFeedback` ADD `attachmentKey` varchar(1024);--> statement-breakpoint
ALTER TABLE `userFeedback` ADD `attachmentMimeType` varchar(64);--> statement-breakpoint
ALTER TABLE `userFeedback` ADD `attachmentName` varchar(255);--> statement-breakpoint
CREATE INDEX `user_feedback_status_created_index` ON `userFeedback` (`status`,`createdAt`);