import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: project.cover ? [project.cover.secureUrl] : [],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <Link href="/" className="text-sm underline">← Portafolio</Link>
      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-accent-text">Proyecto</p>
      <h1 className="mt-3 font-display text-h1">{project.title}</h1>
      <p className="mt-5 text-xl text-fg-muted">{project.shortDescription}</p>
      {project.cover && (
        <Image
          className="mt-10 h-auto w-full"
          src={project.cover.secureUrl}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
        />
      )}
      <article className="prose prose-invert mt-10 max-w-none whitespace-pre-wrap">
        {project.description}
      </article>
      <div className="mt-8 flex flex-wrap gap-3">
        {project.skills.map((skill) => (
          <span key={skill.slug} className="border border-rule px-3 py-1">{skill.name}</span>
        ))}
      </div>
      {project.gallery.map((image) => (
        <Image
          key={image.secureUrl}
          className="mt-8 h-auto w-full"
          src={image.secureUrl}
          alt={image.alt}
          width={image.width}
          height={image.height}
        />
      ))}
      {project.demoUrl && <a className="mt-8 inline-block underline" href={project.demoUrl}>Ver demo</a>}
    </main>
  );
}
