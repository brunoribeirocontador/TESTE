"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export async function alternarNotificado(parcelaId: string) {
  await verifySession();

  const parcela = await db.parcela.findUnique({
    where: { id: parcelaId },
    select: { notificado: true },
  });
  if (!parcela) return;

  await db.parcela.update({
    where: { id: parcelaId },
    data: {
      notificado: !parcela.notificado,
      dataNotificacao: !parcela.notificado ? new Date() : null,
    },
  });

  revalidatePath("/mensal");
  revalidatePath("/dashboard");
}
