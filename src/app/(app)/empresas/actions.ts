"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

const EmpresaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da empresa."),
  cnpj: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type EmpresaFormState = { error?: string } | undefined;

export async function createEmpresa(
  _prevState: EmpresaFormState,
  formData: FormData
): Promise<EmpresaFormState> {
  await verifySession();

  const parsed = EmpresaSchema.safeParse({
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let empresaId: string;
  try {
    const empresa = await db.empresa.create({ data: parsed.data });
    empresaId = empresa.id;
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique")) {
      return { error: "Já existe uma empresa cadastrada com esse CNPJ." };
    }
    throw e;
  }

  revalidatePath("/empresas");
  redirect(`/empresas/${empresaId}`);
}

export async function updateEmpresa(
  id: string,
  _prevState: EmpresaFormState,
  formData: FormData
): Promise<EmpresaFormState> {
  await verifySession();

  const parsed = EmpresaSchema.safeParse({
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await db.empresa.update({ where: { id }, data: parsed.data });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique")) {
      return { error: "Já existe uma empresa cadastrada com esse CNPJ." };
    }
    throw e;
  }

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${id}`);
  return undefined;
}

export async function deleteEmpresa(id: string) {
  await verifySession();
  await db.empresa.delete({ where: { id } });
  revalidatePath("/empresas");
  redirect("/empresas");
}
