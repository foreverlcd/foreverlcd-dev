import "server-only";

import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const [projects, skills, experience, education, socialLinks, profile] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.socialLink.count(),
    prisma.profile.findUnique({
      where: { id: "main" },
      select: { isPublished: true },
    }),
  ]);
  return { projects, skills, experience, education, socialLinks, profile };
}

export async function getAdminProfile() {
  return prisma.profile.findUnique({ where: { id: "main" } });
}

export async function getAdminSocialLinks() {
  return prisma.socialLink.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function getAdminProjects() {
  return prisma.project.findMany({
    orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isFeatured: true,
      displayOrder: true,
    },
  });
}

export async function getAdminProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      skills: { select: { skillId: true } },
      repositories: { orderBy: { displayOrder: "asc" } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  });
}

export async function getAdminSkills() {
  const [categories, skills] = await Promise.all([
    prisma.skillCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { skills: true } } },
    }),
    prisma.skill.findMany({
      orderBy: { displayOrder: "asc" },
      include: { category: true },
    }),
  ]);
  return { categories, skills };
}

export async function getAdminExperiences() {
  return prisma.experience.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function getAdminEducation() {
  return prisma.education.findMany({ orderBy: { displayOrder: "asc" } });
}
