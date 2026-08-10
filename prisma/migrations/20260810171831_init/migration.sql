-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Parcelamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "esfera" TEXT NOT NULL,
    "orgao" TEXT NOT NULL,
    "numero" TEXT,
    "descricao" TEXT,
    "valorTotal" REAL NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Parcelamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parcela" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parcelamentoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" DATETIME,
    "valorPago" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Parcela_parcelamentoId_fkey" FOREIGN KEY ("parcelamentoId") REFERENCES "Parcelamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE INDEX "Parcelamento_empresaId_idx" ON "Parcelamento"("empresaId");

-- CreateIndex
CREATE INDEX "Parcelamento_esfera_idx" ON "Parcelamento"("esfera");

-- CreateIndex
CREATE INDEX "Parcelamento_status_idx" ON "Parcelamento"("status");

-- CreateIndex
CREATE INDEX "Parcela_parcelamentoId_idx" ON "Parcela"("parcelamentoId");

-- CreateIndex
CREATE INDEX "Parcela_vencimento_idx" ON "Parcela"("vencimento");

-- CreateIndex
CREATE INDEX "Parcela_status_idx" ON "Parcela"("status");
