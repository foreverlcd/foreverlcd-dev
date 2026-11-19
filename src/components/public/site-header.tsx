import Link from "next/link";

const LINKS = [
  { href: "/proyectos", label: "Proyectos" },
  { href: "/#stack", label: "Stack" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-(--line) px-(--pad) pt-[env(safe-area-inset-top)]">
      <a
        href="#principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-(--bg) focus:px-3 focus:py-2 focus:font-mono focus:text-xs"
      >
        Saltar al contenido
      </a>
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-(--ink) hover:text-(--signal)"
        >
          foreverlcd.dev
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
