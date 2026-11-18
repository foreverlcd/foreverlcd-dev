type BadgeProps = { children: string; tone?: "signal" | "muted" | "coral" };

const tones = {
  signal: "border-accent-text text-accent-text",
  muted: "border-rule text-fg-muted",
  coral: "border-status-danger text-status-danger",
};

const base =
  "block whitespace-nowrap rounded-[2px] border px-2 py-0.5 font-mono " +
  "text-[0.6875rem] uppercase tracking-widest";

/** Mono status badge: PUBLICADO, BORRADOR, ACTIVO, OCULTO, DESTACADO. */
export function Badge({ children, tone = "muted" }: BadgeProps) {
  const text = children.toUpperCase();
  // Explicit min width: Chromium kept a stale intrinsic width for this flex item after the mono font swapped in.
  const minWidth = `calc(${text.length}ch + ${text.length * 0.1}em + 18px)`;
  return (
    <span className="shrink-0" style={{ minWidth, display: "inline-block" }}>
      <span className={`${base} ${tones[tone]}`}>{text}</span>
    </span>
  );
}
