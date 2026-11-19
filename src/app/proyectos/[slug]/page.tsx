import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/components/signal/signal.css";
import { formatMonthRangeShort } from "@/components/public/dates";
import { ProjectPlate } from "@/components/public/project-plate";
import { RepoLinks } from "@/components/public/repo-links";
import { SiteHeader } from "@/components/public/site-header";
import { SkillChip } from "@/components/public/skill-chip";
import { getPublishedProfile } from "@/server/dal/profile/get-published-profile";
import { getPublishedProjects } from "@/server/dal/projects/get-published-projects";
import { getPublishedProjectBySlug } from "@/server/dal/projects/get-published-project-by-slug";
import { getPublishedProjectNeighbors } from "@/server/dal/projects/get-published-project-neighbors";
import { getPublishedProjectSlugs } from "@/server/dal/projects/get-published-project-slugs";

export const revalidate = 86400;

export async function generateStaticParams() {
  if (!(await getPublishedProfile())) return [];
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: "Proyecto no encontrado" };
  const images = project.cover
    ? [{ url: project.cover.secureUrl, width: project.cover.width, height: project.cover.height, alt: project.cover.alt }]
    : undefined;
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/proyectos/${slug}` },
    openGraph: {
      type: "article",
      locale: "es_PE",
      siteName: "foreverlcd.dev",
      url: `/proyectos/${slug}`,
      title: project.title,
      description: project.shortDescription,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.shortDescription,
      ...(images && { images: images.map((i) => i.url) }),
    },
  };
}

function Meta({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="sg-mono">{label}</dt>
      <dd className="text-sm text-(--ink)">{children ?? <span className="sg-none">—</span>}</dd>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-(--line) pt-4 sm:mt-14">
      <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-(--ash)">{label}</h2>
      {children}
    </section>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Sin perfil publicado no se expone contenido (igual que la portada: pub-waiting).
  const profile = await getPublishedProfile();
  if (!profile) notFound();
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();
  const { previous, next } = await getPublishedProjectNeighbors(slug);
  const dates = formatMonthRangeShort(project.startDate, project.endDate);
  const index = Math.max(0, (await getPublishedProjects()).findIndex((item) => item.slug === slug));

  return (
    <div className="signal sg-page">
      <SiteHeader fullName={profile.fullName} />
      <main id="principal" className="mx-auto max-w-6xl px-(--pad) pt-8 pb-24">
        <Link
          href="/proyectos"
          className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-(--ash) hover:text-(--signal)"
        >
          ← Proyectos
        </Link>
        {project.cover ? (
          <Image
            className="mt-4 h-auto w-full border border-(--line)"
            src={project.cover.secureUrl}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 1152px) 1152px, 100vw"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <ProjectPlate title={project.title} index={index} wide className="mt-4" />
        )}
        <p className="mt-8 font-mono text-xs uppercase tracking-widest">
          <span className="text-(--signal)">Proyecto</span>
          {project.isFeatured && <span className="ml-3 text-(--signal)">· Destacado</span>}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,6.4vw,4.5rem)] leading-[0.98] tracking-[-0.045em] text-(--ink)">
          {project.title}
        </h1>
        <p className="mt-5 max-w-[52ch] text-[clamp(1.0625rem,1.6vw,1.375rem)] text-(--ink)/80">
          {project.shortDescription}
        </p>
        <dl className="sg-meta mt-8" aria-label="Datos del proyecto">
          <Meta label="Fechas">{dates}</Meta>
          <Meta label="Stack">
            {project.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Tecnologías">
                {project.skills.map((skill) => (
                  <li key={skill.slug}>
                    <SkillChip skill={skill} />
                  </li>
                ))}
              </ul>
            ) : null}
          </Meta>
          <Meta label="Repositorio">
            {project.repositories.length > 0 ? <RepoLinks repositories={project.repositories} /> : null}
          </Meta>
          <Meta label="Demo">
            {project.demoUrl ? (
              <a
                className="inline-flex min-h-11 items-center border-b border-(--signal) font-mono text-xs uppercase tracking-widest text-(--signal)"
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver demo ↗
              </a>
            ) : null}
          </Meta>
        </dl>
        <Block label="Descripción">
          <div className="max-w-[68ch] space-y-4 leading-relaxed text-(--ink)/90">
            {project.description
              .split(/\n\s*\n/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
          </div>
        </Block>
        {project.gallery.length > 0 && (
          <Block label="Galería">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Galería">
              {project.gallery.map((image) => (
                <li key={image.secureUrl}>
                  <Image
                    className="h-auto w-full border border-(--line)"
                    src={image.secureUrl}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          </Block>
        )}
        <nav aria-label="Más proyectos" className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2">
          {previous && (
            <Link href={`/proyectos/${previous.slug}`} className="sg-pn-box">
              <span className="block font-mono text-xs uppercase tracking-widest text-(--ash)">← Anterior</span>
              <span className="mt-1 block font-display text-lg">{previous.title}</span>
            </Link>
          )}
          {next && (
            <Link href={`/proyectos/${next.slug}`} className="sg-pn-box text-right sm:col-start-2">
              <span className="block font-mono text-xs uppercase tracking-widest text-(--ash)">Siguiente →</span>
              <span className="mt-1 block font-display text-lg">{next.title}</span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
