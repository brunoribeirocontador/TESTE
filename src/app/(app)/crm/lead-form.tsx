"use client";

import { useActionState } from "react";
import type { LeadFormState } from "./actions";

type Action = (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;

export type LeadDefaultValues = {
  nome: string;
  empresaNome: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  origemLead: string | null;
  tipoServico: string | null;
  valorProposta: number | null;
  responsavel: string | null;
  observacoes: string | null;
};

export function LeadForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  defaultValues?: LeadDefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do contato" name="nome" required defaultValue={defaultValues?.nome} />
        <Field label="Nome da empresa" name="empresaNome" defaultValue={defaultValues?.empresaNome ?? ""} />
        <Field label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" defaultValue={defaultValues?.cnpj ?? ""} />
        <Field label="Telefone" name="telefone" defaultValue={defaultValues?.telefone ?? ""} />
        <Field label="E-mail" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        <Field
          label="Origem do lead"
          name="origemLead"
          placeholder="Indicação, site, Instagram..."
          defaultValue={defaultValues?.origemLead ?? ""}
        />
        <div>
          <label htmlFor="tipoServico" className="block text-sm font-medium text-slate-700">
            O que o lead busca
          </label>
          <select
            id="tipoServico"
            name="tipoServico"
            defaultValue={defaultValues?.tipoServico ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">Não informado</option>
            <option value="ABERTURA_CNPJ">Abrir empresa (CNPJ novo)</option>
            <option value="MIGRACAO_CONTABILIDADE">Migrar de outra contabilidade</option>
          </select>
        </div>
        <Field
          label="Valor da proposta"
          name="valorProposta"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.valorProposta ?? ""}
        />
        <Field label="Responsável" name="responsavel" defaultValue={defaultValues?.responsavel ?? ""} />
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={defaultValues?.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
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

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  step,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
    </div>
  );
}
