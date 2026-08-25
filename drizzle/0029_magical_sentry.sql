ALTER TABLE `professionalProfiles` ADD `username` varchar(80);--> statement-breakpoint
ALTER TABLE `professionalProfiles` ADD COLUMN IF NOT EXISTS `username` varchar(80);--> statement-breakpoint
ALTER TABLE `professionalProfiles` ADD COLUMN IF NOT EXISTS `profileStatus` varchar(100);--> statement-breakpoint
ALTER TABLE `professionalProfiles` ADD COLUMN IF NOT EXISTS `collaborationOpen` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `professional_profiles_username_unique` ON `professionalProfiles` (`username`);
