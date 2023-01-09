/*
  Warnings:

  - Added the required column `domainName` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `organisation` ADD COLUMN `domainName` VARCHAR(191) NOT NULL;
