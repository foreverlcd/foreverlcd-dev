import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./utils";

type PlateSrc = ComponentProps<typeof Image>["src"];

export type PlateRatio = "16/10" | "4/3" | "4/5" | "1/1";

const ratioClasses: Record<PlateRatio, string> = {
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
};

export type PlateProps = {
  src?: PlateSrc | null;
  alt?: string;
  ratio?: PlateRatio;
  caption?: ReactNode;
  index?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  emptyLabel?: string;
};

export function Plate({
  src,
  alt = "",
  ratio = "16/10",
  caption,
  index,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  className,
  emptyLabel = "IMAGEN PENDIENTE",
}: PlateProps) {
  return (
    <figure className={cn("m-0", className)}>
      <div
        className={cn(
          "relative overflow-hidden border border-rule bg-surface-raised",
          ratioClasses[ratio],
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--rule) 1px, transparent 1px), linear-gradient(to bottom, var(--rule) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              {index ? (
                <span className="font-display text-4xl leading-none text-fg-muted">
                  {index}
                </span>
              ) : null}
              <span className="font-mono text-2xs font-medium uppercase tracking-[0.12em] text-fg-muted">
                {emptyLabel}
              </span>
            </div>
          </>
        )}
      </div>

      {caption ? (
        <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-2 font-mono text-2xs uppercase tracking-[0.08em] text-fg-muted">
          {index ? <span>FIG. {index}</span> : null}
          {index && caption ? <span aria-hidden="true">—</span> : null}
          <span>{caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
