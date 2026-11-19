import "server-only";

import { cache } from "react";

import { getActiveEducation } from "@/server/dal/education/get-active-education";
import { getActiveExperiences } from "@/server/dal/experience/get-active-experiences";
import { getProfileContactEmail } from "@/server/dal/profile/get-profile-contact-email";
import { getPublishedProfile } from "@/server/dal/profile/get-published-profile";
import { getPublishedProjects } from "@/server/dal/projects/get-published-projects";
import { getPublishedSkillCategories } from "@/server/dal/skills/get-published-skill-categories";

import { getDemoPortfolio, isDemoMode } from "./demo-portfolio";

export type PublishedProfile = NonNullable<Awaited<ReturnType<typeof getPublishedProfile>>>;
export type PublishedProject = Awaited<ReturnType<typeof getPublishedProjects>>[number];
export type ActiveExperience = Awaited<ReturnType<typeof getActiveExperiences>>[number];
export type ActiveEducation = Awaited<ReturnType<typeof getActiveEducation>>[number];
export type SkillCategory = Awaited<ReturnType<typeof getPublishedSkillCategories>>[number];

/**
 * Un span de la traza de compilación. Se mide en el servidor cuando la página
 * se genera (build o regeneración), no en cada visita: la portada es estática.
 */
export type BuildSpan = {
  name: string;
  /** Desplazamiento desde el inicio de la compilación, en ms. */
  start: number;
  duration: number;
  rows: number;
};

export type BuildTrace = {
  generatedAt: string;
  totalMs: number;
  region: string | null;
  spans: BuildSpan[];
};

export type Portfolio = {
  demo: boolean;
  profile: PublishedProfile | null;
  contactEmail: string | null;
  projects: PublishedProject[];
  experiences: ActiveExperience[];
  education: ActiveEducation[];
  skillCategories: SkillCategory[];
  trace: BuildTrace;
};

function countRows(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}

async function timed<T>(
  name: string,
  origin: number,
  spans: BuildSpan[],
  run: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  const result = await run();
  const end = performance.now();
  spans.push({
    name,
    start: round(start - origin),
    duration: round(end - start),
    rows: countRows(result),
  });
  return result;
}

function round(ms: number) {
  return Math.round(ms * 10) / 10;
}

/**
 * Carga todo el contenido público en paralelo y registra cuánto tardó cada
 * consulta. Esa medición real alimenta la traza visible en la portada.
 */
export const loadPortfolio = cache(async (): Promise<Portfolio> => {
  if (isDemoMode()) {
    return getDemoPortfolio();
  }

  const spans: BuildSpan[] = [];
  const origin = performance.now();

  const [profile, projects, experiences, education, skillCategories] = await Promise.all([
    timed("profile.findUnique", origin, spans, getPublishedProfile),
    timed("project.findMany", origin, spans, getPublishedProjects),
    timed("experience.findMany", origin, spans, getActiveExperiences),
    timed("education.findMany", origin, spans, getActiveEducation),
    timed("skillCategory.findMany", origin, spans, getPublishedSkillCategories),
  ]);

  const contactEmail = profile
    ? profile.email?.trim() || null
    : await timed("profile.contactEmail", origin, spans, getProfileContactEmail);

  spans.sort((a, b) => a.start - b.start);

  return {
    demo: false,
    profile,
    contactEmail,
    // Sin perfil publicado no se expone ningún contenido, aunque exista.
    projects: profile ? projects : [],
    experiences: profile ? experiences : [],
    education: profile ? education : [],
    skillCategories: profile ? skillCategories : [],
    trace: {
      generatedAt: new Date().toISOString(),
      totalMs: round(performance.now() - origin),
      region: process.env.VERCEL_REGION ?? null,
      spans,
    },
  };
});
