import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedProjectSlugs() {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map(({ slug }) => slug);
}
