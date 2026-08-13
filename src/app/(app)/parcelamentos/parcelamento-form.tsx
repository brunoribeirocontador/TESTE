"use client";

import { useActionState } from "react";
import { createParcelamento, type ParcelamentoFormState } from "./actions";

type Empresa = { id: string; nome: string };

export function ParcelamentoForm({
  empresas,
  defaultEmpresaId,
}: {
  empresas: Empresa[];
  defaultEmpresaId?: string;
}) {
  const [state, formAction, pending] = useActionState<ParcelamentoFormState, FormData>(
    createParcelamento,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="empresaId" className="block text-sm font-medium text-slate-700">
          Empresa
        </label>
        <select
          id="empresaId"
          name="empresaId"
          required
          defaultValue={defaultEmpresaId ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="" disabled>
            Selecione...
          </option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="esfera" className="block text-sm font-medium text-slate-700">
            Esfera
          </label>
          <select
            id="esfera"
            name="esfera"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="" disabled>
              Selecione...
            </option>
            <option value="FEDERAL">Federal</option>
            <option value="ESTADUAL">Estadual</option>
            <option value="MUNICIPAL">Municipal</option>
          </select>
        </div>
        <div>
          <label htmlFor="orgao" className="block text-sm font-medium text-slate-700">
            Órgão
          </label>
          <input
            id="orgao"
            name="orgao"
            required
            placeholder="Ex.: Receita Federal, Sefaz-SP, Prefeitura"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="numero" className="block text-sm font-medium text-slate-700">
            Número do parcelamento <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="numero"
            name="numero"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="dataInicio" className="block text-sm font-medium text-slate-700">
            Vencimento da 1ª parcela
          </label>
          <input
            id="dataInicio"
            name="dataInicio"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="valorTotal" className="block text-sm font-medium text-slate-700">
            Valor total negociado (R$)
          </label>
          <input
            id="valorTotal"
            name="valorTotal"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="numeroParcelas" className="block text-sm font-medium text-slate-700">
            Número de parcelas
          </label>
          <input
            id="numeroParcelas"
            name="numeroParcelas"
            type="number"
            step="1"
            min="1"
            max="600"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="valorOriginal" className="block text-sm font-medium text-slate-700">
          Valor original antes da redução (R$) <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="valorOriginal"
          name="valorOriginal"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Preencha se este parcelamento teve desconto/redução de multa e juros"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Se informado, a diferença entre este valor e o valor total negociado entra no painel de
          economia do escritório.
        </p>
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">
          Descrição <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="descricao"
          name="descricao"
          placeholder="Ex.: Parcelamento de INSS, ICMS, ISS..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
          Observações <span className="text-slate-400">(opcional)</span>
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <p className="text-xs text-slate-500">
        As parcelas serão geradas automaticamente, uma por mês, a partir da data informada.
      </p>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Cadastrar parcelamento"}
      </button>
    </form>
  );
}
