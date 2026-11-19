"use client";

import { useEffect, useState } from "react";

import { signalBus } from "./bus";
import { useVisitTiming } from "./visit-timing";

/**
 * Registro de arranque de la portada. Las líneas del servidor llegan en el
 * HTML; el navegador añade las suyas (tu visita, la GPU) cuando las conoce.
 */
export function TraceLog({ lines }: { lines: string[] }) {
  const [status, setStatus] = useState<string[]>([]);
  const timing = useVisitTiming();

  useEffect(
    () =>
      signalBus.subscribe((event) => {
        if (event.type === "status") {
          setStatus((previous) => (previous.includes(event.line) ? previous : [...previous, event.line]));
        }
      }, true),
    [],
  );

  const visit = timing
    ? `visita: ttfb ${timing.ttfb} ms · ${timing.protocol ?? "http"}${timing.transferKb ? ` · ${timing.transferKb} kB` : ""}`
    : null;

  return (
    <ol className="trace-log" data-kinetic="log" aria-label="Registro de compilación">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
      {visit ? <li className="trace-log__client">{visit}</li> : null}
      {status.map((line) => (
        <li key={line} className="trace-log__client">
          {line}
        </li>
      ))}
    </ol>
  );
}
