-- CreateTable
CREATE TABLE `AmostraPeso` (
    `id` VARCHAR(191) NOT NULL,
    `apontamentoId` VARCHAR(191) NULL,
    `pesoAmostra` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AmostraPeso` ADD CONSTRAINT `AmostraPeso_apontamentoId_fkey` FOREIGN KEY (`apontamentoId`) REFERENCES `Apontamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
