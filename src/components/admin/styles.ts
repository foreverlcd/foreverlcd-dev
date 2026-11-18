export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text";

const mono = "font-mono text-xs uppercase tracking-widest";

export const inputClass =
  `min-h-10 rounded-[2px] border border-rule bg-surface-deep p-2 font-sans text-sm normal-case ` +
  `tracking-normal text-fg placeholder:text-fg-muted ` +
  `focus-visible:border-accent-text ${focusRing}`;
export const primaryButtonClass =
  `inline-flex min-h-10 w-fit items-center rounded-[2px] bg-accent-text px-5 py-2 ${mono} font-medium ` +
  `text-[#050507] hover:bg-fg disabled:opacity-50 ${focusRing}`;
export const secondaryButtonClass =
  `inline-flex min-h-10 w-fit items-center rounded-[2px] border border-rule px-3 py-1 ${mono} ` +
  `text-fg hover:border-fg-muted disabled:opacity-40 ${focusRing}`;
export const dangerButtonClass =
  `inline-flex min-h-10 w-fit items-center rounded-[2px] border border-status-danger px-3 py-1 ${mono} ` +
  `text-status-danger hover:bg-status-danger hover:text-[#050507] disabled:opacity-50 ${focusRing}`;
export const linkClass = `text-accent-text underline underline-offset-4 ${focusRing}`;
export const panelClass = "rounded-[2px] border border-rule bg-surface-raised p-4";
export const formPanelClass = "rounded-[2px] border border-rule bg-surface-deep p-5";
export const emptyStateClass =
  "mt-4 rounded-[2px] border border-dashed border-rule p-5 text-fg-muted";
export const monoLabelClass = `${mono} text-fg-muted`;
export const h2Class = "font-display text-lg font-bold tracking-tight";
