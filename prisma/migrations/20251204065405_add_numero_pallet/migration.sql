-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('DIRETOR', 'ANALISTA', 'INSPETOR') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cabecal` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Valvula` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `cabecalId` VARCHAR(191) NOT NULL,
    `cor` ENUM('VERMELHO', 'AZUL_MARINHO', 'VERDE', 'AMARELO', 'BRANCO', 'LARANJA') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Variedade` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LinhaProducao` (
    `id` VARCHAR(191) NOT NULL,
    `letra` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LinhaProducao_letra_key`(`letra`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Posicao` (
    `id` VARCHAR(191) NOT NULL,
    `posicao` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Posicao_posicao_key`(`posicao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Embaladeira` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Apontamento` (
    `id` VARCHAR(191) NOT NULL,
    `numeroCarroca` INTEGER NOT NULL,
    `numeroPallet` INTEGER NOT NULL,
    `cabecalId` VARCHAR(191) NOT NULL,
    `valvulaId` VARCHAR(191) NOT NULL,
    `variedadeId` VARCHAR(191) NOT NULL,
    `quantidadeContainers` INTEGER NOT NULL,
    `cor` ENUM('VERMELHO', 'AZUL_MARINHO', 'VERDE', 'AMARELO', 'BRANCO', 'LARANJA') NOT NULL,
    `pesoKg` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Valvula` ADD CONSTRAINT `Valvula_cabecalId_fkey` FOREIGN KEY (`cabecalId`) REFERENCES `Cabecal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Apontamento` ADD CONSTRAINT `Apontamento_cabecalId_fkey` FOREIGN KEY (`cabecalId`) REFERENCES `Cabecal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Apontamento` ADD CONSTRAINT `Apontamento_valvulaId_fkey` FOREIGN KEY (`valvulaId`) REFERENCES `Valvula`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Apontamento` ADD CONSTRAINT `Apontamento_variedadeId_fkey` FOREIGN KEY (`variedadeId`) REFERENCES `Variedade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
