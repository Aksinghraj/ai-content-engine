CREATE TABLE `razorpayCreditOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`razorpayOrderId` varchar(255) NOT NULL,
	`receiptId` varchar(255) NOT NULL,
	`packageId` varchar(32) NOT NULL,
	`credits` int NOT NULL,
	`amountPaise` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'INR',
	`status` enum('created','verifying','credited','failed','cancelled') NOT NULL DEFAULT 'created',
	`razorpayPaymentId` varchar(255),
	`paidAt` timestamp,
	`creditedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `razorpayCreditOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `razorpay_credit_orders_order_unique` UNIQUE(`razorpayOrderId`),
	CONSTRAINT `razorpay_credit_orders_receipt_unique` UNIQUE(`receiptId`),
	CONSTRAINT `razorpay_credit_orders_payment_unique` UNIQUE(`razorpayPaymentId`)
);
--> statement-breakpoint
CREATE INDEX `razorpay_credit_orders_user_created_index` ON `razorpayCreditOrders` (`userId`,`createdAt`);