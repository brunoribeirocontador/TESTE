import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { ESFERA_LABELS, STATUS_PARCELA_LABELS, STATUS_PARCELAMENTO_LABELS } from "@/lib/format";
import { startOfMonthUTC, startOfNextMonthUTC } from "@/lib/dates";

const CURRENCY_FORMAT = '"R$" #,##0.00';
const DATE_FORMAT = "dd/mm/yyyy";

export async function GET() {
  await verifySession();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Controle de Parcelamentos";
  workbook.created = new Date();

  await addParcelamentosDoMes(workbook);
  await addGeral(workbook);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="parcelamentos-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

async function addParcelamentosDoMes(workbook: ExcelJS.Workbook) {
  const inicio = startOfMonthUTC();
  const fim = startOfNextMonthUTC();

  const parcelas = await db.parcela.findMany({
    where: { vencimento: { gte: inicio, lt: fim } },
    include: { parcelamento: { include: { empresa: true } } },
    orderBy: [{ parcelamento: { empresa: { nome: "asc" } } }, { vencimento: "asc" }],
  });

  const sheet = workbook.addWorksheet("Parcelas do mês");
  sheet.columns = [
    { header: "Empresa", key: "empresa", width: 30 },
    { header: "Esfera", key: "esfera", width: 12 },
    { header: "Órgão", key: "orgao", width: 24 },
    { header: "Número", key: "numero", width: 16 },
    { header: "Parcela", key: "parcela", width: 10 },
    { header: "Vencimento", key: "vencimento", width: 14, style: { numFmt: DATE_FORMAT } },
    { header: "Valor", key: "valor", width: 14, style: { numFmt: CURRENCY_FORMAT } },
    { header: "Status", key: "status", width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const p of parcelas) {
    sheet.addRow({
      empresa: p.parcelamento.empresa.nome,
      esfera: ESFERA_LABELS[p.parcelamento.esfera],
      orgao: p.parcelamento.orgao,
      numero: p.parcelamento.numero ?? "",
      parcela: p.numero,
      vencimento: p.vencimento,
      valor: p.valor,
      status: STATUS_PARCELA_LABELS[p.status],
    });
  }

  sheet.autoFilter = { from: "A1", to: "H1" };
}

async function addGeral(workbook: ExcelJS.Workbook) {
  const parcelamentos = await db.parcelamento.findMany({
    include: { empresa: true, parcelas: true },
    orderBy: [{ empresa: { nome: "asc" } }, { createdAt: "desc" }],
  });

  const sheet = workbook.addWorksheet("Geral");
  sheet.columns = [
    { header: "Empresa", key: "empresa", width: 30 },
    { header: "CNPJ", key: "cnpj", width: 20 },
    { header: "Esfera", key: "esfera", width: 12 },
    { header: "Órgão", key: "orgao", width: 24 },
    { header: "Número", key: "numero", width: 16 },
    { header: "Status", key: "status", width: 14 },
    { header: "Valor original", key: "valorOriginal", width: 16, style: { numFmt: CURRENCY_FORMAT } },
    { header: "Valor negociado", key: "valorTotal", width: 16, style: { numFmt: CURRENCY_FORMAT } },
    { header: "Economia", key: "economia", width: 14, style: { numFmt: CURRENCY_FORMAT } },
    { header: "Nº parcelas", key: "numeroParcelas", width: 12 },
    { header: "Parcelas pagas", key: "parcelasPagas", width: 14 },
    { header: "Saldo devedor", key: "saldoDevedor", width: 16, style: { numFmt: CURRENCY_FORMAT } },
    { header: "Data início", key: "dataInicio", width: 14, style: { numFmt: DATE_FORMAT } },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const p of parcelamentos) {
    const parcelasPagas = p.parcelas.filter((parcela) => parcela.status === "PAGA").length;
    const saldoDevedor = p.parcelas
      .filter((parcela) => parcela.status === "PENDENTE")
      .reduce((acc, parcela) => acc + parcela.valor, 0);
    const economia =
      p.valorOriginal && p.valorOriginal > p.valorTotal ? p.valorOriginal - p.valorTotal : 0;

    sheet.addRow({
      empresa: p.empresa.nome,
      cnpj: p.empresa.cnpj ?? "",
      esfera: ESFERA_LABELS[p.esfera],
      orgao: p.orgao,
      numero: p.numero ?? "",
      status: STATUS_PARCELAMENTO_LABELS[p.status],
      valorOriginal: p.valorOriginal ?? "",
      valorTotal: p.valorTotal,
      economia: economia > 0 ? economia : "",
      numeroParcelas: p.numeroParcelas,
      parcelasPagas,
      saldoDevedor,
      dataInicio: p.dataInicio,
    });
  }

  sheet.autoFilter = { from: "A1", to: "M1" };
}
