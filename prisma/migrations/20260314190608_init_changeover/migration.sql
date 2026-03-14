-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'OPERATOR'
);

-- CreateTable
CREATE TABLE "Fabrico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Secao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tempoPrevisto" INTEGER NOT NULL,
    "fabricoId" TEXT NOT NULL,
    CONSTRAINT "Secao_fabricoId_fkey" FOREIGN KEY ("fabricoId") REFERENCES "Fabrico" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Passo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordem" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "ferramentasStr" TEXT NOT NULL DEFAULT '[]',
    "episRequeridosStr" TEXT NOT NULL DEFAULT '[]',
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "epiConfirmado" BOOLEAN NOT NULL DEFAULT false,
    "tempoExecucao" INTEGER,
    "tempoInicio" DATETIME,
    "secaoId" TEXT NOT NULL,
    CONSTRAINT "Passo_secaoId_fkey" FOREIGN KEY ("secaoId") REFERENCES "Secao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
