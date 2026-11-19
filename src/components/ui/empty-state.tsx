import type { ReactNode } from "react";
import { cn } from "./utils";

export type EmptyStateProps = {
  index?: string;
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  index,
  label = "ARCHIVO",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const hasMeta = Boolean(index || label);

  return (
    <div className={cn("border border-dashed border-rule p-10", className)}>
      {hasMeta ? (
        <p className="font-mono text-2xs font-medium uppercase tracking-[0.12em] text-[var(--accent-text)]">
          {index ? <span>{index}</span> : null}
          {index && label ? <span aria-hidden="true"> / </span> : null}
          {label ? <span>{label}</span> : null}
        </p>
      ) : null}

      <p className="mt-4 max-w-text font-display text-2xl leading-tight text-fg">
        {title}
      </p>

      {description ? (
        <p className="mt-2 max-w-text text-sm text-fg-muted">{description}</p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
