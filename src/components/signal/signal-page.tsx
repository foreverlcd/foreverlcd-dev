import type { CSSProperties } from "react";
import Link from "next/link";

import type { Portfolio } from "@/server/portfolio/load-portfolio";

import {
  EDUCATION_LABEL,
  EMPLOYMENT_LABEL,
  REPOSITORY_LABEL,
  formatRange,
  formatStamp,
  pad,
} from "./format";
import { Hud } from "./hud";
import { ReadingToggle } from "./reading-toggle";
import { SignalDirector } from "./signal-director";
import { SignalStage } from "./signal-stage";
import { TraceLog } from "./trace-log";
import { VisitWaterfall } from "./visit-waterfall";

import "./signal.css";

/** Color de señal por proyecto: signal → uv → coral. */
const SIGNAL_CYCLE = [
  { sig: "var(--signal)", text: "var(--signal)" },
  { sig: "var(--uv)", text: "var(--uv-text)" },
  { sig: "var(--coral)", text: "var(--coral)" },
];

/**
 * Reparte el nombre en líneas equilibradas: una palabra por línea con 1-2 palabras,
 * 2 líneas con 3-4 y 3 líneas con 5 o más (se minimiza la línea más larga).
 */
function splitName(fullName: string): string[] {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return words.length ? words : [fullName];
  const groups = words.length >= 5 ? 3 : 2;

  let best: string[] = [words.join(" ")];
  let bestMax = Infinity;
  const search = (start: number, left: number, acc: string[]) => {
    if (left === 1) {
      const lines = [...acc, words.slice(start).join(" ")];
      const longest = Math.max(...lines.map((l) => l.length));
      if (longest < bestMax) {
        bestMax = longest;
        best = lines;
      }
      return;
    }
    for (let end = start + 1; end <= words.length - (left - 1); end++) {
      search(end, left - 1, [...acc, words.slice(start, end).join(" ")]);
    }
  };
  search(0, groups, []);
  return best;
}

/** Iniciales: primera palabra y la de índice ceil(n/2) (3 y 4 palabras: la 1.ª y la 3.ª). */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const second = words[Math.min(Math.ceil(words.length / 2), words.length - 1)];
  return words.length === 1
    ? words[0][0].toUpperCase()
    : `${words[0][0]}.${second[0]}`.toUpperCase();
}

type Section = { id: string; label: string };

