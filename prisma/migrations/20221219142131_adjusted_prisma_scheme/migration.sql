/*
  Warnings:

  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `_customtagtoevent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customtag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paragraph` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_customtagtoevent` DROP FOREIGN KEY `_CustomTagToEvent_A_fkey`;

-- DropForeignKey
ALTER TABLE `_customtagtoevent` DROP FOREIGN KEY `_CustomTagToEvent_B_fkey`;

-- DropForeignKey
ALTER TABLE `paragraph` DROP FOREIGN KEY `Paragraph_eventId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `role`;

-- DropTable
DROP TABLE `_customtagtoevent`;

-- DropTable
DROP TABLE `customtag`;

-- DropTable
DROP TABLE `paragraph`;
