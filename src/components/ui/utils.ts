export type ClassValue = string | false | null | undefined;

/**
 * Une clases condicionales sin introducir dependencias.
 * No resuelve conflictos de Tailwind; los componentes fijan sus clases base
 * y solo permiten overrides deliberados.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
