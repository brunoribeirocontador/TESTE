import { getConfiguracao } from "@/lib/config";
import { ConfigForm } from "./config-form";
import { ResetForm } from "./reset-form";

export default async function AdminPage() {
  const config = await getConfiguracao();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Administrador</h1>
        <p className="text-sm text-slate-500">
          Personalização do escritório e ações administrativas sensíveis.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Personalização</h2>
        <p className="mt-1 text-sm text-slate-500">
          Nome, telefone, cor e logo usados na identidade visual do sistema e dos comunicados.
        </p>
        <div className="mt-4">
          <ConfigForm
            defaultValues={{
              nome: config.nome,
              telefone: config.telefone,
              corEmail: config.corEmail,
              logo: config.logo,
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50/40 p-6">
        <h2 className="text-sm font-semibold text-red-800">Zona de perigo</h2>
        <div className="mt-4">
          <ResetForm />
        </div>
      </div>
    </div>
  );
}
