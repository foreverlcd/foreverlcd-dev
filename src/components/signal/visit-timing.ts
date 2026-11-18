"use client";

import { useEffect, useState } from "react";

export type VisitPhase = { name: string; label: string; start: number; duration: number };

export type VisitTiming = {
  phases: VisitPhase[];
  ttfb: number;
  total: number;
  protocol: string | null;
  transferKb: number | null;
};

const round = (n: number) => Math.max(0, Math.round(n));

/**
 * Lee la Navigation Timing API de esta visita concreta.
 * Es una medición real del navegador: no hay servidor ni coste implicado.
 */
function readVisitTiming(): VisitTiming | null {
  const [nav] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (!nav || nav.responseEnd === 0) return null;

  const phases: VisitPhase[] = [
    { name: "dns", label: "Resolución DNS", start: nav.domainLookupStart, duration: nav.domainLookupEnd - nav.domainLookupStart },
    { name: "connect", label: "Conexión y TLS", start: nav.connectStart, duration: nav.connectEnd - nav.connectStart },
    { name: "request", label: "Espera de respuesta", start: nav.requestStart, duration: nav.responseStart - nav.requestStart },
    { name: "download", label: "Descarga del HTML", start: nav.responseStart, duration: nav.responseEnd - nav.responseStart },
    { name: "dom", label: "Construcción del DOM", start: nav.responseEnd, duration: nav.domInteractive - nav.responseEnd },
  ].map((p) => ({ ...p, start: round(p.start), duration: round(p.duration) }));

  return {
    phases,
    ttfb: round(nav.responseStart - nav.startTime),
    total: round((nav.loadEventEnd || nav.domContentLoadedEventEnd) - nav.startTime),
    protocol: nav.nextHopProtocol || null,
    transferKb: nav.transferSize ? Math.round(nav.transferSize / 102.4) / 10 : null,
  };
}

export function useVisitTiming() {
  const [timing, setTiming] = useState<VisitTiming | null>(null);

  useEffect(() => {
    let timer = 0;
    const read = () => {
      // loadEventEnd solo existe cuando el evento load ha terminado.
      timer = window.setTimeout(() => setTiming(readVisitTiming()), 0);
    };
    if (document.readyState === "complete") read();
    else window.addEventListener("load", read, { once: true });
    return () => {
      window.removeEventListener("load", read);
      window.clearTimeout(timer);
    };
  }, []);

  return timing;
}
