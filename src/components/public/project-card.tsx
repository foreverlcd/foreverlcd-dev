import Image from "next/image";
import Link from "next/link";

import { formatRange } from "@/components/signal/format";

import { ProjectPlate } from "./project-plate";
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

/** `eager`: la primera tarjeta visible (candidata a LCP) se carga sin esperar. */
export function ProjectCard({
  project,
  index,
  eager = false,
}: {
  project: ProjectCardData;
  /** Posición del proyecto en el índice (base 0): color y número de la placa sin portada. */
  index: number;
  eager?: boolean;
}) {
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
            className="sg-cardimg border-b border-(--line)"
          />
        ) : (
          <ProjectPlate title={project.title} index={index} className="sg-plate--flush" />
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
