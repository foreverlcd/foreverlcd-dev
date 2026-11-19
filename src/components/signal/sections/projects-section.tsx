import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { RepoLinks } from "@/components/public/repo-links";
import { SkillChip } from "@/components/public/skill-chip";
import type { PublishedProject } from "@/server/portfolio/load-portfolio";

import { formatRange } from "../format";

/** Color de señal por proyecto: signal → uv → coral. */
const SIGNAL_CYCLE = [
  { sig: "var(--signal)", text: "var(--signal)" },
  { sig: "var(--uv)", text: "var(--uv-text)" },
  { sig: "var(--coral)", text: "var(--coral)" },
];

type Props = { projects: PublishedProject[]; total: number; kicker: ReactNode };

/** #proyectos: los destacados (o los primeros por orden si no hay ninguno), con enlace al índice completo. */
export function ProjectsSection({ projects, total, kicker }: Props) {
  return (
    <section id="proyectos" className="sg-sec" data-section="proyectos" aria-labelledby="proyectos-title">
      <div className="sg-col">
        {kicker}
        <h2 id="proyectos-title" data-split>
          Proyectos seleccionados
        </h2>
        <ol className="sg-list">
          {projects.map((project, i) => {
            const color = SIGNAL_CYCLE[i % SIGNAL_CYCLE.length];
            const range = formatRange(
              project.startDate,
              project.endDate,
              !project.endDate && Boolean(project.startDate),
            );
            return (
              <li
                key={project.id}
                className="sg-proj"
                data-project={i}
                data-rv
                style={{ "--sig": color.sig, "--sig-text": color.text } as CSSProperties}
              >
                <span className="sg-pn sg-mono">P{i + 1}</span>
                <h3 className="sg-pt">
                  <Link href={`/proyectos/${project.slug}`} data-title>
                    {project.title}
                  </Link>
                </h3>
                <span className="sg-py sg-mono">
                  {project.isFeatured ? <b className="sg-badge">DESTACADO</b> : null}
                  {range}
                </span>
                {project.cover ? (
                  <Image
                    src={project.cover.secureUrl}
                    alt={project.cover.alt}
                    width={project.cover.width}
                    height={project.cover.height}
                    sizes="(max-width: 760px) 90vw, (max-width: 1024px) 50vw, 360px"
                    className="sg-pc"
                  />
                ) : null}
                <p className="sg-pd">{project.shortDescription}</p>
                {project.skills.length ? (
                  <ul className="sg-tags" aria-label="Tecnologías">
                    {project.skills.map((s) => (
                      <li key={s.slug}>
                        <SkillChip skill={s} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="sg-plinks sg-mono">
                  {project.demoUrl ? (
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      Demo<span className="sr-only"> de {project.title}</span> ↗
                    </a>
                  ) : null}
                  <RepoLinks repositories={project.repositories} />
                </div>
                <span className="sg-arr" aria-hidden="true">
                  ↗
                </span>
              </li>
            );
          })}
        </ol>
        <Link className="sg-all sg-mono" href="/proyectos">
          Ver todos los proyectos ({total}) <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
