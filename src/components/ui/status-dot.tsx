import { cn } from "./utils";

export type Status = "success" | "warning" | "danger" | "info" | "neutral";

const dotClasses: Record<Status, string> = {
  success: "bg-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]",
  danger: "bg-[var(--status-danger)]",
  info: "bg-[var(--status-info)]",
  neutral: "bg-fg-muted",
};

export type StatusDotProps = {
  status: Status;
  label: string;
  className?: string;
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.08em] text-fg-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", dotClasses[status])}
      />
      {label}
    </span>
  );
}
