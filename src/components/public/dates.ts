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

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];

/**
 * Fechas compactas de la ficha: "ene — dic 2026" (mismo año), "ene 2026" (mismo mes), "ene 2024 — dic 2026".
 * Sin fin = en curso. Null si no hay inicio ni fin.
 */
export function formatMonthRangeShort(start: Date | null | undefined, end: Date | null | undefined) {
  const a = start ? new Date(start) : null;
  const b = end ? new Date(end) : null;
  if (!a && !b) return null;
  const label = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if (!a || !b) return a ? `${label(a)} — actual` : label(b as Date);
  if (a.getUTCFullYear() === b.getUTCFullYear()) {
    return a.getUTCMonth() === b.getUTCMonth()
      ? label(a)
      : `${MONTHS[a.getUTCMonth()]} — ${label(b)}`;
  }
  return `${label(a)} — ${label(b)}`;
}