export function SignalPage({ portfolio }: { portfolio: Portfolio }) {
  const { profile, projects, experiences, education, skillCategories, trace, contactEmail, demo } =
    portfolio;

  const email = profile?.email?.trim() || contactEmail;
  const socials = profile?.socialLinks ?? [];
  const hasPath = experiences.length > 0 || education.length > 0;
  const hasContact = Boolean(profile) && (Boolean(email) || socials.length > 0);

  const sections: Section[] = [
    { id: "inicio", label: "Inicio" },
    projects.length ? { id: "proyectos", label: "Proyectos" } : null,
    hasPath ? { id: "trayectoria", label: "Trayectoria" } : null,
    skillCategories.length ? { id: "stack", label: "Stack" } : null,
    hasContact ? { id: "contacto", label: "Contacto" } : null,
    { id: "traza", label: "Traza" },
  ].filter((s): s is Section => s !== null);
  const numberOf = (id: string) => pad(sections.findIndex((s) => s.id === id));

  // Barra inferior móvil: tres enlaces como máximo.
  const primary = new Set(
    ["proyectos", "trayectoria", "contacto", "stack", "traza"]
      .filter((id) => sections.some((s) => s.id === id))
      .slice(0, 3),
  );
  const navItems = sections.filter((s) => s.id !== "inicio");

  const fullName = profile?.fullName.trim() || "";
  const heroLines = profile ? splitName(fullName) : ["En", "compilación"];
  const longestLine = Math.max(...heroLines.map((line) => line.length));
  const mainStack = [
    ...new Map(skillCategories.flatMap((c) => c.skills).map((s) => [s.slug, s])).values(),
  ].slice(0, 5);

  const totalRows = trace.spans.reduce((sum, span) => sum + span.rows, 0);
  const logLines = [
    `$ next build · ${formatStamp(trace.generatedAt)}`,
    ...trace.spans.map(
      (s) => `prisma.${s.name.padEnd(22, " ")} ${String(s.duration).padStart(5)} ms · ${s.rows} filas`,
    ),
    `render estático ✓ ${trace.totalMs} ms${trace.region ? ` · ${trace.region}` : ""}`,
  ];
  const traceEnd = Math.max(1, ...trace.spans.map((s) => s.start + s.duration));

  const kicker = (id: string, label: string) => (
    <span className="sg-kick sg-mono" data-rv data-scr>
      {numberOf(id)} — {label}
    </span>
  );

  return (
    <div className="signal">
      <SignalStage sections={sections.map((s) => s.id)} projectCount={projects.length} />
      <div className="sg-vig" aria-hidden="true" />
      <Hud sectionTotal={sections.length - 1} />

      <header className="sg-header">
        <a
          className="sg-brand"
          href="#inicio"
          data-hi
          aria-label={`Inicio — ${fullName || "foreverlcd.dev"}`}
        >
          <span>
            <i aria-hidden="true" />
            <span data-scr>{profile ? initialsOf(fullName) : "foreverlcd"}</span>
          </span>
          <span className="sg-brand-id" data-scr>
            {profile ? fullName.toUpperCase() : ".DEV"}
          </span>
        </a>
        <nav className="sg-nav" aria-label="Secciones" data-hi>
          <ul>
            {navItems.map((item) => (
              <li key={item.id} data-primary={primary.has(item.id) ? "" : undefined}>
                <a href={`#${item.id}`} data-nav={item.id}>
                  <span className="sg-nav-n" aria-hidden="true">{numberOf(item.id)}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sg-tools" data-hi>
          <ReadingToggle />
        </div>
      </header>

      <main id="principal">
        {/* Inicio ---------------------------------------------------- */}
        <section id="inicio" className="sg-hero" data-section="inicio">
          {demo ? (
            <p className="sg-demo sg-mono" role="note">
              DEMO · contenido de relleno para desarrollo local
            </p>
          ) : null}
          <h1
            id="signal-name"
            className="sg-name"
            style={{ "--n": longestLine } as CSSProperties}
          >
            {heroLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {i > 0 ? " " : null}
                <span
                  className="ln"
                  data-name-line
                  style={{ "--ln": line.length } as CSSProperties}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <div className="sg-hero-foot">
            <div className="sg-hero-copy">
              <p className="sg-lede" data-lede>
                {profile ? profile.headline : "El portfolio se está compilando."}
              </p>
              <p className="sg-bio">
                {profile ? profile.shortBio : "El contenido aún no está publicado."}
              </p>
            </div>
            <div className="sg-hero-meta" data-hi>
              {profile && projects.length ? (
                <a className="sg-cta" href="#proyectos">
                  Ver proyectos <span aria-hidden="true">↓</span>
                </a>
              ) : null}
              {profile && hasContact ? (
                <a className="sg-cta sg-cta-ghost" href="#contacto">
                  Contacto <span aria-hidden="true">↓</span>
                </a>
              ) : null}
              {!profile && email ? (
                <a className="sg-cta" href={`mailto:${email}`}>
                  {email}
                </a>
              ) : null}
              {mainStack.length ? (
                <ul className="sg-stack-line" aria-label="Stack principal">
                  {mainStack.map((skill) => (
                    <li key={skill.slug}>{skill.name}</li>
                  ))}
                </ul>
              ) : null}
              {profile?.location ? <p className="sg-mono sg-meta-line">{profile.location}</p> : null}
            </div>
          </div>
        </section>

        {/* Proyectos ------------------------------------------------- */}
        {projects.length ? (
          <section
            id="proyectos"
            className="sg-sec"
            data-section="proyectos"
            aria-labelledby="proyectos-title"
          >
            <div className="sg-col">
              {kicker("proyectos", "Proyectos")}
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
                      <span className="sg-py sg-mono">{range}</span>
                      <p className="sg-pd">{project.shortDescription}</p>
                      {project.skills.length ? (
                        <ul className="sg-tags" aria-label="Tecnologías">
                          {project.skills.map((s) => (
                            <li key={s.slug}>{s.name}</li>
                          ))}
                        </ul>
                      ) : null}
                      <ul className="sg-plinks sg-mono">
                        {project.demoUrl ? (
                          <li>
                            <a href={project.demoUrl} target="_blank" rel="noreferrer">
                              Demo<span className="sr-only"> de {project.title}</span> ↗
                            </a>
                          </li>
                        ) : null}
                        {project.repositories.map((repo) => (
                          <li key={repo.url}>
                            <a href={repo.url} target="_blank" rel="noreferrer">
                              {REPOSITORY_LABEL[repo.type] ?? "Repositorio"}
                              <span className="sr-only"> de {project.title}</span> ↗
                            </a>
                          </li>
                        ))}
                      </ul>
                      <span className="sg-arr" aria-hidden="true">↗</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        {/* Trayectoria ----------------------------------------------- */}
        {hasPath ? (
          <section
            id="trayectoria"
            className="sg-sec"
            data-section="trayectoria"
            aria-labelledby="trayectoria-title"
          >
            <div className="sg-col">
              {kicker("trayectoria", "Trayectoria")}
              <h2 id="trayectoria-title" data-split>
                Trayectoria
              </h2>
              {experiences.length ? (
                <>
                  <h3 className="sg-sub sg-mono">Experiencia</h3>
                  <ol className="sg-tl">
                    {experiences.map((item) => (
                      <li key={item.id} data-rv>
                        <span className="sg-yr sg-mono">
                          {formatRange(item.startDate, item.endDate, item.isCurrent)}
                        </span>
                        <h4>{item.jobTitle}</h4>
                        <p className="sg-org">
                          {item.company}
                          {item.employmentType !== "OTHER"
                            ? ` · ${EMPLOYMENT_LABEL[item.employmentType] ?? item.employmentType}`
                            : ""}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                        <p>{item.description}</p>
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
              {education.length ? (
                <>
                  <h3 className="sg-sub sg-mono">Formación</h3>
                  <ol className="sg-tl">
                    {education.map((item) => (
                      <li key={item.id} data-rv>
                        <span className="sg-yr sg-mono">
                          {formatRange(item.startDate, item.endDate, item.isCurrent)}
                        </span>
                        <h4>{item.degree}</h4>
                        <p className="sg-org">
                          {item.institution} · {EDUCATION_LABEL[item.type] ?? item.type}
                        </p>
                        <p>{item.fieldOfStudy}</p>
                        {item.credentialUrl ? (
                          <a className="sg-inline" href={item.credentialUrl} target="_blank" rel="noreferrer">
                            Ver credencial ↗
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Stack ----------------------------------------------------- */}
        {skillCategories.length ? (
          <section id="stack" className="sg-sec" data-section="stack" aria-labelledby="stack-title">
            <div className="sg-col">
              {kicker("stack", "Stack")}
              <h2 id="stack-title" data-split>
                Stack
              </h2>
              <div className="sg-stack">
                {skillCategories.map((category) => (
                  <div key={category.id} className="sg-stack-group" data-rv>
                    <h3 className="sg-sub sg-mono">{category.name}</h3>
                    <ul>
                      {category.skills.map((s) => (
                        <li key={s.id}>{s.name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Contacto -------------------------------------------------- */}
        {hasContact ? (
          <section
            id="contacto"
            className="sg-sec"
            data-section="contacto"
            aria-labelledby="contacto-title"
          >
            <div className="sg-col">
              {kicker("contacto", "Contacto")}
              <h2 id="contacto-title" data-split>
                Hablemos
              </h2>
              {email ? (
                <a
                  className={email.length > 24 ? "sg-mail sg-mail--long" : "sg-mail"}
                  href={`mailto:${email}`}
                  data-rv
                >
                  {/* Corte permitido antes de "@": un correo largo nunca se parte a mitad de palabra. */}
                  <span className="sg-mail-part">{email.slice(0, email.indexOf("@"))}</span>
                  <wbr />
                  <span className="sg-mail-part">{email.slice(email.indexOf("@"))}</span>
                </a>
              ) : null}
              {socials.length ? (
                <ul className="sg-socials sg-mono" data-rv>
                  {socials.map((link) => (
                    <li key={link.id}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Traza ----------------------------------------------------- */}
        <section id="traza" className="sg-sec" data-section="traza" aria-labelledby="traza-title">
          <div className="sg-col sg-col-wide">
            {kicker("traza", "Traza")}
            <h2 id="traza-title" data-split>
              Cómo llegó esta página a ti
            </h2>
            <p className="sg-lead" data-rv>
              Esta portada no se renderiza en cada visita: se compila contra PostgreSQL, se publica como HTML
              estático en la CDN y se regenera cuando cambia el contenido. Estas son las dos mitades de ese
              viaje, medidas de verdad.
            </p>
            <div className="sg-panel" data-rv>
              <TraceLog lines={logLines} />
            </div>
            <div className="sg-trace" data-rv>
              <div className="sg-panel">
                <h3 className="sg-sub sg-mono">Compilación · servidor</h3>
                <ul className="waterfall" aria-label="Consultas de la compilación">
                  {trace.spans.map((span) => (
                    <li key={span.name} className="waterfall__row">
                      <span className="waterfall__label">{span.name}</span>
                      <span className="waterfall__track" aria-hidden="true">
                        <span
                          className="waterfall__bar"
                          style={{
                            left: `${(span.start / traceEnd) * 100}%`,
                            width: `max(2px, ${(span.duration / traceEnd) * 100}%)`,
                          }}
                        />
                      </span>
                      <span className="waterfall__value">{span.duration} ms</span>
                    </li>
                  ))}
                </ul>
                <p className="waterfall-note">
                  {trace.spans.length} consultas en paralelo · {totalRows} filas ·{" "}
                  {formatStamp(trace.generatedAt)}
                  {demo ? " · datos DEMO, sin base de datos" : ""}
                </p>
              </div>
              <div className="sg-panel">
                <h3 className="sg-sub sg-mono">Tu visita · navegador</h3>
                <VisitWaterfall />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="sg-footer sg-mono">
        <span>
          {fullName ? `${fullName} · ` : ""}foreverlcd.dev
        </span>
        <span>Compilada {formatStamp(trace.generatedAt)}</span>
        <span>Next.js · Three.js · Anime.js</span>
      </footer>

      <SignalDirector />
    </div>
  );
}
