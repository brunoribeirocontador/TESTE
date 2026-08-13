"use client";

import { useActionState } from "react";
import { convertLeadToCliente, type ConverterLeadFormState } from "../actions";

export function ConvertLeadForm({
  leadId,
  nomeSugerido,
  cnpjSugerido,
  tipoServicoSugerido,
}: {
  leadId: string;
  nomeSugerido: string;
  cnpjSugerido: string;
  tipoServicoSugerido: string | null;
}) {
  const action = convertLeadToCliente.bind(null, leadId);
  const [state, formAction, pending] = useActionState<ConverterLeadFormState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-emerald-900">Converter lead em cliente</h3>
        <p className="text-xs text-emerald-700">
          Cria a empresa e monta automaticamente o checklist de implantação (contrato, cadastro no
          Asaas, Domínio e Sieg).
        </p>
      </div>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
          Nome da empresa
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={nomeSugerido}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700">
          CNPJ <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="cnpj"
          name="cnpj"
          defaultValue={cnpjSugerido}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700">Origem do cliente</legend>
        <div className="mt-1 space-y-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="origem"
              value="ABERTURA_CNPJ"
              defaultChecked={tipoServicoSugerido !== "MIGRACAO_CONTABILIDADE"}
            />
            Abertura de CNPJ (empresa nova)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="origem"
              value="MIGRACAO_CONTABILIDADE"
              defaultChecked={tipoServicoSugerido === "MIGRACAO_CONTABILIDADE"}
            />
            Migração de outra contabilidade
          </label>
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Convertendo..." : "Converter em cliente"}
      </button>
    </form>
  );
}
