import "server-only";

import { prisma } from "@/lib/prisma";

/** Una skill es pública solo si ella y su categoría están activas. Sus proyectos: solo los PUBLISHED, en el orden del índice. */
export async function getPublishedSkillBySlug(slug: string) {
  const skill = await prisma.skill.findFirst({
    where: { slug, isActive: true, category: { isActive: true } },
    select: {
      name: true,
      slug: true,
      description: true,
      icon: true,
      category: {
        select: {
          name: true,
          // Hermanas de la misma categoría (solo campos públicos) para navegar sin salir del área.
          skills: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            select: { name: true, slug: true, icon: true },
          },
        },
      },
      projects: {
        where: { project: { status: "PUBLISHED" } },
        select: {
          project: {
            select: {
              title: true,
              slug: true,
              shortDescription: true,
              isFeatured: true,
              displayOrder: true,
              startDate: true,
              endDate: true,
              images: {
                where: { type: "COVER" },
                select: { secureUrl: true, alt: true, width: true, height: true },
              },
              skills: {
                where: { skill: { isActive: true, category: { isActive: true } } },
                orderBy: { displayOrder: "asc" },
                select: { skill: { select: { name: true, slug: true, icon: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!skill) return null;

  const projects = skill.projects
    .map(({ project }) => project)
    .sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder || a.slug.localeCompare(b.slug),
    )
    .map(({ images, skills, displayOrder: _order, ...project }) => ({
      ...project,
      cover: images.at(0) ?? null,
      skills: skills.map(({ skill: s }) => s),
    }));

  return { ...skill, projects };
}
