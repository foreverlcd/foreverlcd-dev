import Image from "next/image";
import type { ReactNode } from "react";

import type { PublishedProfile } from "@/server/portfolio/load-portfolio";

import { PLATFORM_LABEL } from "../format";

type Props = { profile: PublishedProfile; email: string | null; kicker: ReactNode };

const norm = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

/** Etiqueta de plataforma, omitida si repite el `label` (sin distinguir mayúsculas ni acentos). */
function platformText(link: { label: string; platform: string }) {
  const name = PLATFORM_LABEL[link.platform] ?? link.platform;
  return norm(name) === norm(link.label) || norm(link.platform) === norm(link.label) ? null : name;
}

const PHOTO = { width: 480, height: 600 };

/** #sobre-mi: retrato en marco HUD, biografía completa, ubicación, correo y redes activas. */
export function AboutSection({ profile, email, kicker }: Props) {
  const paragraphs = profile.biography
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const socials = profile.socialLinks;

  return (
    <section id="sobre-mi" className="sg-sec" data-section="sobre-mi" aria-labelledby="sobre-mi-title">
      <div className="sg-col">
        {kicker}
        <h2 id="sobre-mi-title" data-split>
          Sobre mí
        </h2>
        <div className="sg-about">
          {profile.photoUrl ? (
            <figure className="sg-frame" data-rv>
              <div className="sg-frame-box">
                <Image
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  width={PHOTO.width}
                  height={PHOTO.height}
                  sizes="(max-width: 760px) 60vw, (max-width: 1024px) 26vw, 280px"
                  className="sg-frame-img"
                />
                <i className="sg-frame-c sg-frame-c--tl" aria-hidden="true" />
                <i className="sg-frame-c sg-frame-c--br" aria-hidden="true" />
              </div>
              <figcaption className="sg-frame-cap sg-mono" aria-hidden="true">
                <span>RET-01</span>
                <span>
                  {PHOTO.width}×{PHOTO.height}
                </span>
              </figcaption>
            </figure>
          ) : null}
          <div className="sg-about-text">
            <div className="sg-bio-full" data-rv>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <dl className="sg-facts sg-mono" data-rv>
              {profile.location ? (
                <div>
                  <dt>Ubicación</dt>
                  <dd>{profile.location}</dd>
                </div>
              ) : null}
              {email ? (
                <div>
                  <dt>Correo</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                </div>
              ) : null}
            </dl>
            {socials.length ? (
              <ul className="sg-socials sg-mono" aria-label="Redes" data-rv>
                {socials.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                      {platformText(link) ? <span className="sg-plat"> · {platformText(link)}</span> : null} ↗
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
