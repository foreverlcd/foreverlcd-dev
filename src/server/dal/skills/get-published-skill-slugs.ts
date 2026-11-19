import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedSkillSlugs() {
  const rows = await prisma.skill.findMany({
    where: { isActive: true, category: { isActive: true } },
    select: { slug: true },
  });
  return rows.map(({ slug }) => slug);
}
