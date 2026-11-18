import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export function revalidatePortfolio(slug?: string) {
  revalidatePath("/");
  if (slug) revalidatePath(`/proyectos/${slug}`);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isChecked(value: unknown) {
  return value === "true" || value === "on";
}

/** Parses a JSON array of UUIDs coming from a hidden form field; null when invalid. */
export function parseIdList(value: FormDataEntryValue | null): string[] | null {
  let raw: unknown;
  try {
    raw = JSON.parse(String(value || "[]"));
  } catch {
    return null;
  }
  const parsed = z.array(z.uuid()).safeParse(raw);
  return parsed.success ? parsed.data : null;
}
