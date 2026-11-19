"use client";

import { useState, type ReactNode } from "react";

type Item = { slug: string; skillSlugs: string[]; card: ReactNode };
type Props = { skills: { slug: string; name: string }[]; items: Item[] };

/** Sin JS el servidor ya pintó todos los proyectos; con JS los botones filtran por skill. */
export function ProjectFilter({ skills, items }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? items.filter((item) => item.skillSlugs.includes(active)) : items;
  const button = "inline-flex min-h-11 items-center border px-4 font-mono text-xs uppercase tracking-wider transition-colors";
  const on = "border-(--signal) text-(--signal)";
  const off = "border-(--line) text-(--ash) hover:text-(--ink)";

  return (
    <>
      {skills.length > 0 && (
        <div role="group" aria-label="Filtrar por tecnología" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={active === null} onClick={() => setActive(null)} className={`${button} ${active === null ? on : off}`}>
            Todos ({items.length})
          </button>
          {skills.map((skill) => (
            <button
              key={skill.slug}
              type="button"
              aria-pressed={active === skill.slug}
              onClick={() => setActive(active === skill.slug ? null : skill.slug)}
              className={`${button} ${active === skill.slug ? on : off}`}
            >
              {skill.name}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visible.map((item) => (
          <li key={item.slug}>{item.card}</li>
        ))}
      </ul>
    </>
  );
}
