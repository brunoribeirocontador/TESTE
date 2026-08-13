import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, ESFERA_LABELS, STATUS_PARCELAMENTO_LABELS } from "@/lib/format";
import { updateEmpresa } from "../actions";
import { EmpresaForm } from "../empresa-form";
import { DeleteEmpresaButton } from "../delete-empresa-button";

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empresa = await db.empresa.findUnique({
    where: { id },
    include: {
      parcelamentos: {
        orderBy: { createdAt: "desc" },
        include: { parcelas: true },
      },
    },
  });

  if (!empresa) {
    notFound();
  }

  const boundUpdate = updateEmpresa.bind(null, empresa.id);

  return (
    <div>
      <Link href="/empresas" className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Dados da empresa</h2>
            <div className="mt-4">
              <EmpresaForm
                action={boundUpdate}
                defaultValues={{
                  nome: empresa.nome,
                  cnpj: empresa.cnpj,
                  telefone: empresa.telefone,
                  email: empresa.email,
                }}
                submitLabel="Salvar alterações"
              />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <DeleteEmpresaButton id={empresa.id} nome={empresa.nome} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Parcelamentos</h2>
            <Link
              href={`/parcelamentos/novo?empresaId=${empresa.id}`}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Novo parcelamento
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {empresa.parcelamentos.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                Nenhum parcelamento cadastrado para esta empresa.
              </p>
            )}
            {empresa.parcelamentos.map((p) => {
              const pendentes = p.parcelas.filter((parcela) => parcela.status === "PENDENTE");
              const saldo = pendentes.reduce((acc, parcela) => acc + parcela.valor, 0);
              const proxima = pendentes.sort(
                (a, b) => a.vencimento.getTime() - b.vencimento.getTime()
              )[0];

              return (
                <Link
                  key={p.id}
                  href={`/parcelamentos/${p.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {ESFERA_LABELS[p.esfera]}
                      </span>
                      <span className="ml-2 font-medium text-slate-900">{p.orgao}</span>
                      {p.numero && <span className="ml-2 text-sm text-slate-500">nº {p.numero}</span>}
                    </div>
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
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                    <span>Saldo devedor: <strong className="text-slate-900">{formatCurrency(saldo)}</strong></span>
                    <span>
                      {pendentes.length}/{p.numeroParcelas} parcelas em aberto
                    </span>
                    {proxima && <span>Próx. vencimento: {formatDate(proxima.vencimento)}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
