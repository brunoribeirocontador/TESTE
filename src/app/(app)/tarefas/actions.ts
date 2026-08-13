"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { parseDateOnlyUTC } from "@/lib/dates";
import { getOnboardingTemplate } from "@/lib/onboarding-templates";

const STATUS = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"] as const;

export async function updateTarefaStatus(tarefaId: string, formData: FormData) {
  await verifySession();

  const status = formData.get("status");
  if (typeof status !== "string" || !STATUS.includes(status as (typeof STATUS)[number])) {
    return;
  }

  const tarefa = await db.tarefaOnboarding.update({
    where: { id: tarefaId },
    data: {
      status: status as (typeof STATUS)[number],
      concluidaEm: status === "CONCLUIDA" ? new Date() : null,
    },
  });

  revalidatePath("/tarefas");
  revalidatePath(`/empresas/${tarefa.empresaId}`);
}

const NovaTarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe o título da tarefa."),
  categoria: z.string().trim().min(1, "Informe a categoria."),
  prazo: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function createTarefaManual(empresaId: string, formData: FormData) {
  await verifySession();

  const parsed = NovaTarefaSchema.safeParse({
    titulo: formData.get("titulo"),
    categoria: formData.get("categoria"),
    prazo: formData.get("prazo"),
  });
  if (!parsed.success) return;

  const ultima = await db.tarefaOnboarding.findFirst({
    where: { empresaId },
    orderBy: { ordem: "desc" },
  });

  await db.tarefaOnboarding.create({
    data: {
      empresaId,
      titulo: parsed.data.titulo,
      categoria: parsed.data.categoria,
      prazo: parsed.data.prazo ? parseDateOnlyUTC(parsed.data.prazo) : undefined,
      ordem: (ultima?.ordem ?? -1) + 1,
    },
  });

  revalidatePath("/tarefas");
  revalidatePath(`/empresas/${empresaId}`);
}

export async function deleteTarefa(tarefaId: string) {
  await verifySession();
  const tarefa = await db.tarefaOnboarding.delete({ where: { id: tarefaId } });
  revalidatePath("/tarefas");
  revalidatePath(`/empresas/${tarefa.empresaId}`);
}

const OrigemSchema = z.enum(["ABERTURA_CNPJ", "MIGRACAO_CONTABILIDADE"]);

export async function iniciarOnboarding(empresaId: string, formData: FormData) {
  await verifySession();

  const parsed = OrigemSchema.safeParse(formData.get("origem"));
  if (!parsed.success) return;

  const empresa = await db.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa || empresa.origem) return;

  const template = getOnboardingTemplate(parsed.data);

  await db.empresa.update({
    where: { id: empresaId },
    data: {
      origem: parsed.data,
      dataConversao: new Date(),
      tarefas: {
        create: template.map((t, i) => ({ titulo: t.titulo, categoria: t.categoria, ordem: i })),
      },
    },
  });

  revalidatePath("/tarefas");
  revalidatePath(`/empresas/${empresaId}`);
}
