"use client";

import { useVisitTiming } from "./visit-timing";

/** Diagrama de cascada de la visita actual, en DOM accesible. */
export function VisitWaterfall() {
  const timing = useVisitTiming();

  if (!timing) {
    return <p className="waterfall-empty">Midiendo tu visita…</p>;
  }

  const end = Math.max(1, ...timing.phases.map((p) => p.start + p.duration));

  return (
    <div>
      <ul className="waterfall" aria-label="Fases de tu visita">
        {timing.phases.map((phase) => (
          <li key={phase.name} className="waterfall__row">
            <span className="waterfall__label">{phase.label}</span>
            <span className="waterfall__track" aria-hidden="true">
              <span
                className="waterfall__bar waterfall__bar--visit"
                style={{
                  left: `${(phase.start / end) * 100}%`,
                  width: `max(2px, ${(phase.duration / end) * 100}%)`,
                }}
              />
            </span>
            <span className="waterfall__value">{phase.duration} ms</span>
          </li>
        ))}
      </ul>
      <p className="waterfall-note">
        Primer byte en {timing.ttfb} ms{timing.protocol ? ` por ${timing.protocol}` : ""}
        {timing.transferKb ? ` · ${timing.transferKb} kB transferidos` : " · servido desde caché"}.
      </p>
    </div>
  );
}
