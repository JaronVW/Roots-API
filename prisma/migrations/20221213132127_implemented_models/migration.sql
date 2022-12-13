-- CreateTable
CREATE TABLE `User` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(256) NOT NULL,
    `Password` VARCHAR(256) NOT NULL,
    `FirstName` VARCHAR(100) NOT NULL,
    `LastName` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `User_Email_key`(`Email`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(50) NOT NULL,
    `Description` VARCHAR(250) NOT NULL,
    `DateOfEvent` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Event_Title_key`(`Title`),
    UNIQUE INDEX `Event_Description_key`(`Description`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paragraph` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(50) NOT NULL,
    `Text` VARCHAR(5000) NOT NULL,
    `eventId` INTEGER NOT NULL,

    UNIQUE INDEX `Paragraph_Title_key`(`Title`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomTag` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Subject` VARCHAR(50) NOT NULL,
    `eventId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Subject` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Multimedia` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Multimedia` LONGBLOB NOT NULL,
    `Description` VARCHAR(1000) NOT NULL,
    `Transcript` VARCHAR(10000) NOT NULL,
    `Alt` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EventToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EventToTag_AB_unique`(`A`, `B`),
    INDEX `_EventToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Paragraph` ADD CONSTRAINT `Paragraph_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomTag` ADD CONSTRAINT `CustomTag_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventToTag` ADD CONSTRAINT `_EventToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Event`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventToTag` ADD CONSTRAINT `_EventToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
