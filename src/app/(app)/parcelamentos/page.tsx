import Link from "next/link";
import { db } from "@/lib/db";
import {
  ESFERA_LABELS,
  STATUS_PARCELAMENTO_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/format";

type Esfera = "FEDERAL" | "ESTADUAL" | "MUNICIPAL";
type StatusParcelamento = "ATIVO" | "QUITADO" | "RESCINDIDO";

export default async function ParcelamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ esfera?: string; status?: string; empresaId?: string }>;
}) {
  const filters = await searchParams;

  const where = {
    ...(filters.esfera ? { esfera: filters.esfera as Esfera } : {}),
    ...(filters.status ? { status: filters.status as StatusParcelamento } : {}),
    ...(filters.empresaId ? { empresaId: filters.empresaId } : {}),
  };

  const [parcelamentos, empresas] = await Promise.all([
    db.parcelamento.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { empresa: true, parcelas: true },
    }),
    db.empresa.findMany({ orderBy: { nome: "asc" } }),
  ]);

  function buildHref(next: Partial<typeof filters>) {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    if (merged.esfera) params.set("esfera", merged.esfera);
    if (merged.status) params.set("status", merged.status);
    if (merged.empresaId) params.set("empresaId", merged.empresaId);
    const qs = params.toString();
    return qs ? `/parcelamentos?${qs}` : "/parcelamentos";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Parcelamentos</h1>
          <p className="text-sm text-slate-500">Federais, estaduais e municipais de todas as empresas.</p>
        </div>
        <Link
          href="/parcelamentos/novo"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo parcelamento
        </Link>
      </div>

      <form className="mt-4 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <select
          name="esfera"
          defaultValue={filters.esfera ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">Todas as esferas</option>
          <option value="FEDERAL">Federal</option>
          <option value="ESTADUAL">Estadual</option>
          <option value="MUNICIPAL">Municipal</option>
        </select>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="QUITADO">Quitado</option>
          <option value="RESCINDIDO">Rescindido</option>
        </select>
        <select
          name="empresaId"
          defaultValue={filters.empresaId ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">Todas as empresas</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Filtrar
        </button>
        {(filters.esfera || filters.status || filters.empresaId) && (
          <Link
            href="/parcelamentos"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:underline"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Esfera</th>
              <th className="px-4 py-3">Órgão</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Parcelas</th>
              <th className="px-4 py-3 text-right">Saldo devedor</th>
              <th className="px-4 py-3">Próx. vencimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parcelamentos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhum parcelamento encontrado.
                </td>
              </tr>
            )}
            {parcelamentos.map((p) => {
              const pendentes = p.parcelas.filter((parcela) => parcela.status === "PENDENTE");
              const saldo = pendentes.reduce((acc, parcela) => acc + parcela.valor, 0);
              const proxima = [...pendentes].sort(
                (a, b) => a.vencimento.getTime() - b.vencimento.getTime()
              )[0];

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/parcelamentos/${p.id}`} className="font-medium text-slate-900 hover:underline">
                      {p.empresa.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={buildHref({ esfera: p.esfera })}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                    >
                      {ESFERA_LABELS[p.esfera]}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.orgao}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        p.status === "ATIVO"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "QUITADO"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {STATUS_PARCELAMENTO_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.numeroParcelas - pendentes.length}/{p.numeroParcelas} pagas
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(saldo)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {proxima ? formatDate(proxima.vencimento) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
