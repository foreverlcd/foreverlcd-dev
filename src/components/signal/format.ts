const yearOf = (date: Date | null | undefined) => (date ? new Date(date).getUTCFullYear() : null);

export function formatRange(start: Date | null | undefined, end: Date | null | undefined, current = false) {
  const from = yearOf(start);
  const to = current ? "actual" : yearOf(end);
  if (!from && !to) return null;
  if (!from) return String(to);
  if (!to || String(to) === String(from)) return current ? `${from} — actual` : String(from);
  return `${from} — ${to}`;
}

export const EMPLOYMENT_LABEL: Record<string, string> = {
  INTERNSHIP: "Prácticas",
  FULL_TIME: "Jornada completa",
  PART_TIME: "Media jornada",
  FREELANCE: "Freelance",
  VOLUNTEERING: "Voluntariado",
  PERSONAL_PROJECT: "Proyecto personal",
  OTHER: "Otro",
};

export const EDUCATION_LABEL: Record<string, string> = {
  FORMAL: "Formación reglada",
  CERTIFICATION: "Certificación",
  COURSE: "Curso",
  SPECIALIZATION: "Especialización",
  OTHER: "Otro",
};

export const PLATFORM_LABEL: Record<string, string> = {
  GITHUB: "GitHub",
  LINKEDIN: "LinkedIn",
  EMAIL: "Correo",
  WEBSITE: "Web",
  X: "X",
  YOUTUBE: "YouTube",
  INSTAGRAM: "Instagram",
  DISCORD: "Discord",
  CUSTOM: "Otro",
  OTHER: "Otro",
};

export const pad = (n: number) => String(n).padStart(2, "0");

export function formatStamp(iso: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso)) + " UTC";
}

/** Iniciales: primera palabra y la de índice ceil(n/2) (3 y 4 palabras: la 1.ª y la 3.ª). */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const second = words[Math.min(Math.ceil(words.length / 2), words.length - 1)];
  return words.length === 1
    ? words[0][0].toUpperCase()
    : `${words[0][0]}.${second[0]}`.toUpperCase();
}
