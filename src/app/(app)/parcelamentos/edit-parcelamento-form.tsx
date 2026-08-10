"use client";

import { useActionState } from "react";
import type { ParcelamentoFormState } from "./actions";

type Action = (state: ParcelamentoFormState, formData: FormData) => Promise<ParcelamentoFormState>;

export function EditParcelamentoForm({
  action,
  defaultValues,
}: {
  action: Action;
  defaultValues: {
    orgao: string;
    numero: string | null;
    descricao: string | null;
    observacoes: string | null;
    status: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="orgao" className="block text-sm font-medium text-slate-700">
            Órgão
          </label>
          <input
            id="orgao"
            name="orgao"
            required
            defaultValue={defaultValues.orgao}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="numero" className="block text-sm font-medium text-slate-700">
            Número
          </label>
          <input
            id="numero"
            name="numero"
            defaultValue={defaultValues.numero ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues.status}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="ATIVO">Ativo</option>
          <option value="QUITADO">Quitado</option>
          <option value="RESCINDIDO">Rescindido</option>
        </select>
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <input
          id="descricao"
          name="descricao"
          defaultValue={defaultValues.descricao ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={defaultValues.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
