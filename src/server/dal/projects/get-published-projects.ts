import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedProjects() {
  const projects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        displayOrder: "asc",
      },
      {
        slug: "asc",
      },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      demoUrl: true,
      isFeatured: true,
      displayOrder: true,
      startDate: true,
      endDate: true,

      images: {
        where: {
          type: "COVER",
        },
        select: {
          secureUrl: true,
          alt: true,
          width: true,
          height: true,
        },
      },

      skills: {
        where: { skill: { isActive: true, category: { isActive: true } } },
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          skill: {
            select: {
              name: true,
              slug: true,
              icon: true,
            },
          },
        },
      },

      repositories: {
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          type: true,
          url: true,
          displayOrder: true,
        },
      },
    },
  });

  return projects.map(({ images, skills, ...project }) => ({
    ...project,
    cover: images.at(0) ?? null,
    skills: skills.map(({ skill }) => skill),
  }));
}
