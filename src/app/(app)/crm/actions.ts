"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { getOnboardingTemplate } from "@/lib/onboarding-templates";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const LeadSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do contato."),
  empresaNome: optionalText,
  cnpj: optionalText,
  telefone: optionalText,
  email: optionalText,
  origemLead: optionalText,
  tipoServico: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "ABERTURA_CNPJ" || v === "MIGRACAO_CONTABILIDADE" ? v : undefined)),
  valorProposta: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  responsavel: optionalText,
  observacoes: optionalText,
});

export type LeadFormState = { error?: string } | undefined;

function readLeadForm(formData: FormData) {
  return LeadSchema.safeParse({
    nome: formData.get("nome"),
    empresaNome: formData.get("empresaNome"),
    cnpj: formData.get("cnpj"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    origemLead: formData.get("origemLead"),
    tipoServico: formData.get("tipoServico"),
    valorProposta: formData.get("valorProposta"),
    responsavel: formData.get("responsavel"),
    observacoes: formData.get("observacoes"),
  });
}

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  await verifySession();

  const parsed = readLeadForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const lead = await db.lead.create({ data: parsed.data });

  revalidatePath("/crm");
  redirect(`/crm/${lead.id}`);
}

export async function updateLead(
  id: string,
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  await verifySession();

  const parsed = readLeadForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db.lead.update({ where: { id }, data: parsed.data });

  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
  return undefined;
}

export async function deleteLead(id: string) {
  await verifySession();
  await db.lead.delete({ where: { id } });
  revalidatePath("/crm");
  redirect("/crm");
}

const ESTAGIOS = [
  "NOVO_LEAD",
  "CONTATO_REALIZADO",
  "PROPOSTA_ENVIADA",
  "CONTRATO_ENVIADO",
  "GANHO",
  "PERDIDO",
] as const;

export async function moveLeadStage(id: string, formData: FormData) {
  await verifySession();

  const estagio = formData.get("estagio");
  if (typeof estagio !== "string" || !ESTAGIOS.includes(estagio as (typeof ESTAGIOS)[number])) {
    return;
  }

  const motivoPerda = estagio === "PERDIDO" ? (formData.get("motivoPerda") as string | null) : null;

  await db.lead.update({
    where: { id },
    data: {
      estagio: estagio as (typeof ESTAGIOS)[number],
      motivoPerda: motivoPerda?.trim() || undefined,
    },
  });

  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
}

export async function addInteracao(leadId: string, formData: FormData) {
  await verifySession();

  const tipo = (formData.get("tipo") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim();
  if (!tipo || !descricao) return;

  await db.leadInteracao.create({ data: { leadId, tipo, descricao } });

  revalidatePath(`/crm/${leadId}`);
}

const ConverterSchema = z.object({
  origem: z.enum(["ABERTURA_CNPJ", "MIGRACAO_CONTABILIDADE"], {
    error: "Selecione a origem do cliente.",
  }),
  nome: z.string().trim().min(2, "Informe o nome da empresa."),
  cnpj: optionalText,
});

export type ConverterLeadFormState = { error?: string } | undefined;

export async function convertLeadToCliente(
  leadId: string,
  _prevState: ConverterLeadFormState,
  formData: FormData
): Promise<ConverterLeadFormState> {
  await verifySession();

  const parsed = ConverterSchema.safeParse({
    origem: formData.get("origem"),
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return { error: "Lead não encontrado." };
  }
  if (lead.empresaId) {
    redirect(`/empresas/${lead.empresaId}`);
  }

  const template = getOnboardingTemplate(parsed.data.origem);

  let empresaId: string;
  try {
    const empresa = await db.empresa.create({
      data: {
        nome: parsed.data.nome,
        cnpj: parsed.data.cnpj,
        origem: parsed.data.origem,
        dataConversao: new Date(),
        tarefas: {
          create: template.map((t, i) => ({ titulo: t.titulo, categoria: t.categoria, ordem: i })),
        },
      },
    });
    empresaId = empresa.id;
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique")) {
      return { error: "Já existe uma empresa cadastrada com esse CNPJ." };
    }
    throw e;
  }

  await db.lead.update({ where: { id: leadId }, data: { estagio: "GANHO", empresaId } });

  revalidatePath("/crm");
  revalidatePath(`/crm/${leadId}`);
  revalidatePath("/empresas");
  revalidatePath("/tarefas");
  redirect(`/empresas/${empresaId}`);
}
