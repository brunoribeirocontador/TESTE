export function parseDateOnlyUTC(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addMonthsUTC(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  if (d.getUTCDate() !== day) {
    d.setUTCDate(0);
  }
  return d;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function startOfMonthUTC(date: Date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function startOfNextMonthUTC(date: Date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export function parseMonthParam(value: string | undefined) {
  const hoje = startOfTodayUTC();
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [ano, mes] = value.split("-").map(Number);
    return new Date(Date.UTC(ano, mes - 1, 1));
  }
  return startOfMonthUTC(hoje);
}

export function toMonthParam(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatMonthLabel(date: Date) {
  return `${NOMES_MES[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}
