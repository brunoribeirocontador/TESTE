"use client";

import { deleteEmpresa } from "./actions";

export function DeleteEmpresaButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={deleteEmpresa.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Excluir a empresa "${nome}"? Todos os parcelamentos e parcelas dela também serão excluídos.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Excluir empresa
      </button>
    </form>
  );
}
