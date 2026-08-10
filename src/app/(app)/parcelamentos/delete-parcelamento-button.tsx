"use client";

import { deleteParcelamento } from "./actions";

export function DeleteParcelamentoButton({ id }: { id: string }) {
  return (
    <form
      action={deleteParcelamento.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("Excluir este parcelamento e todas as suas parcelas?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Excluir parcelamento
      </button>
    </form>
  );
}
