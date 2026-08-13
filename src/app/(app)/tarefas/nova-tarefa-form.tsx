"use client";

import { useRef } from "react";
import { createTarefaManual } from "./actions";

export function NovaTarefaForm({ empresaId }: { empresaId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTarefaManual(empresaId, formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <div className="min-w-[180px] flex-1">
        <label className="block text-xs font-medium text-slate-500">Nova tarefa</label>
        <input
          name="titulo"
          required
          placeholder="Título da tarefa"
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="w-40">
        <label className="block text-xs font-medium text-slate-500">Categoria</label>
        <input
          name="categoria"
          required
          defaultValue="Outros"
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Prazo</label>
        <input
          name="prazo"
          type="date"
          className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Adicionar
      </button>
    </form>
  );
}
