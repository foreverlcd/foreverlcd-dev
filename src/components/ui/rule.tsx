import { cn } from "./utils";

export type RuleTone = "default" | "strong" | "signal";
export type RuleProps = {
  orientation?: "horizontal" | "vertical";
  tone?: RuleTone;
  className?: string;
};

const horizontalToneClasses: Record<RuleTone, string> = {
  default: "border-t border-rule",
  strong: "border-t-2 border-[var(--border-strong)]",
  signal: "border-t-2 border-[var(--accent-graphic)]",
};

const verticalToneClasses: Record<RuleTone, string> = {
  default: "w-px bg-rule",
  strong: "w-0.5 bg-[var(--border-strong)]",
  signal: "w-0.5 bg-[var(--accent-graphic)]",
};

export function Rule({
  orientation = "horizontal",
  tone = "default",
  className,
}: RuleProps) {
  if (orientation === "vertical") {
    return (
      <span
        aria-hidden="true"
        className={cn("block self-stretch", verticalToneClasses[tone], className)}
      />
    );
  }

  return (
    <hr
      aria-hidden="true"
      className={cn("border-0", horizontalToneClasses[tone], className)}
    />
  );
}
