import Link from "next/link";
import { createLead } from "../actions";
import { LeadForm } from "../lead-form";

export default function NovoLeadPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/crm" className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Novo lead</h1>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <LeadForm action={createLead} submitLabel="Criar lead" />
      </div>
    </div>
  );
}
