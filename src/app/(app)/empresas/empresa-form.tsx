"use client";

import { useActionState } from "react";
import type { EmpresaFormState } from "./actions";

type Action = (state: EmpresaFormState, formData: FormData) => Promise<EmpresaFormState>;

export function EmpresaForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  defaultValues?: {
    nome: string;
    cnpj: string | null;
    telefone?: string | null;
    email?: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
          Nome da empresa
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={defaultValues?.nome}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div>
        <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700">
          CNPJ <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="cnpj"
          name="cnpj"
          defaultValue={defaultValues?.cnpj ?? ""}
          placeholder="00.000.000/0000-00"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-slate-700">
            Telefone <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            defaultValue={defaultValues?.telefone ?? ""}
            placeholder="(11) 99999-9999"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            placeholder="contato@empresa.com"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
