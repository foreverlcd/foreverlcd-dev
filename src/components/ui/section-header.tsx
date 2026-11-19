import type { ReactNode } from "react";
import { cn } from "./utils";

export type SectionHeaderProps = {
  index: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
};

export function SectionHeader({
  index,
  title,
  intro,
  action,
  id,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("border-t border-rule pt-6", className)}>
      <div className="grid grid-cols-4 gap-gutter md:grid-cols-8 lg:grid-cols-12">
        <div className="col-span-1 flex items-start gap-2">
          <span
            aria-hidden="true"
            className="mt-0.5 block h-6 w-0.5 bg-[var(--accent-graphic)]"
          />
          <span className="font-mono text-2xs font-medium tracking-[0.12em] text-[var(--accent-text)]">
            {index}
          </span>
        </div>

        <div className="col-span-3 md:col-span-4 lg:col-span-6">
          <h2 id={id} className="font-display text-h2">
            {title}
          </h2>
        </div>

        {intro || action ? (
          <div className="col-span-4 mt-4 md:col-span-3 md:mt-0 lg:col-span-5 lg:col-start-8">
            {intro ? (
              <div className="font-display text-lead text-fg-muted">{intro}</div>
            ) : null}
            {action ? <div className="mt-4">{action}</div> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
