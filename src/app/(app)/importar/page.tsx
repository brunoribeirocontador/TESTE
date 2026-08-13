import { ImportarForm } from "./importar-form";

export default function ImportarPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold text-slate-900">Importar parcelamentos existentes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastre em lote os parcelamentos que já existiam antes de usar esta ferramenta, a partir
        de uma planilha.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">1. Baixe o modelo</h2>
        <p className="mt-1 text-sm text-slate-500">
          Preencha uma linha para cada parcelamento. A aba &quot;Instruções&quot; explica cada
          coluna. Empresas serão criadas automaticamente se ainda não existirem (por CNPJ ou pelo
          nome).
        </p>
        <a
          href="/api/importar/modelo"
          className="mt-3 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Baixar modelo (.xlsx)
        </a>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">2. Envie o arquivo preenchido</h2>
        <p className="mt-1 text-sm text-slate-500">
          As parcelas de cada parcelamento são geradas automaticamente (uma por mês). Se você
          informar quantas parcelas já foram pagas, elas entram marcadas como pagas na data do
          próprio vencimento.
        </p>
        <div className="mt-4">
          <ImportarForm />
        </div>
      </div>
    </div>
  );
}
