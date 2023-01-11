/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Multimedia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `Multimedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `multimedia` ADD COLUMN `path` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Multimedia_path_key` ON `Multimedia`(`path`);
