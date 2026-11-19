import "server-only";

import { prisma } from "@/lib/prisma";

/** Anterior/siguiente según el mismo orden que el índice /proyectos. */
export async function getPublishedProjectNeighbors(slug: string) {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { slug: "asc" }],
    select: { title: true, slug: true },
  });
  const index = rows.findIndex((row) => row.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return { previous: rows[index - 1] ?? null, next: rows[index + 1] ?? null };
}
