import { db } from "@/lib/db";

export default async function RelatoriosPage() {
  const empresas = await db.empresa.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-lg font-semibold text-slate-900">Relatórios</h1>
      <p className="text-sm text-slate-500">
        Exporte as parcelas cadastradas em CSV (compatível com Excel) aplicando os filtros desejados.
      </p>

      <form
        action="/api/relatorios/parcelas"
        method="get"
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="esfera" className="block text-sm font-medium text-slate-700">
              Esfera
            </label>
            <select
              id="esfera"
              name="esfera"
              defaultValue=""
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              <option value="FEDERAL">Federal</option>
              <option value="ESTADUAL">Estadual</option>
              <option value="MUNICIPAL">Municipal</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">
              Status da parcela
            </label>
            <select
              id="status"
              name="status"
              defaultValue=""
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGA">Paga</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="empresaId" className="block text-sm font-medium text-slate-700">
            Empresa
          </label>
          <select
            id="empresaId"
            name="empresaId"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todas as empresas</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="de" className="block text-sm font-medium text-slate-700">
              Vencimento de
            </label>
            <input
              id="de"
              name="de"
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ate" className="block text-sm font-medium text-slate-700">
              Vencimento até
            </label>
            <input
              id="ate"
              name="ate"
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Exportar CSV
        </button>
      </form>
    </div>
  );
}
