import type { ReactNode } from "react";

type PageHeaderProps = {
  index: string;
  label: string;
  title: string;
  actions?: ReactNode;
  /** Extra state shown in the HUD status line, e.g. "PORTFOLIO SIN PUBLICAR". */
  state?: string;
};

const TOTAL = "07";
const ruler =
  "repeating-linear-gradient(to right, var(--ash) 0 1px, transparent 1px 10px), " +
  "repeating-linear-gradient(to right, var(--ash) 0 1px, transparent 1px 50px)";

/** HUD header: X ruler, mono status line, mono eyebrow (`02 — REDES`) above an Unbounded H1. */
export function PageHeader({ index, label, title, actions, state }: PageHeaderProps) {
  const status = ["ESTADO", state, `SEC ${index}/${TOTAL}`].filter(Boolean).join(" · ");
  return (
    <header className="mb-8">
      <div aria-hidden className="relative h-2 border-t border-rule">
        <div
          className="absolute inset-x-0 top-0 h-full opacity-60"
          style={{ backgroundImage: ruler, backgroundSize: "100% 4px, 100% 8px", backgroundRepeat: "no-repeat" }}
        />
      </div>
      <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-widest text-fg-muted">{status}</p>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
            {index} — {label}
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        </div>
        {actions}
      </div>
    </header>
  );
}
