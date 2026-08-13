import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getConfiguracao = cache(async () => {
  const existente = await db.configuracaoEscritorio.findUnique({ where: { id: "default" } });
  if (existente) return existente;
  return db.configuracaoEscritorio.create({ data: { id: "default" } });
});
