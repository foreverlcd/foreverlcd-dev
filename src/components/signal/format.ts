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
