import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, ORIGEM_CLIENTE_LABELS, STATUS_TAREFA_LABELS } from "@/lib/format";
import { startOfTodayUTC } from "@/lib/dates";
import { TarefaStatusSelect } from "./tarefa-status-select";
import { DeleteTarefaButton } from "./delete-tarefa-button";

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; empresaId?: string }>;
}) {
  const filters = await searchParams;
  const hoje = startOfTodayUTC();

  const where = {
    ...(filters.status === "CONCLUIDA"
      ? { status: "CONCLUIDA" as const }
      : filters.status === "TODAS"
        ? {}
        : { status: { not: "CONCLUIDA" as const } }),
    ...(filters.empresaId ? { empresaId: filters.empresaId } : {}),
  };

  const [tarefas, empresas] = await Promise.all([
    db.tarefaOnboarding.findMany({
      where,
      include: { empresa: true },
      orderBy: [{ prazo: "asc" }, { createdAt: "asc" }],
    }),
    db.empresa.findMany({ where: { origem: { not: null } }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Gestor de tarefas</h1>
        <p className="text-sm text-slate-500">
          Checklist de implantação dos clientes: contrato, cadastro no Asaas, Domínio, Sieg e demais
          passos até o cliente estar 100% no escritório.
        </p>
      </div>

      <form className="mt-4 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">Em aberto</option>
          <option value="CONCLUIDA">Concluídas</option>
          <option value="TODAS">Todas</option>
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
        {(filters.status || filters.empresaId) && (
          <Link href="/tarefas" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:underline">
            Limpar filtros
          </Link>
        )}
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Tarefa</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tarefas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            )}
            {tarefas.map((t) => {
              const atrasada = t.status !== "CONCLUIDA" && t.prazo != null && t.prazo < hoje;
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/empresas/${t.empresaId}`} className="font-medium text-slate-900 hover:underline">
                      {t.empresa.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{t.titulo}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {t.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {t.empresa.origem ? ORIGEM_CLIENTE_LABELS[t.empresa.origem] : "—"}
                  </td>
                  <td className={`px-4 py-3 ${atrasada ? "font-medium text-red-600" : "text-slate-700"}`}>
                    {t.prazo ? formatDate(t.prazo) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <TarefaStatusSelect tarefaId={t.id} status={t.status} />
                    <span className="sr-only">{STATUS_TAREFA_LABELS[t.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteTarefaButton id={t.id} />
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
