import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, ESFERA_LABELS, STATUS_PARCELAMENTO_LABELS } from "@/lib/format";
import { startOfTodayUTC, toDateInputValue } from "@/lib/dates";
import { updateParcelamento } from "../actions";
import { EditParcelamentoForm } from "../edit-parcelamento-form";
import { DeleteParcelamentoButton } from "../delete-parcelamento-button";
import { PagarParcelaForm, DesfazerPagamentoButton } from "../parcela-actions";

export default async function ParcelamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const parcelamento = await db.parcelamento.findUnique({
    where: { id },
    include: { empresa: true, parcelas: { orderBy: { numero: "asc" } } },
  });

  if (!parcelamento) {
    notFound();
  }

  const hoje = startOfTodayUTC();
  const pendentes = parcelamento.parcelas.filter((p) => p.status === "PENDENTE");
  const saldo = pendentes.reduce((acc, p) => acc + p.valor, 0);
  const boundUpdate = updateParcelamento.bind(null, parcelamento.id);

  return (
    <div>
      <Link href="/parcelamentos" className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {ESFERA_LABELS[parcelamento.esfera]}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                parcelamento.status === "ATIVO"
                  ? "bg-emerald-50 text-emerald-700"
                  : parcelamento.status === "QUITADO"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {STATUS_PARCELAMENTO_LABELS[parcelamento.status]}
            </span>
          </div>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">
            {parcelamento.orgao}
            {parcelamento.numero ? ` — nº ${parcelamento.numero}` : ""}
          </h1>
          <Link href={`/empresas/${parcelamento.empresaId}`} className="text-sm text-slate-500 hover:underline">
            {parcelamento.empresa.nome}
          </Link>
          {parcelamento.descricao && <p className="mt-1 text-sm text-slate-600">{parcelamento.descricao}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Saldo devedor</p>
          <p className="text-xl font-semibold text-slate-900">{formatCurrency(saldo)}</p>
          <p className="text-xs text-slate-500">
            {parcelamento.numeroParcelas - pendentes.length}/{parcelamento.numeroParcelas} parcelas pagas
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Parcelas</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Vencimento</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parcelamento.parcelas.map((parcela) => {
                  const atrasada = parcela.status === "PENDENTE" && parcela.vencimento < hoje;
                  return (
                    <tr key={parcela.id} className={atrasada ? "bg-red-50/50" : undefined}>
                      <td className="px-4 py-2 text-slate-500">{parcela.numero}</td>
                      <td className="px-4 py-2 text-slate-700">
                        {formatDate(parcela.vencimento)}
                        {atrasada && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                            Atrasada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {formatCurrency(parcela.valor)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            parcela.status === "PAGA"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {parcela.status === "PAGA" ? "Paga" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {parcela.status === "PAGA" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {parcela.dataPagamento && formatDate(parcela.dataPagamento)} ·{" "}
                              {parcela.valorPago !== null && formatCurrency(parcela.valorPago)}
                            </span>
                            <DesfazerPagamentoButton parcelaId={parcela.id} />
                          </div>
                        ) : (
                          <PagarParcelaForm
                            parcelaId={parcela.id}
                            valorSugerido={parcela.valor}
                            dataSugerida={toDateInputValue(hoje)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Editar parcelamento</h2>
            <div className="mt-4">
              <EditParcelamentoForm
                action={boundUpdate}
                defaultValues={{
                  orgao: parcelamento.orgao,
                  numero: parcelamento.numero,
                  descricao: parcelamento.descricao,
                  observacoes: parcelamento.observacoes,
                  status: parcelamento.status,
                }}
              />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <DeleteParcelamentoButton id={parcelamento.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
