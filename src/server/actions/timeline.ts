"use server";
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/auth/require-admin";
import { failure, readForm, validationFailure, type ActionState } from "./action-state";
import { isChecked, parseIdList, revalidatePortfolio } from "./common";

const employmentTypes = [
  "INTERNSHIP",
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "VOLUNTEERING",
  "PERSONAL_PROJECT",
  "OTHER",
] as const;

const educationTypes = ["FORMAL", "CERTIFICATION", "COURSE", "SPECIALIZATION", "OTHER"] as const;

const orderedModels = ["experience", "education", "socialLink", "skillCategory", "skill"] as const;

const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().trim().min(1, "La empresa es obligatoria.").max(160),
  jobTitle: z.string().trim().min(1, "El cargo es obligatorio.").max(120),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  location: z.string().nullable(),
  employmentType: z.enum(employmentTypes),
  startDate: z.string().min(1, "La fecha inicial es obligatoria."),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  isActive: z.boolean(),
  displayOrder: z.coerce.number().int(),
});

const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().trim().min(1, "La institución es obligatoria.").max(160),
  degree: z.string().trim().min(1, "El grado es obligatorio.").max(160),
  fieldOfStudy: z.string().trim().min(1, "El área es obligatoria.").max(160),
  description: z.string().nullable(),
  location: z.string().nullable(),
  type: z.enum(educationTypes),
  credentialUrl: z.string().url("URL no válida.").nullable().or(z.literal("")),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  isActive: z.boolean(),
  displayOrder: z.coerce.number().int(),
});

export async function saveExperience(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  const parsed = experienceSchema.safeParse({
    ...raw,
    isCurrent: isChecked(raw.isCurrent),
    isActive: isChecked(raw.isActive),
    displayOrder: raw.displayOrder || 0,
    location: raw.location || null,
    endDate: raw.endDate || null,
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const value = parsed.data;
  const data = {
    company: value.company,
    jobTitle: value.jobTitle,
    description: value.description,
    location: value.location,
    employmentType: value.employmentType,
    startDate: new Date(value.startDate),
    endDate: value.endDate ? new Date(value.endDate) : null,
    isCurrent: value.isCurrent,
    isActive: value.isActive,
    displayOrder: value.displayOrder,
  };
  if (value.id) await prisma.experience.update({ where: { id: value.id }, data });
  else await prisma.experience.create({ data });
  revalidatePortfolio();
  return { ok: true, message: "Experiencia guardada." };
}

export async function deleteExperience(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return failure("Registro inválido.");
  await prisma.experience.delete({ where: { id: id.data } });
  revalidatePortfolio();
  return { ok: true, message: "Experiencia eliminada." };
}

export async function saveEducation(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  const parsed = educationSchema.safeParse({
    ...raw,
    isCurrent: isChecked(raw.isCurrent),
    isActive: isChecked(raw.isActive),
    displayOrder: raw.displayOrder || 0,
    description: raw.description || null,
    location: raw.location || null,
    credentialUrl: raw.credentialUrl || null,
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const value = parsed.data;
  const data = {
    institution: value.institution,
    degree: value.degree,
    fieldOfStudy: value.fieldOfStudy,
    description: value.description,
    location: value.location,
    type: value.type,
    credentialUrl: value.credentialUrl || null,
    startDate: value.startDate ? new Date(value.startDate) : null,
    endDate: value.endDate ? new Date(value.endDate) : null,
    isCurrent: value.isCurrent,
    isActive: value.isActive,
    displayOrder: value.displayOrder,
  };
  if (value.id) await prisma.education.update({ where: { id: value.id }, data });
  else await prisma.education.create({ data });
  revalidatePortfolio();
  return { ok: true, message: "Formación guardada." };
}

export async function deleteEducation(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return failure("Registro inválido.");
  await prisma.education.delete({ where: { id: id.data } });
  revalidatePortfolio();
  return { ok: true, message: "Formación eliminada." };
}

export async function reorderTimeline(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = parseIdList(formData.get("ids"));
  const model = z.enum(orderedModels).safeParse(formData.get("model"));
  if (!ids || !model.success) return failure("Lista inválida.");
  const updates = ids.map((id, displayOrder) => ({ where: { id }, data: { displayOrder } }));
  switch (model.data) {
    case "experience":
      await prisma.$transaction(updates.map((update) => prisma.experience.update(update)));
      break;
    case "education":
      await prisma.$transaction(updates.map((update) => prisma.education.update(update)));
      break;
    case "socialLink":
      await prisma.$transaction(updates.map((update) => prisma.socialLink.update(update)));
      break;
    case "skillCategory":
      await prisma.$transaction(updates.map((update) => prisma.skillCategory.update(update)));
      break;
    case "skill":
      await prisma.$transaction(updates.map((update) => prisma.skill.update(update)));
      break;
  }
  revalidatePortfolio();
  return { ok: true, message: "Orden actualizado." };
}

/** Activates or deactivates an item of any list that has an `isActive` flag. */
export async function setItemActive(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({ model: z.enum(orderedModels), id: z.uuid() })
    .safeParse({ model: formData.get("model"), id: formData.get("id") });
  if (!parsed.success) return failure("Registro inválido.");
  const { model, id } = parsed.data;
  const data = { isActive: formData.get("active") === "true" };
  const where = { id };
  switch (model) {
    case "experience":
      await prisma.experience.update({ where, data });
      break;
    case "education":
      await prisma.education.update({ where, data });
      break;
    case "socialLink":
      await prisma.socialLink.update({ where, data });
      break;
    case "skillCategory":
      await prisma.skillCategory.update({ where, data });
      break;
    case "skill":
      await prisma.skill.update({ where, data });
      break;
  }
  revalidatePortfolio();
  return { ok: true, message: data.isActive ? "Elemento activado." : "Elemento desactivado." };
}
