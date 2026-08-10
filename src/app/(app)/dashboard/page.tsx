import Link from "next/link";
import { db } from "@/lib/db";
import { ESFERA_LABELS, formatCurrency, formatDate } from "@/lib/format";
import { startOfTodayUTC } from "@/lib/dates";

const DIAS_ALERTA = 15;

export default async function DashboardPage() {
  const hoje = startOfTodayUTC();
  const limiteAlerta = new Date(hoje);
  limiteAlerta.setUTCDate(limiteAlerta.getUTCDate() + DIAS_ALERTA);

  const parcelasPendentes = await db.parcela.findMany({
    where: { status: "PENDENTE" },
    include: { parcelamento: { include: { empresa: true } } },
    orderBy: { vencimento: "asc" },
  });

  const atrasadas = parcelasPendentes.filter((p) => p.vencimento < hoje);
  const vencendoEmBreve = parcelasPendentes.filter(
    (p) => p.vencimento >= hoje && p.vencimento <= limiteAlerta
  );

  const saldoTotal = parcelasPendentes.reduce((acc, p) => acc + p.valor, 0);
  const saldoAtrasado = atrasadas.reduce((acc, p) => acc + p.valor, 0);

  const porEsfera = { FEDERAL: 0, ESTADUAL: 0, MUNICIPAL: 0 } as Record<string, number>;
  for (const p of parcelasPendentes) {
    porEsfera[p.parcelamento.esfera] += p.valor;
  }

  const porEmpresaMap = new Map<string, { nome: string; saldo: number; qtd: number }>();
  for (const p of parcelasPendentes) {
    const key = p.parcelamento.empresaId;
    const atual = porEmpresaMap.get(key) ?? { nome: p.parcelamento.empresa.nome, saldo: 0, qtd: 0 };
    atual.saldo += p.valor;
    atual.qtd += 1;
    porEmpresaMap.set(key, atual);
  }
  const porEmpresa = [...porEmpresaMap.entries()]
    .map(([empresaId, v]) => ({ empresaId, ...v }))
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 8);

  const [totalEmpresas, totalParcelamentosAtivos] = await Promise.all([
    db.empresa.count(),
    db.parcelamento.count({ where: { status: "ATIVO" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Painel</h1>
        <p className="text-sm text-slate-500">Visão geral dos parcelamentos do escritório.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Empresas cadastradas" value={String(totalEmpresas)} />
        <Card label="Parcelamentos ativos" value={String(totalParcelamentosAtivos)} />
        <Card label="Saldo devedor total" value={formatCurrency(saldoTotal)} />
        <Card
          label="Parcelas em atraso"
          value={String(atrasadas.length)}
          highlight={atrasadas.length > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["FEDERAL", "ESTADUAL", "MUNICIPAL"] as const).map((esfera) => (
          <Card key={esfera} label={`Saldo devedor — ${ESFERA_LABELS[esfera]}`} value={formatCurrency(porEsfera[esfera])} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            Parcelas em atraso
            {atrasadas.length > 0 && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                {formatCurrency(saldoAtrasado)}
              </span>
            )}
          </h2>
          <AlertList
            parcelas={atrasadas}
            empty="Nenhuma parcela em atraso."
            variant="atraso"
          />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900">
            Vencendo nos próximos {DIAS_ALERTA} dias
          </h2>
          <AlertList
            parcelas={vencendoEmBreve}
            empty="Nenhuma parcela vencendo em breve."
            variant="alerta"
          />
        </section>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-900">Saldo devedor por empresa</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Empresa</th>
                <th className="px-4 py-2">Parcelas em aberto</th>
                <th className="px-4 py-2 text-right">Saldo devedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porEmpresa.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    Nenhum saldo em aberto.
                  </td>
                </tr>
              )}
              {porEmpresa.map((e) => (
                <tr key={e.empresaId} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link href={`/empresas/${e.empresaId}`} className="font-medium text-slate-900 hover:underline">
                      {e.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{e.qtd}</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(e.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${highlight ? "text-red-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

type ParcelaAlerta = {
  id: string;
  valor: number;
  vencimento: Date;
  parcelamento: { orgao: string; empresa: { nome: string; id: string } };
};

function AlertList({
  parcelas,
  empty,
  variant,
}: {
  parcelas: ParcelaAlerta[];
  empty: string;
  variant: "atraso" | "alerta";
}) {
  if (parcelas.length === 0) {
    return (
      <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {parcelas.slice(0, 10).map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <div>
            <Link
              href={`/empresas/${p.parcelamento.empresa.id}`}
              className="font-medium text-slate-900 hover:underline"
            >
              {p.parcelamento.empresa.nome}
            </Link>
            <span className="text-slate-500"> — {p.parcelamento.orgao}</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span className={variant === "atraso" ? "text-red-600" : "text-amber-600"}>
              {formatDate(p.vencimento)}
            </span>
            <span className="font-medium text-slate-900">{formatCurrency(p.valor)}</span>
          </div>
        </li>
      ))}
      {parcelas.length > 10 && (
        <li className="px-4 py-2 text-xs text-slate-400">+ {parcelas.length - 10} outras</li>
      )}
    </ul>
  );
}
