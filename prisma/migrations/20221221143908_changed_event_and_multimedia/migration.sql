/*
  Warnings:

  - You are about to alter the column `description` on the `multimedia` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1000)` to `VarChar(500)`.
  - Added the required column `content` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event` ADD COLUMN `content` VARCHAR(5000) NOT NULL;

-- AlterTable
ALTER TABLE `multimedia` MODIFY `description` VARCHAR(500) NULL,
    MODIFY `transcript` VARCHAR(65535) NULL;
