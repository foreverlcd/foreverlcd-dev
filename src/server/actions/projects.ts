"use server";
import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/auth/require-admin";
import { failure, readForm, validationFailure, type ActionState } from "./action-state";
import { NIL_UUID, isChecked, parseIdList, revalidatePortfolio, slugify } from "./common";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "El título es obligatorio.").max(120),
  slug: z.string().optional(),
  shortDescription: z.string().trim().min(1, "La descripción breve es obligatoria.").max(280),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  demoUrl: z.string().url("URL no válida.").max(2048).nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  isFeatured: z.boolean(),
  displayOrder: z.coerce.number().int(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  skillIds: z.array(z.uuid()),
  repositories: z.array(
    z.object({
      type: z.enum(["BACKEND", "FRONTEND", "OTHER"]),
      url: z.url("URL de repositorio no válida."),
    }),
  ),
});

const imageSchema = z.object({
  projectId: z.uuid(),
  type: z.enum(["COVER", "GALLERY"]),
  publicId: z.string().min(1).max(255),
  secureUrl: z.url(),
  width: z.coerce.number().int().positive(),
  height: z.coerce.number().int().positive(),
  format: z.string().min(1).max(20),
  alt: z.string().trim().min(1, "El texto alternativo es obligatorio.").max(250),
  displayOrder: z.coerce.number().int().default(0),
});

const altSchema = z.object({
  id: z.uuid(),
  alt: z.string().trim().min(1, "El texto alternativo es obligatorio.").max(250),
});

async function uniqueProjectSlug(name: string, explicit: string | undefined, id?: string) {
  const base = slugify(explicit || name);
  let slug = base;
  let attempt = 2;
  while (true) {
    const where = { slug, ...(id ? { id: { not: id } } : {}) };
    const found = await prisma.project.findFirst({ where, select: { id: true } });
    if (!found) return slug;
    slug = `${base}-${attempt++}`;
  }
}

function parseJsonField(value: FormDataEntryValue | undefined): unknown {
  return JSON.parse(String(value || "[]"));
}

export async function saveProject(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = readForm(formData);
  let skillIds: unknown;
  let repositories: unknown;
  try {
    skillIds = parseJsonField(raw.skillIds);
    repositories = parseJsonField(raw.repositories);
  } catch {
    return failure("La lista de habilidades o repositorios no es válida.");
  }
  const parsed = projectSchema.safeParse({
    ...raw,
    skillIds,
    repositories,
    isFeatured: isChecked(raw.isFeatured),
    displayOrder: raw.displayOrder || 0,
    demoUrl: raw.demoUrl || null,
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const value = parsed.data;
  const slug = await uniqueProjectSlug(value.title, value.slug, value.id);
  const current = await prisma.project.findUnique({
    where: { id: value.id || NIL_UUID },
    select: { slug: true },
  });
  const project = await prisma.$transaction(async (tx) => {
    const data = {
      title: value.title,
      slug,
      shortDescription: value.shortDescription,
      description: value.description,
      demoUrl: value.demoUrl || null,
      status: value.status,
      isFeatured: value.isFeatured,
      displayOrder: value.displayOrder,
      startDate: value.startDate ? new Date(value.startDate) : null,
      endDate: value.endDate ? new Date(value.endDate) : null,
    };
    const saved = value.id
      ? await tx.project.update({ where: { id: value.id }, data })
      : await tx.project.create({ data });
    await tx.projectSkill.deleteMany({ where: { projectId: saved.id } });
    if (value.skillIds.length) {
      await tx.projectSkill.createMany({
        data: value.skillIds.map((skillId, displayOrder) => ({
          projectId: saved.id,
          skillId,
          displayOrder,
        })),
      });
    }
    await tx.projectRepository.deleteMany({ where: { projectId: saved.id } });
    if (value.repositories.length) {
      await tx.projectRepository.createMany({
        data: value.repositories.map((repository, displayOrder) => ({
          ...repository,
          projectId: saved.id,
          displayOrder,
        })),
      });
    }
    return saved;
  });
  revalidatePortfolio(current?.slug);
  revalidatePortfolio(project.slug);
  if (!value.id) redirect(`/admin/proyectos/${project.id}`);
  return { ok: true, message: "Proyecto guardado." };
}

export async function setProjectStatus(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["DRAFT", "PUBLISHED"]) })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return failure("Proyecto inválido.");
  const project = await prisma.project.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    select: { slug: true },
  });
  revalidatePortfolio(project.slug);
  return {
    ok: true,
    message: parsed.data.status === "PUBLISHED" ? "Proyecto publicado." : "Proyecto pasado a borrador.",
  };
}

