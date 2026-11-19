import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/components/signal/signal.css";

import { ProjectCard } from "@/components/public/project-card";
import { SiteHeader } from "@/components/public/site-header";
import { SkillChip } from "@/components/public/skill-chip";
import { SkillIcon } from "@/components/public/skill-icon";
import { getPublishedProfile } from "@/server/dal/profile/get-published-profile";
import { getPublishedProjects } from "@/server/dal/projects/get-published-projects";
import { getPublishedSkillBySlug } from "@/server/dal/skills/get-published-skill-by-slug";
import { getPublishedSkillSlugs } from "@/server/dal/skills/get-published-skill-slugs";

export const revalidate = 86400;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!(await getPublishedProfile())) return [];
  const slugs = await getPublishedSkillSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getPublishedSkillBySlug(slug);
  if (!skill) return { title: "Tecnología no encontrada" };
  return {
    title: skill.name,
    description: skill.description ?? `${skill.name} (${skill.category.name}): proyectos donde se usó.`,
    alternates: { canonical: `/stack/${slug}` },
  };
}

export default async function SkillPage({ params }: Params) {
  const { slug } = await params;
  // Sin perfil publicado no se expone contenido (igual que la portada: pub-waiting).
  const profile = await getPublishedProfile();
  if (!profile) notFound();
  const skill = await getPublishedSkillBySlug(slug);
  if (!skill) notFound();
  const siblings = skill.category.skills.filter((sibling) => sibling.slug !== skill.slug);
  // Posición global en el índice: la placa conserva el mismo color y número que en el resto del sitio.
  const order = new Map((await getPublishedProjects()).map((project, index) => [project.slug, index]));

  return (
    <div className="signal sg-page">
      <SiteHeader fullName={profile.fullName} />
      <main id="principal" className="mx-auto max-w-6xl px-(--pad) pt-12 pb-24">
        <Link
          href="/#stack"
          className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-(--ash) hover:text-(--signal)"
        >
          ← Stack
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-(--signal)">{skill.category.name}</p>
        <h1 className="mt-3 flex items-center gap-4 font-display text-[clamp(1.75rem,5.5vw,3.5rem)] leading-[0.98] tracking-[-0.045em] text-(--ink)">
          <SkillIcon icon={skill.icon} size={28} />
          {skill.name}
        </h1>
        {skill.description && (
          <p className="mt-6 max-w-[60ch] whitespace-pre-line text-[clamp(1.0625rem,1.6vw,1.25rem)] text-(--ink)/80">
            {skill.description}
          </p>
        )}
        <h2 className="mt-12 mb-6 border-t border-(--line) pt-4 font-mono text-xs uppercase tracking-widest text-(--ash)">
          Proyectos donde se usó ({skill.projects.length})
        </h2>
        {skill.projects.length === 0 ? (
          <p className="sg-empty font-mono text-xs uppercase tracking-widest">
            Aún sin proyectos publicados con {skill.name}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skill.projects.map((project, index) => (
              <li key={project.slug}>
                <ProjectCard project={project} index={order.get(project.slug) ?? index} eager={index === 0} />
              </li>
            ))}
          </ul>
        )}
        {siblings.length > 0 && (
          <>
            <h2 className="mt-12 mb-5 border-t border-(--line) pt-4 font-mono text-xs uppercase tracking-widest text-(--ash)">
              Más en {skill.category.name}
            </h2>
            <ul className="flex flex-wrap gap-2" aria-label={`Más en ${skill.category.name}`}>
              {siblings.map((sibling) => (
                <li key={sibling.slug}>
                  <SkillChip skill={sibling} />
                </li>
              ))}
            </ul>
          </>
        )}
        <Link
          href="/proyectos"
          className="mt-10 inline-flex min-h-11 items-center border-b border-(--signal) font-mono text-xs uppercase tracking-widest text-(--signal) hover:text-(--ink)"
        >
          Ver todos los proyectos →
        </Link>
      </main>
    </div>
  );
}
