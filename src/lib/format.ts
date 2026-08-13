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

export const ESTAGIO_FUNIL_LABELS: Record<string, string> = {
  NOVO_LEAD: "Novo Lead",
  CONTATO_REALIZADO: "Contato Realizado",
  PROPOSTA_ENVIADA: "Proposta Enviada",
  CONTRATO_ENVIADO: "Contrato Enviado",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

export const ORIGEM_CLIENTE_LABELS: Record<string, string> = {
  ABERTURA_CNPJ: "Abertura de CNPJ",
  MIGRACAO_CONTABILIDADE: "Migração de contabilidade",
};

export const STATUS_TAREFA_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};
