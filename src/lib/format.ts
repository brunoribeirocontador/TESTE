export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(d);
}

export const ESFERA_LABELS: Record<string, string> = {
  FEDERAL: "Federal",
  ESTADUAL: "Estadual",
  MUNICIPAL: "Municipal",
};

export const STATUS_PARCELAMENTO_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  QUITADO: "Quitado",
  RESCINDIDO: "Rescindido",
};

export const STATUS_PARCELA_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
};
