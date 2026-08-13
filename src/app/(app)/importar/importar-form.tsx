"use client";

import { useActionState } from "react";
import { importarPlanilha, type ImportFormState } from "./actions";

export function ImportarForm() {
  const [state, formAction, pending] = useActionState<ImportFormState, FormData>(
    importarPlanilha,
    undefined
  );

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="arquivo" className="block text-sm font-medium text-slate-700">
            Arquivo .xlsx preenchido
          </label>
          <input
            id="arquivo"
            name="arquivo"
            type="file"
            accept=".xlsx"
            required
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Importando..." : "Importar planilha"}
        </button>
      </form>

      {state && !state.ok && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.erroGeral}
        </p>
      )}

      {state?.ok && (
        <div className="mt-4 space-y-3">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {state.resultado.parcelamentosCriados} de {state.resultado.totalLinhas} linha(s)
            importada(s) com sucesso
            {state.resultado.empresasCriadas > 0 &&
              ` (${state.resultado.empresasCriadas} empresa(s) nova(s) cadastrada(s))`}
            .
          </div>

          {state.resultado.erros.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">
                {state.resultado.erros.length} linha(s) com problema (não importadas):
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {state.resultado.erros.map((erro, i) => (
                  <li key={i}>
                    Linha {erro.linha}: {erro.motivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
