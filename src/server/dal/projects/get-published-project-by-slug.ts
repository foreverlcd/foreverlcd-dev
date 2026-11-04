import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      description: true,
      repositoryUrl: true,
      demoUrl: true,
      isFeatured: true,
      startDate: true,
      endDate: true,

      images: {
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          type: true,
          secureUrl: true,
          alt: true,
          width: true,
          height: true,
          displayOrder: true,
        },
      },

      skills: {
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
    },
  });

  if (!project) {
    return null;
  }

  const { images, skills, ...projectData } = project;

  const cover = images.find((image) => image.type === "COVER");

  const gallery = images
    .filter((image) => image.type === "GALLERY")
    .map(({ secureUrl, alt, width, height, displayOrder }) => ({
      secureUrl,
      alt,
      width,
      height,
      displayOrder,
    }));

  return {
    ...projectData,
    cover: cover ?? null,
    gallery,
    skills: skills.map(({ skill }) => skill),
  };
}
