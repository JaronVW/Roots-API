/*
  Warnings:

  - A unique constraint covering the columns `[subject]` on the table `CustomTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subject]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CustomTag_subject_key` ON `CustomTag`(`subject`);

-- CreateIndex
CREATE UNIQUE INDEX `Tag_subject_key` ON `Tag`(`subject`);
