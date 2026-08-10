import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { toCsv } from "@/lib/csv";
import { ESFERA_LABELS, STATUS_PARCELA_LABELS, formatDate } from "@/lib/format";
import { parseDateOnlyUTC } from "@/lib/dates";

export async function GET(request: NextRequest) {
  await verifySession();

  const params = request.nextUrl.searchParams;
  const esfera = params.get("esfera") || undefined;
  const status = params.get("status") || undefined;
  const empresaId = params.get("empresaId") || undefined;
  const de = params.get("de") || undefined;
  const ate = params.get("ate") || undefined;

  const parcelas = await db.parcela.findMany({
    where: {
      ...(status ? { status: status as "PENDENTE" | "PAGA" } : {}),
      ...(de || ate
        ? {
            vencimento: {
              ...(de ? { gte: parseDateOnlyUTC(de) } : {}),
              ...(ate ? { lte: parseDateOnlyUTC(ate) } : {}),
            },
          }
        : {}),
      parcelamento: {
        ...(esfera ? { esfera: esfera as "FEDERAL" | "ESTADUAL" | "MUNICIPAL" } : {}),
        ...(empresaId ? { empresaId } : {}),
      },
    },
    include: { parcelamento: { include: { empresa: true } } },
    orderBy: [{ parcelamento: { empresa: { nome: "asc" } } }, { vencimento: "asc" }],
  });

  const headers = [
    "Empresa",
    "CNPJ",
    "Esfera",
    "Órgão",
    "Número do parcelamento",
    "Parcela",
    "Vencimento",
    "Valor",
    "Status",
    "Data do pagamento",
    "Valor pago",
  ];

  const rows = parcelas.map((p) => [
    p.parcelamento.empresa.nome,
    p.parcelamento.empresa.cnpj ?? "",
    ESFERA_LABELS[p.parcelamento.esfera],
    p.parcelamento.orgao,
    p.parcelamento.numero ?? "",
    p.numero,
    formatDate(p.vencimento),
    p.valor.toFixed(2).replace(".", ","),
    STATUS_PARCELA_LABELS[p.status],
    p.dataPagamento ? formatDate(p.dataPagamento) : "",
    p.valorPago !== null ? p.valorPago.toFixed(2).replace(".", ",") : "",
  ]);

  const csv = toCsv(headers, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="parcelas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
