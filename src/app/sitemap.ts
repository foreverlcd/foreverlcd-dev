import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { getPublishedSkillSlugs } from "@/server/dal/skills/get-published-skill-slugs";
import { loadPortfolio } from "@/server/portfolio/load-portfolio";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const { profile, projects } = await loadPortfolio();
  // Sin perfil publicado la portada es noindex: no se anuncia nada.
  if (!profile) return [];

  const skillSlugs = await getPublishedSkillSlugs();
  const lastModified = new Date();
  return [
    { url: new URL("/", base).toString(), lastModified },
    { url: new URL("/proyectos", base).toString(), lastModified },
    ...projects.map((project) => ({
      url: new URL(`/proyectos/${project.slug}`, base).toString(),
      lastModified,
    })),
    ...skillSlugs.map((skillSlug) => ({
      url: new URL(`/stack/${skillSlug}`, base).toString(),
      lastModified,
    })),
  ];
}
