CREATE TABLE `socialOAuthStates` (
	`state` varchar(128) NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`encryptedCodeVerifier` text NOT NULL,
	`returnPath` varchar(512) NOT NULL DEFAULT '/connected-accounts',
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socialOAuthStates_state` PRIMARY KEY(`state`)
);
