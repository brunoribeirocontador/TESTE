"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { addMonthsUTC, parseDateOnlyUTC } from "@/lib/dates";

const ParcelamentoSchema = z.object({
  empresaId: z.string().min(1, "Selecione a empresa."),
  esfera: z.enum(["FEDERAL", "ESTADUAL", "MUNICIPAL"], {
    error: "Selecione a esfera.",
  }),
  orgao: z.string().trim().min(1, "Informe o órgão."),
  numero: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  descricao: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  valorTotal: z.coerce.number().positive("Informe um valor total maior que zero."),
  numeroParcelas: z.coerce
    .number()
    .int()
    .min(1, "Informe ao menos 1 parcela.")
    .max(600, "Número de parcelas muito alto."),
  dataInicio: z.string().min(1, "Informe a data de início."),
  observacoes: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type ParcelamentoFormState = { error?: string } | undefined;

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

export async function createParcelamento(
  _prevState: ParcelamentoFormState,
  formData: FormData
): Promise<ParcelamentoFormState> {
  await verifySession();

  const parsed = ParcelamentoSchema.safeParse({
    empresaId: formData.get("empresaId"),
    esfera: formData.get("esfera"),
    orgao: formData.get("orgao"),
    numero: formData.get("numero"),
    descricao: formData.get("descricao"),
    valorTotal: formData.get("valorTotal"),
    numeroParcelas: formData.get("numeroParcelas"),
    dataInicio: formData.get("dataInicio"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { valorTotal, numeroParcelas, dataInicio, ...rest } = parsed.data;
  const inicio = parseDateOnlyUTC(dataInicio);
  const parcelas = gerarParcelas(valorTotal, numeroParcelas, inicio);

  const parcelamento = await db.parcelamento.create({
    data: {
      ...rest,
      valorTotal,
      numeroParcelas,
      dataInicio: inicio,
      parcelas: { create: parcelas },
    },
  });

  revalidatePath("/parcelamentos");
  revalidatePath(`/empresas/${rest.empresaId}`);
  redirect(`/parcelamentos/${parcelamento.id}`);
}

const UpdateParcelamentoSchema = z.object({
  orgao: z.string().trim().min(1, "Informe o órgão."),
  numero: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  descricao: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  observacoes: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  status: z.enum(["ATIVO", "QUITADO", "RESCINDIDO"]),
});

export async function updateParcelamento(
  id: string,
  _prevState: ParcelamentoFormState,
  formData: FormData
): Promise<ParcelamentoFormState> {
  await verifySession();

  const parsed = UpdateParcelamentoSchema.safeParse({
    orgao: formData.get("orgao"),
    numero: formData.get("numero"),
    descricao: formData.get("descricao"),
    observacoes: formData.get("observacoes"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const parcelamento = await db.parcelamento.update({ where: { id }, data: parsed.data });

  revalidatePath("/parcelamentos");
  revalidatePath(`/parcelamentos/${id}`);
  revalidatePath(`/empresas/${parcelamento.empresaId}`);
  return undefined;
}

export async function deleteParcelamento(id: string) {
  await verifySession();
  const parcelamento = await db.parcelamento.delete({ where: { id } });
  revalidatePath("/parcelamentos");
  revalidatePath(`/empresas/${parcelamento.empresaId}`);
  redirect(`/empresas/${parcelamento.empresaId}`);
}

const PagamentoSchema = z.object({
  dataPagamento: z.string().min(1, "Informe a data do pagamento."),
  valorPago: z.coerce.number().positive("Informe um valor válido."),
});

export async function marcarParcelaPaga(parcelaId: string, formData: FormData) {
  await verifySession();

  const parsed = PagamentoSchema.safeParse({
    dataPagamento: formData.get("dataPagamento"),
    valorPago: formData.get("valorPago"),
  });

  if (!parsed.success) {
    return;
  }

  const parcela = await db.parcela.update({
    where: { id: parcelaId },
    data: {
      status: "PAGA",
      dataPagamento: parseDateOnlyUTC(parsed.data.dataPagamento),
      valorPago: parsed.data.valorPago,
    },
  });

  await atualizarStatusParcelamento(parcela.parcelamentoId);

  revalidatePath(`/parcelamentos/${parcela.parcelamentoId}`);
  revalidatePath("/parcelamentos");
  revalidatePath("/dashboard");
}

export async function desmarcarParcelaPaga(parcelaId: string) {
  await verifySession();

  const parcela = await db.parcela.update({
    where: { id: parcelaId },
    data: { status: "PENDENTE", dataPagamento: null, valorPago: null },
  });

  await atualizarStatusParcelamento(parcela.parcelamentoId);

  revalidatePath(`/parcelamentos/${parcela.parcelamentoId}`);
  revalidatePath("/parcelamentos");
  revalidatePath("/dashboard");
}

async function atualizarStatusParcelamento(parcelamentoId: string) {
  const parcelamento = await db.parcelamento.findUnique({
    where: { id: parcelamentoId },
    include: { parcelas: true },
  });
  if (!parcelamento || parcelamento.status === "RESCINDIDO") return;

  const todasPagas = parcelamento.parcelas.every((p) => p.status === "PAGA");
  const novoStatus = todasPagas ? "QUITADO" : "ATIVO";

  if (novoStatus !== parcelamento.status) {
    await db.parcelamento.update({ where: { id: parcelamentoId }, data: { status: novoStatus } });
  }
}
