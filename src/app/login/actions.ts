"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginState =
  | {
      error?: string;
    }
  | undefined;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession({ userId: user.id, name: user.name, email: user.email });
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
