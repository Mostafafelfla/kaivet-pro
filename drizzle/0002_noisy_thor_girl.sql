CREATE TABLE `medicalTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`caseId` int,
	`testType` varchar(100) NOT NULL,
	`testName` varchar(255) NOT NULL,
	`testDate` datetime NOT NULL,
	`results` text,
	`normalRange` varchar(255),
	`status` enum('pending','completed','abnormal') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicalTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`caseId` int NOT NULL,
	`patientId` int NOT NULL,
	`medicationName` varchar(255) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` varchar(100) NOT NULL,
	`duration` varchar(100),
	`route` varchar(50),
	`instructions` text,
	`startDate` datetime,
	`endDate` datetime,
	`refills` int,
	`status` enum('active','completed','discontinued') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`veterinarianId` int,
	`vaccineName` varchar(255) NOT NULL,
	`vaccineType` varchar(100),
	`batchNumber` varchar(100),
	`administrationDate` datetime NOT NULL,
	`nextDueDate` datetime,
	`route` varchar(50),
	`site` varchar(100),
	`dosage` varchar(100),
	`manufacturer` varchar(255),
	`notes` text,
	`status` enum('completed','pending','overdue') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chatMessages` MODIFY COLUMN `role` enum('user','assistant','system') NOT NULL;--> statement-breakpoint
ALTER TABLE `cases` ADD `caseNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `cases` ADD `symptoms` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `followUpNotes` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `severity` enum('low','medium','high','critical') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `cases` ADD `prognosis` text;--> statement-breakpoint
ALTER TABLE `chatMessages` ADD `metadata` json;--> statement-breakpoint
ALTER TABLE `chatSessions` ADD `patientId` int;--> statement-breakpoint
ALTER TABLE `chatSessions` ADD `context` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `allergies` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `bloodType` varchar(50);--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_caseNumber_unique` UNIQUE(`caseNumber`);