import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedSkillCategories() {
  return prisma.skillCategory.findMany({
    where: {
      isActive: true,
      skills: {
        some: {
          isActive: true,
        },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      displayOrder: true,

      skills: {
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          displayOrder: true,
        },
      },
    },
  });
}
