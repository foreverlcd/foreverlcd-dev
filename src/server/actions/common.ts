import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

/**
 * URL de imagen que next/image puede servir: solo https://res.cloudinary.com (next.config.ts remotePatterns).
 * Otro host haría fallar el render de la página pública (500 en build o regeneración).
 */
export const cloudinaryUrl = z.url("Introduce una URL válida.").refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
}, "La imagen debe estar en Cloudinary (https://res.cloudinary.com/...). Súbela con el botón de subida.");

export const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export function revalidatePortfolio(slug?: string) {
  revalidatePath("/");
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/[slug]", "page");
  revalidatePath("/stack/[slug]", "page");
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

export const PROFILE_REQUIRED = "Primero guarda tu perfil en Perfil: redes, experiencia y formación cuelgan de él.";

/** Redes, experiencia y formación tienen FK al perfil único "main"; sin él, el insert falla. */
export async function profileExists() {
  const profile = await prisma.profile.findUnique({ where: { id: "main" }, select: { id: true } });
  return profile !== null;
}
