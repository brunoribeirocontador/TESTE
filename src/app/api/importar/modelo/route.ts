import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { IMPORT_COLUMNS } from "@/lib/import-parcelamentos";

export async function GET() {
  await verifySession();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Parcelamentos");

  sheet.columns = IMPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({
    empresa: "Padaria Bela Vista Ltda",
    cnpj: "08.221.940/0001-52",
    esfera: "Federal",
    orgao: "Receita Federal",
    numero: "88451.2024/003",
    descricao: "Parcelamento especial de INSS",
    valorOriginal: 1500,
    valorTotal: 1000,
    numeroParcelas: 12,
    dataInicio: new Date("2026-01-10"),
    parcelasPagas: 3,
    status: "Ativo",
    observacoes: "Importado do controle antigo em planilha",
  });

  sheet.getRow(2).getCell("dataInicio").numFmt = "dd/mm/yyyy";

  const legenda = workbook.addWorksheet("Instruções");
  legenda.columns = [{ width: 30 }, { width: 70 }];
  legenda.addRows([
    ["Campo", "O que preencher"],
    ["empresa", "Nome da empresa. Se já existir uma empresa com esse nome (ou mesmo CNPJ), ela será reaproveitada."],
    ["cnpj", "Opcional. Se preenchido, é usado para identificar a empresa com mais precisão."],
    ["esfera", "Federal, Estadual ou Municipal."],
    ["orgao", "Ex.: Receita Federal, Sefaz-SP, Prefeitura de Osasco."],
    ["numero", "Número do parcelamento no órgão. Opcional."],
    ["descricao", "Descrição livre. Opcional."],
    ["valorOriginal", "Valor antes de qualquer redução/desconto. Opcional — só preencha se houve redução."],
    ["valorTotal", "Valor total negociado (obrigatório), já com desconto se houver."],
    ["numeroParcelas", "Quantidade total de parcelas do parcelamento."],
    ["dataInicio", "Data de vencimento da 1ª parcela (dd/mm/aaaa)."],
    ["parcelasPagas", "Quantas das primeiras parcelas já estão pagas. Deixe 0 ou em branco se nenhuma."],
    ["status", "Ativo, Quitado ou Rescindido. Se em branco, assume Ativo."],
    ["observacoes", "Observações livres. Opcional."],
  ]);
  legenda.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="modelo-importacao-parcelamentos.xlsx"`,
    },
  });
}
