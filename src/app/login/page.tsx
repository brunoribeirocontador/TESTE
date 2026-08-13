import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/dal";
import { getConfiguracao } from "@/lib/config";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session?.userId) {
    redirect("/dashboard");
  }

  const config = await getConfiguracao();

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {config.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logo} alt="" className="mb-3 h-10 w-auto" />
        )}
        <h1 className="text-xl font-semibold text-slate-900">{config.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">Acesso restrito ao escritório</p>
        <LoginForm />
      </div>
    </div>
  );
}
