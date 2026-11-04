import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedProfile() {
  return prisma.profile.findUnique({
    where: {
      id: "main",
      isPublished: true,
    },
    select: {
      fullName: true,
      headline: true,
      shortBio: true,
      biography: true,
      location: true,
      email: true,
      photoUrl: true,

      socialLinks: {
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          id: true,
          platform: true,
          label: true,
          url: true,
          displayOrder: true,
        },
      },
    },
  });
}
