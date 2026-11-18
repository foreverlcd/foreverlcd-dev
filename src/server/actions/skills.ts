"use server";
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/auth/require-admin";
import { failure, readForm, validationFailure, type ActionState } from "./action-state";
import { NIL_UUID, isChecked, parseIdList, revalidatePortfolio, slugify } from "./common";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(80),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(80),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  categoryId: z.uuid("Selecciona una categoría."),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

async function availableSlug(model: "skillCategory" | "skill", candidate: string, id?: string) {
  const base = slugify(candidate);
  let slug = base;
  let attempt = 2;
  while (true) {
    const where = { slug, ...(id ? { id: { not: id } } : {}) };
    const found =
      model === "skill"
        ? await prisma.skill.findFirst({ where, select: { id: true } })
        : await prisma.skillCategory.findFirst({ where, select: { id: true } });
    if (!found) return slug;
    slug = `${base}-${attempt++}`;
  }
}

export async function saveCategory(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  const parsed = categorySchema.safeParse({
    ...raw,
    displayOrder: raw.displayOrder || 0,
    isActive: isChecked(raw.isActive),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const value = parsed.data;
  const slug = await availableSlug("skillCategory", value.slug || value.name, value.id);
  const data = {
    name: value.name,
    slug,
    description: value.description || null,
    displayOrder: value.displayOrder,
    isActive: value.isActive,
  };
  if (value.id) await prisma.skillCategory.update({ where: { id: value.id }, data });
  else await prisma.skillCategory.create({ data });
  revalidatePortfolio();
  return { ok: true, message: "Categoría guardada." };
}

export async function deleteCategory(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { ok: false, message: "Categoría inválida.", fieldErrors: { id: ["Identificador inválido."] } };
  }
  if (await prisma.skill.count({ where: { categoryId: id.data } })) {
    return failure("No se puede borrar: primero mueve o elimina sus habilidades.");
  }
  await prisma.skillCategory.delete({ where: { id: id.data } });
  revalidatePortfolio();
  return { ok: true, message: "Categoría eliminada." };
}

export async function saveSkill(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  const parsed = skillSchema.safeParse({
    ...raw,
    displayOrder: raw.displayOrder || 0,
    isActive: isChecked(raw.isActive),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const value = parsed.data;
  const slug = await availableSlug("skill", value.slug || value.name, value.id);
  const data = {
    name: value.name,
    slug,
    description: value.description || null,
    icon: value.icon || null,
    categoryId: value.categoryId,
    displayOrder: value.displayOrder,
    isActive: value.isActive,
  };
  await prisma.skill.upsert({ where: { id: value.id || NIL_UUID }, create: data, update: data });
  revalidatePortfolio();
  return { ok: true, message: "Habilidad guardada." };
}

export async function deleteSkill(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return failure("Habilidad inválida.");
  await prisma.skill.delete({ where: { id: id.data } });
  revalidatePortfolio();
  return { ok: true, message: "Habilidad eliminada." };
}

export async function reorderSkills(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = parseIdList(formData.get("ids"));
  if (!ids) return failure("Lista de orden inválida.");
  await prisma.$transaction(
    ids.map((id, displayOrder) => prisma.skill.update({ where: { id }, data: { displayOrder } })),
  );
  revalidatePortfolio();
  return { ok: true, message: "Orden actualizado." };
}
