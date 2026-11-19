import type { ReactNode } from "react";

import type { ActiveEducation, ActiveExperience } from "@/server/portfolio/load-portfolio";

import { EDUCATION_LABEL, EMPLOYMENT_LABEL, formatRange } from "../format";

type Props = { experiences: ActiveExperience[]; education: ActiveEducation[]; kicker: ReactNode };

const join = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

/** #trayectoria: experiencia y formación sin separadores huérfanos. */
export function PathSection({ experiences, education, kicker }: Props) {
  return (
    <section id="trayectoria" className="sg-sec" data-section="trayectoria" aria-labelledby="trayectoria-title">
      <div className="sg-col">
        {kicker}
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
                    {join([
                      item.company,
                      item.employmentType !== "OTHER" &&
                        (EMPLOYMENT_LABEL[item.employmentType] ?? item.employmentType),
                      item.location,
                    ])}
                  </p>
                  {item.description ? <p>{item.description}</p> : null}
                </li>
              ))}
            </ol>
          </>
        ) : null}
        {education.length ? (
          <>
            <h3 className="sg-sub sg-mono">Formación</h3>
            <ol className="sg-tl">
              {education.map((item) => {
                const field = item.fieldOfStudy?.trim();
                const showField = field && field.toLowerCase() !== item.degree.trim().toLowerCase();
                return (
                  <li key={item.id} data-rv>
                    <span className="sg-yr sg-mono">
                      {formatRange(item.startDate, item.endDate, item.isCurrent)}
                    </span>
                    <h4>{item.degree}</h4>
                    <p className="sg-org">
                      {join([item.institution, EDUCATION_LABEL[item.type] ?? item.type, item.location])}
                    </p>
                    {showField ? <p>{field}</p> : null}
                    {item.description ? <p>{item.description}</p> : null}
                    {item.credentialUrl ? (
                      <a className="sg-inline" href={item.credentialUrl} target="_blank" rel="noreferrer">
                        Ver credencial ↗
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </>
        ) : null}
      </div>
    </section>
  );
}
