const monthYear = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric", timeZone: "UTC" });

export function formatMonthYear(date: Date | null | undefined) {
  return date ? monthYear.format(new Date(date)) : null;
}

/** "marzo de 2024 — actual" (sin fin = en curso). Null si no hay fecha de inicio ni de fin. */
export function formatMonthRange(start: Date | null | undefined, end: Date | null | undefined) {
  const from = formatMonthYear(start);
  const to = formatMonthYear(end);
  if (!from && !to) return null;
  if (!from) return to;
  if (!to) return `${from} — actual`;
  return from === to ? from : `${from} — ${to}`;
}
