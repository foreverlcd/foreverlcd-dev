import type { ReactNode } from "react";

type PageHeaderProps = { index: string; label: string; title: string; actions?: ReactNode };

/** Mono eyebrow (`02 — REDES`) above an Unbounded H1, with optional actions on the right. */
export function PageHeader({ index, label, title, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
          {index} — {label}
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      </div>
      {actions}
    </header>
  );
}
