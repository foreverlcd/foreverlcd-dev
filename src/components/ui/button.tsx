import NextLink from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowUpRightIcon } from "./icons";
import { cn } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  block?: boolean;
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--control-strong-bg)] text-[var(--control-strong-fg)] hover:bg-[var(--control-strong-hover-bg)] hover:text-[var(--control-strong-hover-fg)]",
  secondary:
    "border border-[var(--border-strong)] text-fg hover:border-[var(--accent-graphic)] hover:text-[var(--accent-text)]",
  quiet:
    "text-fg underline decoration-graphite-400 decoration-1 underline-offset-[3px] hover:text-[var(--accent-text)] hover:decoration-[var(--accent-graphic)] hover:decoration-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "relative h-9 px-4 text-sm before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-sm",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}): string {
  return cn(
    "group inline-flex items-center justify-center gap-2.5 rounded-control font-sans font-semibold leading-none transition-colors duration-fast ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "active:translate-y-px",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-raised disabled:text-fg-disabled",
    "disabled:hover:border-transparent disabled:hover:bg-surface-raised disabled:hover:text-fg-disabled disabled:active:translate-y-0",
    variantClasses[variant],
    sizeClasses[size],
    block && "w-full",
    className,
  );
}

export type ButtonProps = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({
  variant,
  size,
  icon,
  iconPosition = "end",
  block,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, block, className })}
      {...props}
    >
      {icon && iconPosition === "start" ? (
        <span
          aria-hidden="true"
          className="inline-flex transition-transform duration-fast ease-standard group-hover:-translate-x-0.5"
        >
          {icon}
        </span>
      ) : null}
      {children}
      {icon && iconPosition === "end" ? (
        <span
          aria-hidden="true"
          className="inline-flex transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
        >
          {icon}
        </span>
      ) : null}
    </button>
  );
}

export type ButtonLinkProps = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href"> & {
    href: string;
    external?: boolean;
  };

export function ButtonLink({
  variant,
  size,
  icon,
  iconPosition = "end",
  block,
  className,
  children,
  href,
  external,
  target,
  rel,
  ...props
}: ButtonLinkProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const resolvedIcon = icon ?? (isExternal ? <ArrowUpRightIcon /> : undefined);
  const classes = buttonStyles({ variant, size, block, className });

  const content = (
    <>
      {resolvedIcon && iconPosition === "start" ? (
        <span
          aria-hidden="true"
          className="inline-flex transition-transform duration-fast ease-standard group-hover:-translate-x-0.5"
        >
          {resolvedIcon}
        </span>
      ) : null}
      {children}
      {isExternal ? (
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      ) : null}
      {resolvedIcon && iconPosition === "end" ? (
        <span
          aria-hidden="true"
          className="inline-flex transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
        >
          {resolvedIcon}
        </span>
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
