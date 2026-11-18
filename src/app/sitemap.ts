import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { loadPortfolio } from "@/server/portfolio/load-portfolio";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const { profile, projects } = await loadPortfolio();
  // Sin perfil publicado la portada es noindex: no se anuncia nada.
  if (!profile) return [];

  const lastModified = new Date();
  return [
    { url: new URL("/", base).toString(), lastModified },
    ...projects.map((project) => ({
      url: new URL(`/proyectos/${project.slug}`, base).toString(),
      lastModified,
    })),
  ];
}
