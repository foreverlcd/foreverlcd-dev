"use server";
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/auth/require-admin";
import { failure, readForm, validationFailure, type ActionState } from "./action-state";
import { NIL_UUID, isChecked, parseIdList, revalidatePortfolio } from "./common";

const platforms = [
  "GITHUB",
  "LINKEDIN",
  "EMAIL",
  "WEBSITE",
  "X",
  "YOUTUBE",
  "INSTAGRAM",
  "DISCORD",
  "CUSTOM",
  "OTHER",
] as const;

const schema = z.object({
  id: z.string().optional(),
  platform: z.enum(platforms),
  label: z.string().trim().min(1, "La etiqueta es obligatoria.").max(80),
  url: z.url("Introduce una URL válida.").max(2048),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function saveSocialLink(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  const parsed = schema.safeParse({
    ...raw,
    displayOrder: raw.displayOrder || 0,
    isActive: isChecked(raw.isActive),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const { id, ...data } = parsed.data;
  await prisma.socialLink.upsert({
    where: { id: id || NIL_UUID },
    create: data,
    update: data,
  });
  revalidatePortfolio();
  return { ok: true, message: "Enlace guardado." };
}

export async function deleteSocialLink(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) return failure("Enlace inválido.");
  await prisma.socialLink.delete({ where: { id: parsed.data } });
  revalidatePortfolio();
  return { ok: true, message: "Enlace eliminado." };
}

export async function reorderSocialLinks(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = parseIdList(formData.get("ids"));
  if (!ids) return failure("Lista de orden inválida.");
  await prisma.$transaction(
    ids.map((id, displayOrder) => prisma.socialLink.update({ where: { id }, data: { displayOrder } })),
  );
  revalidatePortfolio();
  return { ok: true, message: "Orden actualizado." };
}
