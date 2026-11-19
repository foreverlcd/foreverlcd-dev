import type { CSSProperties } from "react";

import { projectInitials } from "./project-initials";

/** Color de señal por proyecto: signal → uv → coral, según el orden del índice. */
export const SIGNAL_CYCLE = [
  { sig: "var(--signal)", text: "var(--signal)" },
  { sig: "var(--uv)", text: "var(--uv-text)" },
  { sig: "var(--coral)", text: "var(--coral)" },
];

type Props = {
  title: string;
  /** Posición del proyecto en el índice (base 0): fija el color y el pie `RET · P<n>`. */
  index: number;
  /** Ficha: ancho completo 16/6. */
  wide?: boolean;
  className?: string;
};

/** Placa de proyecto sin portada: siglas sobre halo de señal, retícula y pie mono. Decorativa (el título ya está en el texto). */
export function ProjectPlate({ title, index, wide = false, className = "" }: Props) {
  const color = SIGNAL_CYCLE[index % SIGNAL_CYCLE.length];
  return (
    <div
      className={`sg-plate${wide ? " sg-plate--wide" : ""} ${className}`.trim()}
      style={{ "--sig": color.sig, "--sig-text": color.text } as CSSProperties}
      aria-hidden="true"
    >
      <span className="sg-plate-ini">{projectInitials(title)}</span>
      <i className="sg-plate-c sg-plate-c--tl" />
      <i className="sg-plate-c sg-plate-c--tr" />
      <i className="sg-plate-c sg-plate-c--bl" />
      <i className="sg-plate-c sg-plate-c--br" />
      <span className="sg-plate-foot sg-mono">RET · P{index + 1}</span>
    </div>
  );
}
