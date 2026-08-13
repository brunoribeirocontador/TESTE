-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Parcela" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parcelamentoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" DATETIME,
    "valorPago" REAL,
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    "dataNotificacao" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Parcela_parcelamentoId_fkey" FOREIGN KEY ("parcelamentoId") REFERENCES "Parcelamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Parcela" ("createdAt", "dataPagamento", "id", "numero", "parcelamentoId", "status", "updatedAt", "valor", "valorPago", "vencimento") SELECT "createdAt", "dataPagamento", "id", "numero", "parcelamentoId", "status", "updatedAt", "valor", "valorPago", "vencimento" FROM "Parcela";
DROP TABLE "Parcela";
ALTER TABLE "new_Parcela" RENAME TO "Parcela";
CREATE INDEX "Parcela_parcelamentoId_idx" ON "Parcela"("parcelamentoId");
CREATE INDEX "Parcela_vencimento_idx" ON "Parcela"("vencimento");
CREATE INDEX "Parcela_status_idx" ON "Parcela"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
