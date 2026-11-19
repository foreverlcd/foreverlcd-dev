import type { Metadata } from "next";
import "@/components/signal/signal.css";

import { ProjectCard } from "@/components/public/project-card";
import { SiteHeader } from "@/components/public/site-header";
import { getPublishedProjects } from "@/server/dal/projects/get-published-projects";

import { ProjectFilter } from "./project-filter";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Todos los proyectos publicados: tecnologías, repositorios y demos.",
  alternates: { canonical: "/proyectos" },
};

export default async function ProjectsIndexPage() {
  const projects = await getPublishedProjects();

  const skillMap = new Map<string, { slug: string; name: string }>();
  for (const project of projects) {
    for (const skill of project.skills) skillMap.set(skill.slug, { slug: skill.slug, name: skill.name });
  }
  const skills = [...skillMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  const items = projects.map((project, index) => ({
    slug: project.slug,
    skillSlugs: project.skills.map((skill) => skill.slug),
    card: <ProjectCard project={project} eager={index === 0} />,
  }));

  return (
    <div className="signal">
      <SiteHeader />
      <main id="principal" className="mx-auto max-w-6xl px-(--pad) pt-12 pb-24">
        <p className="font-mono text-xs uppercase tracking-widest text-(--signal)">Índice</p>
        <h1 className="mt-3 mb-8 font-display text-[clamp(2rem,6.4vw,4.5rem)] leading-[0.98] tracking-[-0.045em] text-(--ink)">
          Proyectos
        </h1>
        {projects.length === 0 ? (
          <p className="text-(--ash)">Aún no hay proyectos publicados.</p>
        ) : (
          <ProjectFilter skills={skills} items={items} />
        )}
      </main>
    </div>
  );
}
