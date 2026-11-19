import type { ReactNode } from "react";

import { SkillChip } from "@/components/public/skill-chip";
import type { SkillCategory } from "@/server/portfolio/load-portfolio";

/** #stack: categorías con su descripción y skills (icono + enlace a /stack/[slug]). */
export function StackSection({ categories, kicker }: { categories: SkillCategory[]; kicker: ReactNode }) {
  return (
    <section id="stack" className="sg-sec" data-section="stack" aria-labelledby="stack-title">
      <div className="sg-col">
        {kicker}
        <h2 id="stack-title" data-split>
          Stack
        </h2>
        <div className="sg-stack">
          {categories.map((category) => (
            <div key={category.id} className="sg-stack-group" data-rv>
              <h3 className="sg-sub sg-mono">{category.name}</h3>
              {category.description ? <p className="sg-stack-desc">{category.description}</p> : null}
              <ul>
                {category.skills.map((s) => (
                  <li key={s.id}>
                    <SkillChip skill={s} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