export async function setProjectFeatured(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return failure("Proyecto inválido.");
  const featured = formData.get("featured") === "true";
  const project = await prisma.project.update({
    where: { id: id.data },
    data: { isFeatured: featured },
    select: { slug: true },
  });
  revalidatePortfolio(project.slug);
  return { ok: true, message: featured ? "Proyecto destacado." : "Proyecto sin destacar." };
}

export async function reorderProjects(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = parseIdList(formData.get("ids"));
  if (!ids) return failure("Lista inválida.");
  await prisma.$transaction(
    ids.map((id, displayOrder) => prisma.project.update({ where: { id }, data: { displayOrder } })),
  );
  revalidatePortfolio();
  return { ok: true, message: "Orden actualizado." };
}

export async function deleteProject(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return failure("Proyecto inválido.");
  const project = await prisma.project.delete({ where: { id: id.data }, select: { slug: true } });
  revalidatePortfolio(project.slug);
  return { ok: true, message: "Proyecto eliminado." };
}

export async function registerProjectImage(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = imageSchema.safeParse({
    ...readForm(formData),
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const value = parsed.data;
  if (value.type === "COVER") {
    await prisma.projectImage.updateMany({
      where: { projectId: value.projectId, type: "COVER" },
      data: { type: "GALLERY", displayOrder: 9999 },
    });
  }
  await prisma.projectImage.create({ data: value });
  const project = await prisma.project.findUnique({
    where: { id: value.projectId },
    select: { slug: true },
  });
  revalidatePortfolio(project?.slug);
  return { ok: true, message: "Imagen registrada." };
}

export async function updateProjectImageAlt(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = altSchema.safeParse({ id: formData.get("id"), alt: formData.get("alt") });
  if (!parsed.success) return validationFailure(parsed.error);
  const image = await prisma.projectImage.update({
    where: { id: parsed.data.id },
    data: { alt: parsed.data.alt },
    select: { project: { select: { slug: true } } },
  });
  revalidatePortfolio(image.project.slug);
  return { ok: true, message: "Texto alternativo guardado." };
}

export async function reorderProjectImages(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = parseIdList(formData.get("ids"));
  if (!ids || ids.length === 0) return failure("Lista inválida.");
  // Todas las imágenes deben existir y pertenecer al mismo proyecto.
  const images = await prisma.projectImage.findMany({
    where: { id: { in: ids } },
    select: { projectId: true, project: { select: { slug: true } } },
  });
  const projectIds = new Set(images.map((image) => image.projectId));
  if (images.length !== new Set(ids).size || projectIds.size !== 1) {
    return failure("Las imágenes deben pertenecer a un mismo proyecto.");
  }
  await prisma.$transaction(
    ids.map((id, displayOrder) => prisma.projectImage.update({ where: { id }, data: { displayOrder } })),
  );
  revalidatePortfolio(images[0]?.project.slug);
  return { ok: true, message: "Orden actualizado." };
}

export async function deleteProjectImage(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return failure("Imagen inválida.");
  const image = await prisma.projectImage.delete({
    where: { id: id.data },
    select: { publicId: true, project: { select: { slug: true } } },
  });
  const { destroyImage } = await import("@/server/cloudinary");
  await destroyImage(image.publicId);
  revalidatePortfolio(image.project.slug);
  return { ok: true, message: "Imagen eliminada." };
}
