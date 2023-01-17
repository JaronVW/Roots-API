-- AlterTable
ALTER TABLE `user` MODIFY `isActive` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `verificationRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `verificationRequest_email_key`(`email`),
    UNIQUE INDEX `verificationRequest_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `verificationRequest` ADD CONSTRAINT `verificationRequest_email_fkey` FOREIGN KEY (`email`) REFERENCES `User`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;
