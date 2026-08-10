import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/dal";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session?.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Controle de Parcelamentos</h1>
        <p className="mt-1 text-sm text-slate-500">Acesso restrito ao escritório</p>
        <LoginForm />
      </div>
    </div>
  );
}
