import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { startOfTodayUTC } from "@/lib/dates";

const ATRASOS_ALERTA_EMPRESA = 3;

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ atraso?: string }>;
}) {
  const { atraso } = await searchParams;
  const hoje = startOfTodayUTC();

  const empresas = await db.empresa.findMany({
    orderBy: { nome: "asc" },
    include: {
      parcelamentos: {
        include: { parcelas: true },
      },
    },
  });

  const comCalculo = empresas.map((empresa) => {
    const ativos = empresa.parcelamentos.filter((p) => p.status === "ATIVO");
    const parcelasPendentes = empresa.parcelamentos.flatMap((p) =>
      p.parcelas.filter((parcela) => parcela.status === "PENDENTE")
    );
    const saldoDevedor = parcelasPendentes.reduce((sum, parcela) => sum + parcela.valor, 0);
    const atrasadas = parcelasPendentes.filter((parcela) => parcela.vencimento < hoje).length;
    return { empresa, ativos: ativos.length, saldoDevedor, atrasadas };
  });

  const filtradas =
    atraso === "critico"
      ? comCalculo.filter((e) => e.atrasadas > ATRASOS_ALERTA_EMPRESA)
      : atraso === "1"
        ? comCalculo.filter((e) => e.atrasadas > 0)
        : comCalculo;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {atraso === "critico"
              ? "Empresas com mais de 3 parcelas atrasadas"
              : atraso === "1"
                ? "Empresas com parcelamento em atraso"
                : "Empresas"}
          </h1>
          <p className="text-sm text-slate-500">
            {atraso
              ? "Filtrado a partir do painel."
              : "Clientes do escritório com parcelamentos cadastrados."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {atraso && (
            <Link
              href="/empresas"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Limpar filtro
            </Link>
          )}
          <Link
            href="/empresas/nova"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nova empresa
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">CNPJ</th>
              <th className="px-4 py-3">Parcelamentos ativos</th>
              <th className="px-4 py-3">Atrasadas</th>
              <th className="px-4 py-3 text-right">Saldo devedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  {atraso ? "Nenhuma empresa nessa situação." : "Nenhuma empresa cadastrada ainda."}
                </td>
              </tr>
            )}
            {filtradas.map(({ empresa, ativos, saldoDevedor, atrasadas }) => {
              const critico = atrasadas > ATRASOS_ALERTA_EMPRESA;
              return (
                <tr key={empresa.id} className={critico ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50"}>
                  <td className="px-4 py-3">
                    <Link href={`/empresas/${empresa.id}`} className="font-medium text-slate-900 hover:underline">
                      {empresa.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{empresa.cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{ativos}</td>
                  <td className="px-4 py-3">
                    {atrasadas > 0 ? (
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          critico ? "bg-red-600 text-white" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {atrasadas} {critico ? "⚠" : ""}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(saldoDevedor)}
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
