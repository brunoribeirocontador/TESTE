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
