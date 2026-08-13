import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, ESFERA_LABELS } from "@/lib/format";
import {
  addMonthsUTC,
  formatMonthLabel,
  parseMonthParam,
  startOfNextMonthUTC,
  toMonthParam,
} from "@/lib/dates";
import { alternarNotificado } from "./actions";

export default async function MensalPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const inicio = parseMonthParam(mes);
  const fim = startOfNextMonthUTC(inicio);
  const mesAnterior = addMonthsUTC(inicio, -1);
  const mesSeguinte = addMonthsUTC(inicio, 1);

  const parcelas = await db.parcela.findMany({
    where: { vencimento: { gte: inicio, lt: fim } },
    include: { parcelamento: { include: { empresa: true } } },
    orderBy: [{ parcelamento: { empresa: { nome: "asc" } } }, { vencimento: "asc" }],
  });

  const enviadas = parcelas.filter((p) => p.notificado).length;
  const pendentesEnvio = parcelas.length - enviadas;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Envio mensal aos clientes</h1>
          <p className="text-sm text-slate-500">
            Controle de quais parcelas do mês já foram avisadas/enviadas para cada cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/mensal?mes=${toMonthParam(mesAnterior)}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ← Mês anterior
          </Link>
          <span className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white">
            {formatMonthLabel(inicio)}
          </span>
          <Link
            href={`/mensal?mes=${toMonthParam(mesSeguinte)}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Próximo mês →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Parcelas no mês
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{parcelas.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Já enviadas ao cliente
          </p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{enviadas}</p>
        </div>
        <div
          className={`rounded-lg border p-4 ${pendentesEnvio > 0 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Ainda não enviadas
          </p>
          <p className={`mt-1 text-xl font-semibold ${pendentesEnvio > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {pendentesEnvio}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Empresa</th>
              <th className="px-4 py-2">Esfera</th>
              <th className="px-4 py-2">Órgão</th>
              <th className="px-4 py-2">Vencimento</th>
              <th className="px-4 py-2 text-right">Valor</th>
              <th className="px-4 py-2">Status pagamento</th>
              <th className="px-4 py-2">Enviado ao cliente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parcelas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma parcela com vencimento neste mês.
                </td>
              </tr>
            )}
            {parcelas.map((parcela) => (
              <tr key={parcela.id} className={parcela.notificado ? undefined : "bg-amber-50/40"}>
                <td className="px-4 py-2">
                  <Link
                    href={`/parcelamentos/${parcela.parcelamentoId}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {parcela.parcelamento.empresa.nome}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {ESFERA_LABELS[parcela.parcelamento.esfera]}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700">{parcela.parcelamento.orgao}</td>
                <td className="px-4 py-2 text-slate-700">{formatDate(parcela.vencimento)}</td>
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
                  <form action={alternarNotificado.bind(null, parcela.id)}>
                    <button
                      type="submit"
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        parcela.notificado
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {parcela.notificado
                        ? `✓ Enviado${parcela.dataNotificacao ? " em " + formatDate(parcela.dataNotificacao) : ""}`
                        : "Marcar como enviado"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
