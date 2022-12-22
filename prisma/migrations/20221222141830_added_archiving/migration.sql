-- AlterTable
ALTER TABLE `event` ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `multimedia` MODIFY `transcript` VARCHAR(65535) NULL;
