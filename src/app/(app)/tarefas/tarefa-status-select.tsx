"use client";

import { STATUS_TAREFA_LABELS } from "@/lib/format";
import { updateTarefaStatus } from "./actions";

const OPCOES = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"] as const;

export function TarefaStatusSelect({ tarefaId, status }: { tarefaId: string; status: string }) {
  return (
    <form action={updateTarefaStatus.bind(null, tarefaId)}>
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
      >
        {OPCOES.map((op) => (
          <option key={op} value={op}>
            {STATUS_TAREFA_LABELS[op]}
          </option>
        ))}
      </select>
    </form>
  );
}
