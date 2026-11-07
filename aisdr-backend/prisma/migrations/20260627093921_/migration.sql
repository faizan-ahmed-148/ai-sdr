-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `avatar` VARCHAR(255) NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `companyName` VARCHAR(255) NULL,
    `accountType` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `provider` ENUM('GOOGLE', 'FACEBOOK', 'CREDENTIAL') NOT NULL DEFAULT 'CREDENTIAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `userId` BIGINT NOT NULL,
    `templateId` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `from` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `userId` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `website` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `additionalFields` JSON NULL,
    `userId` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `leads_email_userId_key`(`email`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_lead_pivot` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `campaignId` BIGINT NOT NULL,
    `leadId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,

    UNIQUE INDEX `campaign_lead_pivot_campaignId_leadId_userId_key`(`campaignId`, `leadId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_emails` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `campaignId` BIGINT NOT NULL,
    `knowledgebaseId` BIGINT NOT NULL,
    `prompt` TEXT NOT NULL,
    `fromName` VARCHAR(255) NOT NULL,
    `fromEmail` VARCHAR(255) NOT NULL,
    `fromDesignation` VARCHAR(255) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED') NOT NULL DEFAULT 'PENDING',
    `sentAt` DATETIME(3) NULL,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `scheduled_emails_status_idx`(`status`),
    INDEX `scheduled_emails_sentAt_idx`(`sentAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wiza` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `listId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `status` ENUM('QUEUED', 'FINISHED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `reportType` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowledgebase` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `content` TEXT NULL,
    `file` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `templates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_lead_pivot` ADD CONSTRAINT `campaign_lead_pivot_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_lead_pivot` ADD CONSTRAINT `campaign_lead_pivot_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_lead_pivot` ADD CONSTRAINT `campaign_lead_pivot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_emails` ADD CONSTRAINT `scheduled_emails_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_emails` ADD CONSTRAINT `scheduled_emails_knowledgebaseId_fkey` FOREIGN KEY (`knowledgebaseId`) REFERENCES `knowledgebase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wiza` ADD CONSTRAINT `wiza_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowledgebase` ADD CONSTRAINT `knowledgebase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
