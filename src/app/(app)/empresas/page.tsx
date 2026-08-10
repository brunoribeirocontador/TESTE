import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export default async function EmpresasPage() {
  const empresas = await db.empresa.findMany({
    orderBy: { nome: "asc" },
    include: {
      parcelamentos: {
        include: { parcelas: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Empresas</h1>
          <p className="text-sm text-slate-500">Clientes do escritório com parcelamentos cadastrados.</p>
        </div>
        <Link
          href="/empresas/nova"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nova empresa
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">CNPJ</th>
              <th className="px-4 py-3">Parcelamentos ativos</th>
              <th className="px-4 py-3 text-right">Saldo devedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empresas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma empresa cadastrada ainda.
                </td>
              </tr>
            )}
            {empresas.map((empresa) => {
              const ativos = empresa.parcelamentos.filter((p) => p.status === "ATIVO");
              const saldoDevedor = empresa.parcelamentos.reduce((acc, p) => {
                return (
                  acc +
                  p.parcelas
                    .filter((parcela) => parcela.status === "PENDENTE")
                    .reduce((sum, parcela) => sum + parcela.valor, 0)
                );
              }, 0);

              return (
                <tr key={empresa.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/empresas/${empresa.id}`} className="font-medium text-slate-900 hover:underline">
                      {empresa.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{empresa.cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{ativos.length}</td>
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
