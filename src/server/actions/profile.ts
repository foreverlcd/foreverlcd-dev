"use server";
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/auth/require-admin";
import { failure, readForm, validationFailure, type ActionState } from "./action-state";
import { cloudinaryUrl, revalidatePortfolio } from "./common";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio.").max(120),
  headline: z.string().trim().min(1, "El titular es obligatorio.").max(160),
  shortBio: z.string().trim().max(280, "La biografía breve admite 280 caracteres."),
  biography: z.string().trim(),
  location: z.string().trim().max(120).nullable(),
  email: z.email("Introduce un correo válido.").nullable().or(z.literal("")),
});

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  const parsed = profileSchema.safeParse({
    ...raw,
    location: raw.location || null,
    email: raw.email || null,
  });
  if (!parsed.success) return validationFailure(parsed.error);
  await prisma.profile.upsert({
    where: { id: "main" },
    create: { id: "main", ...parsed.data },
    update: parsed.data,
  });
  revalidatePortfolio();
  return { ok: true, message: "Perfil guardado." };
}

export async function setProfilePublished(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const published = formData.get("published") === "true";
  const profile = await prisma.profile.findUnique({ where: { id: "main" } });
  if (!profile) return failure("Guarda el perfil antes de publicarlo.");
  // La base exige foto para publicar (Profile_published_requires_photo_check).
  if (published && (!profile.photoUrl || !profile.photoPublicId)) {
    return failure("Sube una foto de perfil antes de publicarlo.");
  }
  await prisma.profile.update({ where: { id: "main" }, data: { isPublished: published } });
  revalidatePortfolio();
  return { ok: true, message: published ? "Perfil publicado." : "Perfil despublicado." };
}

const photoSchema = z.object({
  photoUrl: cloudinaryUrl,
  photoPublicId: z.string().trim().min(1).max(255),
});

/** Registra la foto ya subida a Cloudinary (carpeta foreverlcd/profile) y borra la anterior. */
export async function setProfilePhoto(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = photoSchema.safeParse(readForm(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const current = await prisma.profile.findUnique({ where: { id: "main" }, select: { photoPublicId: true } });
  if (!current) return failure("Guarda el perfil antes de subir la foto.");
  await prisma.profile.update({ where: { id: "main" }, data: parsed.data });
  const previous = current.photoPublicId;
  if (previous && previous !== parsed.data.photoPublicId && previous.startsWith("foreverlcd/profile/")) {
    // Si falla, solo queda una imagen huérfana en Cloudinary: la foto nueva ya está guardada.
    const { destroyImage } = await import("@/server/cloudinary");
    await destroyImage(previous).catch(() => undefined);
  }
  revalidatePortfolio();
  return { ok: true, message: "Foto actualizada." };
}
