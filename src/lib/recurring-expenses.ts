const PERIOD_STEPS: Record<string, (date: Date) => void> = {
  diaria: (date) => date.setDate(date.getDate() + 1),
  semanal: (date) => date.setDate(date.getDate() + 7),
  quinzenal: (date) => date.setDate(date.getDate() + 14),
  mensal: (date) => date.setMonth(date.getMonth() + 1),
  trimestral: (date) => date.setMonth(date.getMonth() + 3),
  semestral: (date) => date.setMonth(date.getMonth() + 6),
  anual: (date) => date.setFullYear(date.getFullYear() + 1),
};

export function dateOnly(value: string) {
  return value.slice(0, 10);
}

function parseDate(value: string) {
  const [year, month, day] = dateOnly(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function countExpenseOccurrences(
  expenseDate: string,
  isRecurring: boolean,
  recurrencePeriod: string | null,
  rangeStart?: string,
  rangeEnd?: string,
) {
  const anchor = dateOnly(expenseDate);
  const start = rangeStart ? dateOnly(rangeStart) : "0001-01-01";
  const end = rangeEnd ? dateOnly(rangeEnd) : "9999-12-31";
  const step = recurrencePeriod ? PERIOD_STEPS[recurrencePeriod] : undefined;

  if (!isRecurring || !step) {
    return anchor >= start && anchor <= end ? 1 : 0;
  }

  const cursor = parseDate(anchor);
  let count = 0;
  for (let guard = 0; guard < 4000; guard += 1) {
    const current = formatDate(cursor);
    if (current > end) break;
    if (current >= start) count += 1;
    const previous = current;
    step(cursor);
    if (formatDate(cursor) <= previous) break;
  }
  return count;
}
