"use client";

import { marcarParcelaPaga, desmarcarParcelaPaga } from "./actions";

export function PagarParcelaForm({
  parcelaId,
  valorSugerido,
  dataSugerida,
}: {
  parcelaId: string;
  valorSugerido: number;
  dataSugerida: string;
}) {
  return (
    <form action={marcarParcelaPaga.bind(null, parcelaId)} className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        name="dataPagamento"
        defaultValue={dataSugerida}
        required
        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      <input
        type="number"
        name="valorPago"
        step="0.01"
        min="0.01"
        defaultValue={valorSugerido.toFixed(2)}
        required
        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
      >
        Registrar pagamento
      </button>
    </form>
  );
}

export function DesfazerPagamentoButton({ parcelaId }: { parcelaId: string }) {
  return (
    <form action={desmarcarParcelaPaga.bind(null, parcelaId)}>
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
      >
        Desfazer
      </button>
    </form>
  );
}
