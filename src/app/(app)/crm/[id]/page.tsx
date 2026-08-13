import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ESTAGIO_FUNIL_LABELS } from "@/lib/format";
import { updateLead } from "../actions";
import { LeadForm } from "../lead-form";
import { LeadStageSelect } from "../lead-stage-select";
import { DeleteLeadButton } from "../delete-lead-button";
import { ConvertLeadForm } from "./convert-lead-form";
import { InteracaoForm } from "./interacao-form";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: { interacoes: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) {
    notFound();
  }

  const boundUpdate = updateLead.bind(null, lead.id);

  return (
    <div>
      <Link href="/crm" className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{lead.empresaNome || lead.nome}</h1>
          <p className="text-sm text-slate-500">Estágio atual: {ESTAGIO_FUNIL_LABELS[lead.estagio]}</p>
        </div>
        <div className="w-56">
          <LeadStageSelect leadId={lead.id} estagio={lead.estagio} />
        </div>
      </div>

      {lead.estagio === "PERDIDO" && lead.motivoPerda && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Motivo da perda: {lead.motivoPerda}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Dados do lead</h2>
            <div className="mt-4">
              <LeadForm
                action={boundUpdate}
                defaultValues={{
                  nome: lead.nome,
                  empresaNome: lead.empresaNome,
                  cnpj: lead.cnpj,
                  telefone: lead.telefone,
                  email: lead.email,
                  origemLead: lead.origemLead,
                  tipoServico: lead.tipoServico,
                  valorProposta: lead.valorProposta,
                  responsavel: lead.responsavel,
                  observacoes: lead.observacoes,
                }}
                submitLabel="Salvar alterações"
              />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <DeleteLeadButton id={lead.id} nome={lead.nome} />
            </div>
          </div>

          {lead.empresaId ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">Este lead já virou cliente.</p>
              <Link href={`/empresas/${lead.empresaId}`} className="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline">
                Ver ficha do cliente →
              </Link>
            </div>
          ) : lead.estagio === "GANHO" ? (
            <ConvertLeadForm
              leadId={lead.id}
              nomeSugerido={lead.empresaNome || lead.nome}
              cnpjSugerido={lead.cnpj ?? ""}
              tipoServicoSugerido={lead.tipoServico}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-400">
              Mova o lead para o estágio &quot;Ganho&quot; para poder convertê-lo em cliente.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Histórico de interações</h2>
          <div className="mt-3">
            <InteracaoForm leadId={lead.id} />
          </div>

          <ul className="mt-4 space-y-2">
            {lead.interacoes.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                Nenhuma interação registrada ainda.
              </p>
            )}
            {lead.interacoes.map((i) => (
              <li key={i.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {i.tipo}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                      i.createdAt
                    )}
                  </span>
                </div>
                <p className="mt-1 text-slate-700">{i.descricao}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
