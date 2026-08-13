import Link from "next/link";
import { db } from "@/lib/db";
import { ESTAGIO_FUNIL_LABELS, formatCurrency } from "@/lib/format";
import { LeadStageSelect } from "./lead-stage-select";

const COLUNAS = [
  "NOVO_LEAD",
  "CONTATO_REALIZADO",
  "PROPOSTA_ENVIADA",
  "CONTRATO_ENVIADO",
  "GANHO",
  "PERDIDO",
] as const;

export default async function CrmPage() {
  const leads = await db.lead.findMany({ orderBy: { updatedAt: "desc" } });

  const porEstagio = new Map<string, typeof leads>();
  for (const estagio of COLUNAS) porEstagio.set(estagio, []);
  for (const lead of leads) {
    porEstagio.get(lead.estagio)?.push(lead);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">CRM de vendas</h1>
          <p className="text-sm text-slate-500">
            Funil de vendas do escritório, do primeiro contato até o lead virar cliente.
          </p>
        </div>
        <Link
          href="/crm/novo"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo lead
        </Link>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {COLUNAS.map((estagio) => {
          const leadsDaColuna = porEstagio.get(estagio) ?? [];
          const total = leadsDaColuna.reduce((acc, l) => acc + (l.valorProposta ?? 0), 0);

          return (
            <div key={estagio} className="w-72 shrink-0">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-900">{ESTAGIO_FUNIL_LABELS[estagio]}</h2>
                <span className="text-xs text-slate-400">{leadsDaColuna.length}</span>
              </div>
              {total > 0 && <p className="px-1 text-xs text-slate-500">{formatCurrency(total)}</p>}

              <div className="mt-2 space-y-2">
                {leadsDaColuna.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
                    Nenhum lead aqui.
                  </p>
                )}
                {leadsDaColuna.map((lead) => (
                  <div key={lead.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <Link href={`/crm/${lead.id}`} className="font-medium text-slate-900 hover:underline">
                      {lead.empresaNome || lead.nome}
                    </Link>
                    {lead.empresaNome && <p className="text-xs text-slate-500">{lead.nome}</p>}
                    {lead.valorProposta != null && (
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatCurrency(lead.valorProposta)}
                      </p>
                    )}
                    {lead.responsavel && (
                      <p className="mt-1 text-xs text-slate-400">Responsável: {lead.responsavel}</p>
                    )}
                    <div className="mt-2">
                      <LeadStageSelect leadId={lead.id} estagio={lead.estagio} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
