import "server-only";

import { prisma } from "@/lib/prisma";

export async function getActiveEducation() {
  return prisma.education.findMany({
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
      institution: true,
      degree: true,
      fieldOfStudy: true,
      description: true,
      location: true,
      type: true,
      credentialUrl: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      displayOrder: true,
    },
  });
}
