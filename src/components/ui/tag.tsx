import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./utils";

export type TagTone = "default" | "signal";
export type TagProps = ComponentPropsWithoutRef<"span"> & {
  tone?: TagTone;
};

export function Tag({ tone = "default", className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-control border px-2 py-0.5 font-mono text-2xs font-medium uppercase leading-none tracking-[0.08em]",
        tone === "signal"
          ? "border-[var(--accent-graphic)] text-[var(--accent-text)]"
          : "border-rule text-fg-strong",
        className,
      )}
      {...props}
    />
  );
}
