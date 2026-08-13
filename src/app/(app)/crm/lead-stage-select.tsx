"use client";

import { ESTAGIO_FUNIL_LABELS } from "@/lib/format";
import { moveLeadStage } from "./actions";

const OPCOES = [
  "NOVO_LEAD",
  "CONTATO_REALIZADO",
  "PROPOSTA_ENVIADA",
  "CONTRATO_ENVIADO",
  "GANHO",
  "PERDIDO",
] as const;

export function LeadStageSelect({ leadId, estagio }: { leadId: string; estagio: string }) {
  return (
    <form action={moveLeadStage.bind(null, leadId)}>
      <select
        name="estagio"
        defaultValue={estagio}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
      >
        {OPCOES.map((op) => (
          <option key={op} value={op}>
            {ESTAGIO_FUNIL_LABELS[op]}
          </option>
        ))}
      </select>
    </form>
  );
}
