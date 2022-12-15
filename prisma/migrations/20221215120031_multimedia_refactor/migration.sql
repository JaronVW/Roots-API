/*
  Warnings:

  - You are about to alter the column `multimedia` on the `multimedia` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `multimedia` MODIFY `multimedia` VARCHAR(191) NULL;
