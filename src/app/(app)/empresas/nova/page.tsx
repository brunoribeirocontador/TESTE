import Link from "next/link";
import { createEmpresa } from "../actions";
import { EmpresaForm } from "../empresa-form";

export default function NovaEmpresaPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/empresas" className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Nova empresa</h1>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <EmpresaForm action={createEmpresa} submitLabel="Cadastrar empresa" />
      </div>
    </div>
  );
}
