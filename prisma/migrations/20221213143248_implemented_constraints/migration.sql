/*
  Warnings:

  - Added the required column `eventId` to the `Multimedia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `customtag` DROP FOREIGN KEY `CustomTag_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `paragraph` DROP FOREIGN KEY `Paragraph_eventId_fkey`;

-- DropIndex
DROP INDEX `Event_Description_key` ON `event`;

-- DropIndex
DROP INDEX `Paragraph_Title_key` ON `paragraph`;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `multimedia` ADD COLUMN `eventId` INTEGER NOT NULL,
    MODIFY `Description` VARCHAR(1000) NULL,
    MODIFY `Transcript` VARCHAR(10000) NULL,
    MODIFY `Alt` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `paragraph` MODIFY `Title` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `_CustomTagToEvent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CustomTagToEvent_AB_unique`(`A`, `B`),
    INDEX `_CustomTagToEvent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paragraph` ADD CONSTRAINT `Paragraph_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Multimedia` ADD CONSTRAINT `Multimedia_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomTagToEvent` ADD CONSTRAINT `_CustomTagToEvent_A_fkey` FOREIGN KEY (`A`) REFERENCES `CustomTag`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomTagToEvent` ADD CONSTRAINT `_CustomTagToEvent_B_fkey` FOREIGN KEY (`B`) REFERENCES `Event`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
