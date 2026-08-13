import "server-only";
import ExcelJS from "exceljs";
import { z } from "zod";
import { db } from "@/lib/db";
import { addMonthsUTC } from "@/lib/dates";

export const IMPORT_COLUMNS = [
  { key: "empresa", header: "Empresa", width: 30 },
  { key: "cnpj", header: "CNPJ", width: 20 },
  { key: "esfera", header: "Esfera", width: 12 },
  { key: "orgao", header: "Órgão", width: 24 },
  { key: "numero", header: "Número", width: 16 },
  { key: "descricao", header: "Descrição", width: 26 },
  { key: "valorOriginal", header: "Valor original", width: 16 },
  { key: "valorTotal", header: "Valor total negociado", width: 18 },
  { key: "numeroParcelas", header: "Número de parcelas", width: 16 },
  { key: "dataInicio", header: "Data de início", width: 16 },
  { key: "parcelasPagas", header: "Parcelas já pagas", width: 16 },
  { key: "status", header: "Status", width: 14 },
  { key: "observacoes", header: "Observações", width: 30 },
] as const;

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const ESFERA_ALIASES: Record<string, "FEDERAL" | "ESTADUAL" | "MUNICIPAL"> = {
  federal: "FEDERAL",
  estadual: "ESTADUAL",
  municipal: "MUNICIPAL",
};

const STATUS_ALIASES: Record<string, "ATIVO" | "QUITADO" | "RESCINDIDO"> = {
  ativo: "ATIVO",
  quitado: "QUITADO",
  rescindido: "RESCINDIDO",
};

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) return String(value.text ?? "");
  if (typeof value === "object" && "result" in value) return String(value.result ?? "");
  return String(value).trim();
}

function cellToNumber(value: ExcelJS.CellValue): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return value;
  const str = cellToString(value).replace(/\./g, "").replace(",", ".");
  const n = Number(str.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function cellToDate(value: ExcelJS.CellValue): Date | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  const str = cellToString(value);
  const br = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (br) {
    const [, d, m, y] = br;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }
  return undefined;
}

const RowSchema = z.object({
  empresa: z.string().trim().min(1, "Informe o nome da empresa."),
  cnpj: z.string().trim().optional(),
  esfera: z.enum(["FEDERAL", "ESTADUAL", "MUNICIPAL"], { error: "Esfera inválida (use Federal, Estadual ou Municipal)." }),
  orgao: z.string().trim().min(1, "Informe o órgão."),
  numero: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  valorOriginal: z.number().positive().optional(),
  valorTotal: z.number().positive("Valor total negociado deve ser maior que zero."),
  numeroParcelas: z.number().int().min(1, "Número de parcelas deve ser ao menos 1.").max(600),
  dataInicio: z.date({ error: "Data de início inválida (use dd/mm/aaaa)." }),
  parcelasPagas: z.number().int().min(0).optional(),
  status: z.enum(["ATIVO", "QUITADO", "RESCINDIDO"]).default("ATIVO"),
  observacoes: z.string().trim().optional(),
});

type ParsedRow = z.infer<typeof RowSchema>;

export type ImportError = { linha: number; motivo: string };
export type ImportResult = {
  totalLinhas: number;
  parcelamentosCriados: number;
  empresasCriadas: number;
  erros: ImportError[];
};

function gerarParcelas(valorTotal: number, numeroParcelas: number, dataInicio: Date) {
  const centavosTotal = Math.round(valorTotal * 100);
  const centavosBase = Math.floor(centavosTotal / numeroParcelas);
  const resto = centavosTotal - centavosBase * numeroParcelas;

  return Array.from({ length: numeroParcelas }, (_, i) => {
    const centavos = i === numeroParcelas - 1 ? centavosBase + resto : centavosBase;
    return {
      numero: i + 1,
      valor: centavos / 100,
      vencimento: addMonthsUTC(dataInicio, i),
    };
  });
}

