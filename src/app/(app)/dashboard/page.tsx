import Link from "next/link";
import { db } from "@/lib/db";
import { ESFERA_LABELS, formatCurrency, formatDate } from "@/lib/format";
import {
  startOfTodayUTC,
  startOfMonthUTC,
  startOfNextMonthUTC,
  addMonthsUTC,
  parseMonthParam,
  toMonthParam,
  formatMonthLabel,
} from "@/lib/dates";

const DIAS_ALERTA = 15;
const ATRASOS_ALERTA_EMPRESA = 3;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
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

  const porEmpresaMap = new Map<
    string,
    { nome: string; saldo: number; qtd: number; atrasadas: number }
  >();
  for (const p of parcelasPendentes) {
    const key = p.parcelamento.empresaId;
    const atual =
      porEmpresaMap.get(key) ?? { nome: p.parcelamento.empresa.nome, saldo: 0, qtd: 0, atrasadas: 0 };
    atual.saldo += p.valor;
    atual.qtd += 1;
    if (p.vencimento < hoje) atual.atrasadas += 1;
    porEmpresaMap.set(key, atual);
  }
  const todasEmpresasComSaldo = [...porEmpresaMap.entries()].map(([empresaId, v]) => ({
    empresaId,
    ...v,
  }));
  const porEmpresa = [...todasEmpresasComSaldo].sort((a, b) => b.saldo - a.saldo).slice(0, 8);
  const empresasComAtraso = todasEmpresasComSaldo.filter((e) => e.atrasadas > 0);
  const empresasAtrasoCritico = empresasComAtraso.filter((e) => e.atrasadas > ATRASOS_ALERTA_EMPRESA);

  const inicioMes = startOfMonthUTC(hoje);
  const fimMes = startOfNextMonthUTC(hoje);

  const [totalEmpresas, totalParcelamentosAtivos, parcelamentosComReducao, naoEnviadasNoMes] =
    await Promise.all([
      db.empresa.count(),
      db.parcelamento.count({ where: { status: "ATIVO" } }),
      db.parcelamento.findMany({
        where: { valorOriginal: { not: null } },
        select: { valorOriginal: true, valorTotal: true },
      }),
      db.parcela.count({
        where: { vencimento: { gte: inicioMes, lt: fimMes }, notificado: false },
      }),
    ]);

  const economiaTotal = parcelamentosComReducao.reduce((acc, p) => {
    const economia = (p.valorOriginal ?? 0) - p.valorTotal;
    return economia > 0 ? acc + economia : acc;
  }, 0);

  const mesCalendario = parseMonthParam(mes);
  const inicioCalendario = mesCalendario;
  const fimCalendario = startOfNextMonthUTC(mesCalendario);
  const parcelasDoCalendario = await db.parcela.findMany({
    where: { vencimento: { gte: inicioCalendario, lt: fimCalendario } },
    select: { vencimento: true, status: true },
  });

  const porDia = new Map<number, { total: number; pendentes: number; atrasadas: number }>();
  for (const p of parcelasDoCalendario) {
    const dia = p.vencimento.getUTCDate();
    const atual = porDia.get(dia) ?? { total: 0, pendentes: 0, atrasadas: 0 };
    atual.total += 1;
    if (p.status === "PENDENTE") {
      atual.pendentes += 1;
      if (p.vencimento < hoje) atual.atrasadas += 1;
    }
    porDia.set(dia, atual);
  }

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          label="Empresas com atraso"
          value={String(empresasComAtraso.length)}
          highlight={empresasComAtraso.length > 0}
          href={empresasComAtraso.length > 0 ? "/empresas?atraso=1" : undefined}
        />
        <Card
          label={`Empresas com mais de ${ATRASOS_ALERTA_EMPRESA} parcelas atrasadas`}
          value={String(empresasAtrasoCritico.length)}
          highlight={empresasAtrasoCritico.length > 0}
          href={empresasAtrasoCritico.length > 0 ? "/empresas?atraso=critico" : undefined}
        />
        <Card
          label="Economia em parcelamentos com redução"
          value={formatCurrency(economiaTotal)}
          tone="success"
        />
        <Card
          label="Parcelas do mês sem envio ao cliente"
          value={String(naoEnviadasNoMes)}
          tone={naoEnviadasNoMes > 0 ? "warning" : undefined}
          href="/mensal"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["FEDERAL", "ESTADUAL", "MUNICIPAL"] as const).map((esfera) => (
          <Card key={esfera} label={`Saldo devedor — ${ESFERA_LABELS[esfera]}`} value={formatCurrency(porEsfera[esfera])} />
        ))}
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Calendário de vencimentos</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard?mes=${toMonthParam(addMonthsUTC(mesCalendario, -1))}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              ← Anterior
            </Link>
            <span className="text-sm font-medium text-slate-700">{formatMonthLabel(mesCalendario)}</span>
            <Link
              href={`/dashboard?mes=${toMonthParam(addMonthsUTC(mesCalendario, 1))}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Próximo →
            </Link>
          </div>
        </div>
        <CalendarioMes mes={mesCalendario} hoje={hoje} porDia={porDia} />
      </section>

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
                <th className="px-4 py-2">Atrasadas</th>
                <th className="px-4 py-2 text-right">Saldo devedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porEmpresa.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Nenhum saldo em aberto.
                  </td>
                </tr>
              )}
              {porEmpresa.map((e) => {
                const critico = e.atrasadas > ATRASOS_ALERTA_EMPRESA;
                return (
                  <tr key={e.empresaId} className={critico ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50"}>
                    <td className="px-4 py-2">
                      <Link href={`/empresas/${e.empresaId}`} className="font-medium text-slate-900 hover:underline">
                        {e.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-700">{e.qtd}</td>
                    <td className="px-4 py-2">
                      {e.atrasadas > 0 ? (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            critico ? "bg-red-600 text-white" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {e.atrasadas} {critico ? "⚠" : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">{formatCurrency(e.saldo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({
  label,
  value,
  highlight,
  tone,
  href,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "success" | "warning";
  href?: string;
}) {
  const border = highlight
    ? "border-red-200 bg-red-50"
    : tone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50"
        : "border-slate-200 bg-white";
  const text = highlight
    ? "text-red-700"
    : tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-slate-900";

  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${text}`}>{value}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block rounded-lg border p-4 transition-shadow hover:shadow-md ${border}`}
      >
        {content}
      </Link>
    );
  }

  return <div className={`rounded-lg border p-4 ${border}`}>{content}</div>;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function CalendarioMes({
  mes,
  hoje,
  porDia,
}: {
  mes: Date;
  hoje: Date;
  porDia: Map<number, { total: number; pendentes: number; atrasadas: number }>;
}) {
  const ano = mes.getUTCFullYear();
  const mesIndex = mes.getUTCMonth();
  const diasNoMes = new Date(Date.UTC(ano, mesIndex + 1, 0)).getUTCDate();
  const primeiroDiaSemana = new Date(Date.UTC(ano, mesIndex, 1)).getUTCDay();
  const ehMesAtual = ano === hoje.getUTCFullYear() && mesIndex === hoje.getUTCMonth();

  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`vazio-${i}`} />;

          const info = porDia.get(dia);
          const ehHoje = ehMesAtual && dia === hoje.getUTCDate();
          const temAtraso = (info?.atrasadas ?? 0) > 0;
          const temPendente = (info?.pendentes ?? 0) > 0;

          const bg = temAtraso
            ? "bg-red-100 text-red-800 border-red-200"
            : temPendente
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : info
                ? "bg-slate-50 text-slate-600 border-slate-200"
                : "border-transparent text-slate-500";

          return (
            <div
              key={dia}
              title={
                info
                  ? `${info.total} parcela(s) vencendo — ${info.pendentes} pendente(s)${temAtraso ? `, ${info.atrasadas} atrasada(s)` : ""}`
                  : undefined
              }
              className={`relative flex h-14 flex-col items-center justify-center rounded-md border text-sm ${bg} ${
                ehHoje ? "ring-2 ring-slate-900" : ""
              }`}
            >
              <span className="font-medium">{dia}</span>
              {info && (
                <span className="mt-0.5 text-[10px] font-semibold leading-none">
                  {info.total} parc.
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-red-200 bg-red-100" /> Com
          parcela atrasada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-amber-200 bg-amber-50" />{" "}
          Vencimento pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-slate-200 bg-slate-50" /> Só
          parcelas já pagas
        </span>
      </div>
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
