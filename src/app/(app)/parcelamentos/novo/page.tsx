import Link from "next/link";
import { db } from "@/lib/db";
import { ParcelamentoForm } from "../parcelamento-form";

export default async function NovoParcelamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ empresaId?: string }>;
}) {
  const { empresaId } = await searchParams;
  const empresas = await db.empresa.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/parcelamentos" className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Novo parcelamento</h1>

      {empresas.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Cadastre uma empresa antes de criar um parcelamento.{" "}
          <Link href="/empresas/nova" className="text-slate-900 underline">
            Cadastrar empresa
          </Link>
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
          <ParcelamentoForm empresas={empresas} defaultEmpresaId={empresaId} />
        </div>
      )}
    </div>
  );
}
