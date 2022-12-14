/*
  Warnings:

  - The primary key for the `customtag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `customtag` table. All the data in the column will be lost.
  - You are about to drop the column `Subject` on the `customtag` table. All the data in the column will be lost.
  - The primary key for the `event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DateOfEvent` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `Title` on the `event` table. All the data in the column will be lost.
  - The primary key for the `multimedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Alt` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `Multimedia` on the `multimedia` table. All the data in the column will be lost.
  - You are about to drop the column `Transcript` on the `multimedia` table. All the data in the column will be lost.
  - The primary key for the `paragraph` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `paragraph` table. All the data in the column will be lost.
  - You are about to drop the column `Text` on the `paragraph` table. All the data in the column will be lost.
  - You are about to drop the column `Title` on the `paragraph` table. All the data in the column will be lost.
  - The primary key for the `tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `Subject` on the `tag` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `FirstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `CustomTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `CustomTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Multimedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `multimedia` to the `Multimedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Paragraph` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Paragraph` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_customtagtoevent` DROP FOREIGN KEY `_CustomTagToEvent_A_fkey`;

-- DropForeignKey
ALTER TABLE `_customtagtoevent` DROP FOREIGN KEY `_CustomTagToEvent_B_fkey`;

-- DropForeignKey
ALTER TABLE `_eventtotag` DROP FOREIGN KEY `_EventToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_eventtotag` DROP FOREIGN KEY `_EventToTag_B_fkey`;

-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `Event_userId_fkey`;

-- DropForeignKey
ALTER TABLE `multimedia` DROP FOREIGN KEY `Multimedia_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `paragraph` DROP FOREIGN KEY `Paragraph_eventId_fkey`;

-- DropIndex
DROP INDEX `CustomTag_eventId_fkey` ON `customtag`;

-- DropIndex
DROP INDEX `Event_Title_key` ON `event`;

-- DropIndex
DROP INDEX `User_Email_key` ON `user`;

-- AlterTable
ALTER TABLE `customtag` DROP PRIMARY KEY,
    DROP COLUMN `Id`,
    DROP COLUMN `Subject`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `subject` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `event` DROP PRIMARY KEY,
    DROP COLUMN `DateOfEvent`,
    DROP COLUMN `Description`,
    DROP COLUMN `Id`,
    DROP COLUMN `Title`,
    ADD COLUMN `dateOfEvent` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(250) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `title` VARCHAR(100) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `multimedia` DROP PRIMARY KEY,
    DROP COLUMN `Alt`,
    DROP COLUMN `Description`,
    DROP COLUMN `Id`,
    DROP COLUMN `Multimedia`,
    DROP COLUMN `Transcript`,
    ADD COLUMN `alt` VARCHAR(100) NULL,
    ADD COLUMN `description` VARCHAR(1000) NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `multimedia` LONGBLOB NOT NULL,
    ADD COLUMN `transcript` VARCHAR(10000) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `paragraph` DROP PRIMARY KEY,
    DROP COLUMN `Id`,
    DROP COLUMN `Text`,
    DROP COLUMN `Title`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `text` VARCHAR(5000) NOT NULL,
    ADD COLUMN `title` VARCHAR(50) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `tag` DROP PRIMARY KEY,
    DROP COLUMN `Id`,
    DROP COLUMN `Subject`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `subject` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `Email`,
    DROP COLUMN `FirstName`,
    DROP COLUMN `Id`,
    DROP COLUMN `LastName`,
    DROP COLUMN `Password`,
    ADD COLUMN `email` VARCHAR(256) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(100) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `lastName` VARCHAR(100) NOT NULL,
    ADD COLUMN `password` VARCHAR(256) NOT NULL,
    ADD COLUMN `role` VARCHAR(5) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Event_title_key` ON `Event`(`title`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paragraph` ADD CONSTRAINT `Paragraph_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Multimedia` ADD CONSTRAINT `Multimedia_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventToTag` ADD CONSTRAINT `_EventToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventToTag` ADD CONSTRAINT `_EventToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomTagToEvent` ADD CONSTRAINT `_CustomTagToEvent_A_fkey` FOREIGN KEY (`A`) REFERENCES `CustomTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomTagToEvent` ADD CONSTRAINT `_CustomTagToEvent_B_fkey` FOREIGN KEY (`B`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
