-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN "email" TEXT;
ALTER TABLE "Empresa" ADD COLUMN "telefone" TEXT;

-- CreateTable
CREATE TABLE "ConfiguracaoEscritorio" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "nome" TEXT NOT NULL DEFAULT 'Controle de Parcelamentos',
    "logo" TEXT,
    "corEmail" TEXT NOT NULL DEFAULT '#0f172a',
    "telefone" TEXT,
    "updatedAt" DATETIME NOT NULL
);
