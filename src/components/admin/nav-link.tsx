"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRing } from "./styles";

type NavLinkProps = { href: string; index: string; label: string };

/** Numbered mono nav item; the active one gets a signal rule on the left. */
export function NavLink({ href, index, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "flex min-h-11 shrink-0 items-center gap-2 border-l-2 px-3 font-mono text-xs uppercase " +
        `tracking-widest hover:bg-surface-raised ${focusRing} ` +
        (active ? "border-accent-text text-accent-text" : "border-transparent text-fg-muted hover:text-fg")
      }
    >
      <span className={active ? "" : "text-fg-disabled"}>{index}</span>
      {label}
    </Link>
  );
}
