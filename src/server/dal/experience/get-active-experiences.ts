import "server-only";

import { prisma } from "@/lib/prisma";

export async function getActiveExperiences() {
  return prisma.experience.findMany({
    where: {
      isActive: true,
      profile: {
        is: {
          isPublished: true,
        },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: {
      id: true,
      company: true,
      jobTitle: true,
      description: true,
      location: true,
      employmentType: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      displayOrder: true,
    },
  });
}
