CREATE TABLE `beneficiaries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`provider` varchar(50),
	`account_name` varchar(255) NOT NULL,
	`account_number` varchar(100) NOT NULL,
	`bank_name` varchar(255),
	`branch_name` varchar(255),
	`routing_number` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `beneficiaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_codes` (
	`email` varchar(255) NOT NULL,
	`code` varchar(10) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `login_codes_email` PRIMARY KEY(`email`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(255) NOT NULL,
	`value` varchar(2048),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ticket_id` bigint NOT NULL,
	`sender` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` varchar(50) DEFAULT 'open',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`amount_aud` decimal(10,2) NOT NULL,
	`amount_bdt` decimal(15,2) NOT NULL,
	`rate` decimal(10,4) NOT NULL,
	`method` varchar(50) NOT NULL,
	`provider` varchar(50),
	`account_name` varchar(255) NOT NULL,
	`account_number` varchar(100) NOT NULL,
	`bank_name` varchar(255),
	`branch_name` varchar(255),
	`routing_number` varchar(50),
	`status` varchar(50) DEFAULT 'pending',
	`payment_intent_id` varchar(255),
	`admin_transaction_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`mobile` varchar(50),
	`password` varchar(255),
	`role` varchar(50) DEFAULT 'user',
	`address` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
