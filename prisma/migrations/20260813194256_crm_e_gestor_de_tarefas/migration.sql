-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN "dataConversao" DATETIME;
ALTER TABLE "Empresa" ADD COLUMN "origem" TEXT;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "empresaNome" TEXT,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "origemLead" TEXT,
    "tipoServico" TEXT,
    "estagio" TEXT NOT NULL DEFAULT 'NOVO_LEAD',
    "valorProposta" REAL,
    "responsavel" TEXT,
    "observacoes" TEXT,
    "motivoPerda" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "empresaId" TEXT,
    CONSTRAINT "Lead_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadInteracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadInteracao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TarefaOnboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "prazo" DATETIME,
    "concluidaEm" DATETIME,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TarefaOnboarding_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_empresaId_key" ON "Lead"("empresaId");

-- CreateIndex
CREATE INDEX "Lead_estagio_idx" ON "Lead"("estagio");

-- CreateIndex
CREATE INDEX "LeadInteracao_leadId_idx" ON "LeadInteracao"("leadId");

-- CreateIndex
CREATE INDEX "TarefaOnboarding_empresaId_idx" ON "TarefaOnboarding"("empresaId");

-- CreateIndex
CREATE INDEX "TarefaOnboarding_status_idx" ON "TarefaOnboarding"("status");
