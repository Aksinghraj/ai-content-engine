ALTER TABLE `scheduledPosts` MODIFY COLUMN `status` enum('pending','processing','published','failed') NOT NULL DEFAULT 'pending';
