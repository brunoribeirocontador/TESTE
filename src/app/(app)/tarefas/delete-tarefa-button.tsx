"use client";

import { deleteTarefa } from "./actions";

export function DeleteTarefaButton({ id }: { id: string }) {
  return (
    <form action={deleteTarefa.bind(null, id)}>
      <button type="submit" className="text-xs text-slate-400 hover:text-red-600" title="Excluir tarefa">
        Excluir
      </button>
    </form>
  );
}
