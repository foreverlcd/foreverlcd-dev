import Image from "next/image";
import Link from "next/link";

import { formatRange } from "@/components/signal/format";

import { SkillChip } from "./skill-chip";

export type ProjectCardData = {
  title: string;
  slug: string;
  shortDescription: string;
  isFeatured: boolean;
  startDate: Date | null;
  endDate: Date | null;
  cover: { secureUrl: string; alt: string; width: number; height: number } | null;
  skills: { name: string; slug: string; icon: string | null }[];
};

const initials = (title: string) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join("");

/** `eager`: la primera tarjeta visible (candidata a LCP) se carga sin esperar. */
export function ProjectCard({ project, eager = false }: { project: ProjectCardData; eager?: boolean }) {
  const years = formatRange(project.startDate, project.endDate);
  return (
    <article className="flex h-full flex-col border border-(--line)">
      <Link href={`/proyectos/${project.slug}`} tabIndex={-1} aria-hidden="true" className="block">
        {project.cover ? (
          <Image
            src={project.cover.secureUrl}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            {...(eager && { loading: "eager" as const, fetchPriority: "high" as const })}
            className="aspect-[16/10] w-full border-b border-(--line) object-cover"
          />
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center border-b border-(--line) font-display text-4xl text-(--ash)">
            {initials(project.title)}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest">
          {project.isFeatured && <span className="text-(--signal)">Destacado</span>}
          {years && <span className="text-(--ash)">{years}</span>}
        </div>
        <h3 className="font-display text-xl leading-tight tracking-[-0.03em] text-(--ink)">
          <Link href={`/proyectos/${project.slug}`} className="hover:text-(--signal)">
            {project.title}
          </Link>
        </h3>
        <p className="text-(--ink)/80">{project.shortDescription}</p>
        {project.skills.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Tecnologías">
            {project.skills.map((skill) => (
              <li key={skill.slug}>
                <SkillChip skill={skill} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
