import NextLink from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "./utils";

export type LinkProps = {
  href: string;
  external?: boolean;
  tone?: "default" | "muted";
  showExternalIcon?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

export function Link({
  href,
  external,
  tone = "default",
  showExternalIcon = true,
  className,
  children,
  target,
  rel,
  ...props
}: LinkProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);

  const classes = cn(
    "underline decoration-graphite-400 decoration-1 underline-offset-[3px] transition-colors duration-fast ease-standard hover:decoration-[var(--accent-graphic)] hover:decoration-2",
    tone === "muted" && "text-fg-muted hover:text-fg",
    className,
  );

  const content = (
    <>
      {children}
      {isExternal && showExternalIcon ? (
        <span
          aria-hidden="true"
          className="ml-1 inline-block font-mono text-[0.9em] leading-none"
        >
          ↗
        </span>
      ) : null}
      {isExternal ? (
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      ) : null}
    </>
  );

  if (href.startsWith("/") && !isExternal) {
    return (
      <NextLink href={href} className={classes} {...props}>
        {content}
      </NextLink>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      target={isExternal ? "_blank" : target}
      rel={isExternal ? "noreferrer noopener" : rel}
      {...props}
    >
      {content}
    </a>
  );
}
