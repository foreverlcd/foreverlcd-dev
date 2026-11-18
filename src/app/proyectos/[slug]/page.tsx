import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/components/signal/signal.css";
import { getPublishedProjectBySlug } from "@/server/dal/projects/get-published-project-by-slug";
import { getPublishedProjectSlugs } from "@/server/dal/projects/get-published-project-slugs";

export const revalidate = 86400;

export async function generateStaticParams() {
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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="signal min-h-svh px-[var(--pad)] pt-[max(5rem,calc(env(safe-area-inset-top)+3rem))] pb-24">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-(--ash) hover:text-(--signal)"
        >
          ← Portafolio
        </Link>
        <p className="mt-10 font-mono text-xs uppercase tracking-widest text-(--signal)">Proyecto</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,6.4vw,4.5rem)] leading-[0.98] tracking-[-0.045em] text-(--ink)">
          {project.title}
        </h1>
        <p className="mt-5 max-w-[52ch] text-[clamp(1.0625rem,1.6vw,1.375rem)] text-(--ink)/80">
          {project.shortDescription}
        </p>
        {project.cover && (
          <Image
            className="mt-10 h-auto w-full border border-(--line)"
            src={project.cover.secureUrl}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
          />
        )}
        <article className="mt-10 max-w-[68ch] whitespace-pre-wrap leading-relaxed text-(--ink)/90">
          {project.description}
        </article>
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tecnologías">
          {project.skills.map((skill) => (
            <li
              key={skill.slug}
              className="border border-(--line) px-3 py-1 font-mono text-xs uppercase tracking-wider text-(--ash)"
            >
              {skill.name}
            </li>
          ))}
        </ul>
        {project.gallery.map((image) => (
          <Image
            key={image.secureUrl}
            className="mt-8 h-auto w-full border border-(--line)"
            src={image.secureUrl}
            alt={image.alt}
            width={image.width}
            height={image.height}
          />
        ))}
        {project.demoUrl && (
          <a
            className="mt-8 inline-flex min-h-11 items-center border-b border-(--signal) font-mono text-xs uppercase tracking-widest text-(--signal)"
            href={project.demoUrl}
          >
            Ver demo ↗
          </a>
        )}
      </div>
    </main>
  );
}
