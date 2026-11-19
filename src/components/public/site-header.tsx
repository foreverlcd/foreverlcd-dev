import Link from "next/link";

import { initialsOf } from "@/components/signal/format";

const LINKS = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/#stack", label: "Stack" },
  { href: "/#contacto", label: "Contacto" },
];

/** Misma marca que el HUD de la portada: iniciales con el cuadrado de señal y el nombre en mono. */
export function SiteHeader({ fullName }: { fullName: string }) {
  const name = fullName.trim();
  return (
    <header className="sg-site-header pt-[env(safe-area-inset-top)]">
      <a
        href="#principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-(--bg) focus:px-3 focus:py-2 focus:font-mono focus:text-xs"
      >
        Saltar al contenido
      </a>
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-(--pad)">
        <Link href="/" className="sg-brand" aria-label={`Inicio — ${name || "foreverlcd.dev"}`}>
          <span>
            <i aria-hidden="true" />
            {name ? initialsOf(name) : "foreverlcd"}
          </span>
          <span className="sg-brand-id">{name ? name.toUpperCase() : ".DEV"}</span>
        </Link>
        <ul className="flex flex-wrap items-center gap-x-5">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-(--ash) hover:text-(--signal)"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
