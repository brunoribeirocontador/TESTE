"use client";

import { deleteLead } from "./actions";

export function DeleteLeadButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={deleteLead.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Excluir o lead "${nome}"?`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Excluir lead
      </button>
    </form>
  );
}
