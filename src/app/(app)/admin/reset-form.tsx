"use client";

import { useActionState } from "react";
import { resetarBase, type ResetFormState } from "./actions";

export function ResetForm() {
  const [state, formAction, pending] = useActionState<ResetFormState, FormData>(
    resetarBase,
    undefined
  );

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(e) => {
        if (
          !confirm(
            "Isso vai apagar TODOS os parcelamentos e parcelas de TODAS as empresas, permanentemente. As empresas cadastradas continuam. Confirma?"
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <p className="text-sm text-red-700">
        Apaga todos os parcelamentos e parcelas cadastrados (as empresas continuam). Essa ação não
        pode ser desfeita.
      </p>
      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
          Digite sua senha para confirmar
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full max-w-xs rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-600">Base resetada. Todos os parcelamentos foram apagados.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? "Apagando..." : "Apagar todos os parcelamentos"}
      </button>
    </form>
  );
}
