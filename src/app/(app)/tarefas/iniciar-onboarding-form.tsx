"use client";

import { iniciarOnboarding } from "./actions";

export function IniciarOnboardingForm({ empresaId }: { empresaId: string }) {
  return (
    <form action={iniciarOnboarding.bind(null, empresaId)} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Iniciar implantação</h3>
        <p className="text-xs text-slate-500">
          Monta o checklist de implantação (contrato, cadastro no Asaas, Domínio e Sieg) para esta empresa.
        </p>
      </div>
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" name="origem" value="ABERTURA_CNPJ" defaultChecked />
          Abertura de CNPJ (empresa nova)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" name="origem" value="MIGRACAO_CONTABILIDADE" />
          Migração de outra contabilidade
        </label>
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Iniciar implantação
      </button>
    </form>
  );
}
