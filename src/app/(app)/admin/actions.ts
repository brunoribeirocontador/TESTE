"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { verifyPassword } from "@/lib/password";

const ConfigSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do escritório."),
  telefone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  corEmail: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida."),
});

export type ConfigFormState = { error?: string; success?: boolean } | undefined;

const MAX_LOGO_BYTES = 500 * 1024;

export async function atualizarConfiguracao(
  _prevState: ConfigFormState,
  formData: FormData
): Promise<ConfigFormState> {
  await verifySession();

  const parsed = ConfigSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    corEmail: formData.get("corEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let logoDataUrl: string | undefined;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { error: "A imagem do logo deve ter no máximo 500 KB." };
    }
    if (!logoFile.type.startsWith("image/")) {
      return { error: "Envie um arquivo de imagem (PNG, JPG ou SVG)." };
    }
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    logoDataUrl = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
  }

  const removerLogo = formData.get("removerLogo") === "on";

  await db.configuracaoEscritorio.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      corEmail: parsed.data.corEmail,
      logo: logoDataUrl,
    },
    update: {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      corEmail: parsed.data.corEmail,
      ...(logoDataUrl ? { logo: logoDataUrl } : {}),
      ...(removerLogo ? { logo: null } : {}),
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

const ResetSchema = z.object({
  senha: z.string().min(1, "Informe sua senha para confirmar."),
});

export type ResetFormState = { error?: string; success?: boolean } | undefined;

export async function resetarBase(
  _prevState: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  const session = await verifySession();

  const parsed = ResetSchema.safeParse({ senha: formData.get("senha") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Informe sua senha." };
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { error: "Sessão inválida." };
  }

  const senhaValida = await verifyPassword(parsed.data.senha, user.passwordHash);
  if (!senhaValida) {
    return { error: "Senha incorreta." };
  }

  await db.parcelamento.deleteMany({});

  revalidatePath("/", "layout");
  return { success: true };
}
