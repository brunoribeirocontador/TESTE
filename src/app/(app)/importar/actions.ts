"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { importarPlanilhaBuffer, type ImportResult } from "@/lib/import-parcelamentos";

export type ImportFormState =
  | { ok: true; resultado: ImportResult }
  | { ok: false; erroGeral: string }
  | undefined;

export async function importarPlanilha(
  _prevState: ImportFormState,
  formData: FormData
): Promise<ImportFormState> {
  await verifySession();

  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, erroGeral: "Selecione um arquivo .xlsx para importar." };
  }

  const buffer = await file.arrayBuffer();

  let resultado: ImportResult;
  try {
    resultado = await importarPlanilhaBuffer(buffer);
  } catch {
    return {
      ok: false,
      erroGeral: "Não foi possível ler o arquivo. Confirme que é um .xlsx gerado a partir do modelo.",
    };
  }

  if (resultado.parcelamentosCriados > 0) {
    revalidatePath("/parcelamentos");
    revalidatePath("/empresas");
    revalidatePath("/dashboard");
  }

  return { ok: true, resultado };
}
