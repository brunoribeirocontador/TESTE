"use client";

import { useActionState } from "react";
import { atualizarConfiguracao, type ConfigFormState } from "./actions";

export function ConfigForm({
  defaultValues,
}: {
  defaultValues: { nome: string; telefone: string | null; corEmail: string; logo: string | null };
}) {
  const [state, formAction, pending] = useActionState<ConfigFormState, FormData>(
    atualizarConfiguracao,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
          Nome do escritório
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={defaultValues.nome}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="telefone" className="block text-sm font-medium text-slate-700">
          Telefone do escritório <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="telefone"
          name="telefone"
          defaultValue={defaultValues.telefone ?? ""}
          placeholder="(11) 99999-9999"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="corEmail" className="block text-sm font-medium text-slate-700">
          Cor do layout dos e-mails
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            id="corEmail"
            name="corEmail"
            type="color"
            defaultValue={defaultValues.corEmail}
            className="h-9 w-14 rounded-md border border-slate-300"
          />
          <span className="text-xs text-slate-500">
            Usada no cabeçalho dos comunicados enviados aos clientes.
          </span>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Logo do escritório</span>
        {defaultValues.logo && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={defaultValues.logo} alt="Logo atual" className="h-12 w-auto rounded border border-slate-200 bg-white p-1" />
            <label className="flex items-center gap-1.5 text-xs text-slate-500">
              <input type="checkbox" name="removerLogo" className="rounded border-slate-300" />
              Remover logo atual
            </label>
          </div>
        )}
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <p className="mt-1 text-xs text-slate-500">PNG, JPG ou SVG, até 500 KB.</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Configurações salvas.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
