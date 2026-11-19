"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Horizontal nav that fades at the right edge and centers the active link on load. */
export function MobileNav({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current]");
    if (!nav || !active) return;
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, []);

  return (
    <nav
      ref={ref}
      aria-label="Administración"
      className="flex overflow-x-auto border-t border-rule [mask-image:linear-gradient(to_right,#000_calc(100%-40px),transparent)]"
    >
      {children}
    </nav>
  );
}
