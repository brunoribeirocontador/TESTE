"use client";

import { useRef } from "react";
import { addInteracao } from "../actions";

export function InteracaoForm({ leadId }: { leadId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addInteracao(leadId, formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap gap-2"
    >
      <select
        name="tipo"
        defaultValue="Nota"
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      >
        <option value="Nota">Nota</option>
        <option value="Ligação">Ligação</option>
        <option value="E-mail">E-mail</option>
        <option value="Reunião">Reunião</option>
        <option value="WhatsApp">WhatsApp</option>
      </select>
      <input
        name="descricao"
        required
        placeholder="O que aconteceu?"
        className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Registrar
      </button>
    </form>
  );
}