export async function importarPlanilhaBuffer(buffer: ArrayBuffer): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets.find((s) => s.name === "Parcelamentos") ?? workbook.worksheets[0];

  if (!sheet) {
    return { totalLinhas: 0, parcelamentosCriados: 0, empresasCriadas: 0, erros: [{ linha: 0, motivo: "Nenhuma aba encontrada no arquivo." }] };
  }

  const headerRow = sheet.getRow(1);
  const colIndexByKey = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    const normalized = normalizeHeader(cell.value);
    const match = IMPORT_COLUMNS.find((c) => normalizeHeader(c.header) === normalized);
    if (match) colIndexByKey.set(match.key, colNumber);
  });

  if (!colIndexByKey.has("empresa") || !colIndexByKey.has("valorTotal")) {
    return {
      totalLinhas: 0,
      parcelamentosCriados: 0,
      empresasCriadas: 0,
      erros: [{ linha: 1, motivo: "Colunas obrigatórias não encontradas. Use o modelo fornecido para download." }],
    };
  }

  const erros: ImportError[] = [];
  const empresasCriadasIds = new Set<string>();
  let parcelamentosCriados = 0;
  let totalLinhas = 0;

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    if (row.cellCount === 0 || row.values === undefined || (Array.isArray(row.values) && row.values.filter(Boolean).length === 0)) {
      continue;
    }
    const empresaCell = colIndexByKey.get("empresa");
    if (!empresaCell || !cellToString(row.getCell(empresaCell).value)) {
      continue;
    }

    totalLinhas++;

    const get = (key: string) => {
      const idx = colIndexByKey.get(key);
      return idx ? row.getCell(idx).value : undefined;
    };

    const esferaRaw = normalizeHeader(cellToString(get("esfera")));
    const statusRaw = normalizeHeader(cellToString(get("status")));

    const raw = {
      empresa: cellToString(get("empresa")),
      cnpj: cellToString(get("cnpj")) || undefined,
      esfera: ESFERA_ALIASES[esferaRaw],
      orgao: cellToString(get("orgao")),
      numero: cellToString(get("numero")) || undefined,
      descricao: cellToString(get("descricao")) || undefined,
      valorOriginal: cellToNumber(get("valorOriginal")),
      valorTotal: cellToNumber(get("valorTotal")),
      numeroParcelas: cellToNumber(get("numeroParcelas")),
      dataInicio: cellToDate(get("dataInicio")),
      parcelasPagas: cellToNumber(get("parcelasPagas")),
      status: STATUS_ALIASES[statusRaw] ?? "ATIVO",
      observacoes: cellToString(get("observacoes")) || undefined,
    };

    const parsed = RowSchema.safeParse(raw);
    if (!parsed.success) {
      erros.push({ linha: rowNumber, motivo: parsed.error.issues[0]?.message ?? "Dados inválidos." });
      continue;
    }

    try {
      await criarParcelamentoImportado(parsed.data, empresasCriadasIds);
      parcelamentosCriados++;
    } catch (e) {
      erros.push({ linha: rowNumber, motivo: e instanceof Error ? e.message : "Erro ao salvar." });
    }
  }

  return { totalLinhas, parcelamentosCriados, empresasCriadas: empresasCriadasIds.size, erros };
}

async function criarParcelamentoImportado(data: ParsedRow, empresasCriadasIds: Set<string>) {
  let empresa = data.cnpj
    ? await db.empresa.findUnique({ where: { cnpj: data.cnpj } })
    : await db.empresa.findFirst({ where: { nome: { equals: data.empresa } } });

  if (!empresa) {
    empresa = await db.empresa.create({ data: { nome: data.empresa, cnpj: data.cnpj } });
    empresasCriadasIds.add(empresa.id);
  }

  const parcelas = gerarParcelas(data.valorTotal, data.numeroParcelas, data.dataInicio);
  const parcelasPagas = Math.min(data.parcelasPagas ?? 0, parcelas.length);

  const parcelasComPagamento = parcelas.map((p, i) => {
    if (i < parcelasPagas) {
      return { ...p, status: "PAGA" as const, dataPagamento: p.vencimento, valorPago: p.valor };
    }
    return p;
  });

  await db.parcelamento.create({
    data: {
      empresaId: empresa.id,
      esfera: data.esfera,
      orgao: data.orgao,
      numero: data.numero,
      descricao: data.descricao,
      valorOriginal: data.valorOriginal,
      valorTotal: data.valorTotal,
      numeroParcelas: data.numeroParcelas,
      dataInicio: data.dataInicio,
      status: data.status,
      observacoes: data.observacoes,
      parcelas: { create: parcelasComPagamento },
    },
  });
}
