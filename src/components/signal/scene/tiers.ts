/**
 * Niveles de calidad de la escena (docs/ART-DIRECTION.md, "Todos los dispositivos").
 *
 * - T2 escritorio: sim 256², DPR ≤ 1.75, estructura + haces, estela.
 * - T1 móvil/tableta: sim 128², DPR ≤ 1.5, solo niebla y tinte, sin estela.
 * - T0 estático: sin canvas (el HTML y el CSS lo cubren todo).
 */

export type Tier = "T2" | "T1" | "T0";
export type ActiveTier = Exclude<Tier, "T0">;

export type TierConfig = {
  /** Lado de la textura de simulación: partículas = size². */
  simSize: number;
  maxDpr: number;
  /** Capa de estructura (raymarching a baja resolución). Solo T2. */
  structure: boolean;
  /** Estela del puntero. */
  trail: boolean;
};

export const TIERS: Record<ActiveTier, TierConfig> = {
  T2: { simSize: 256, maxDpr: 1.75, structure: true, trail: true },
  T1: { simSize: 128, maxDpr: 1.5, structure: false, trail: false },
};

/** Resolución relativa de la pasada de estructura (presupuesto: ≤ 0.5). */
export const STRUCTURE_SCALE = 0.5;

export type TierDecision = { tier: Tier; reason: string };

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** WebGL2 con texturas flotantes renderizables: lo mínimo para la simulación GPGPU. */
function supportsFloatWebGL2() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) return false;
    const floats = Boolean(gl.getExtension("EXT_color_buffer_float"));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return floats;
  } catch {
    return false;
  }
}

/** `?tier=t1|t0` fuerza un nivel igual o inferior; sirve para revisar cada nivel. */
function forcedTier(): Tier | null {
  const value = new URLSearchParams(window.location.search).get("tier");
  if (value === "t2") return "T2";
  if (value === "t1") return "T1";
  if (value === "t0") return "T0";
  return null;
}

/** Detección inicial. El modo lectura se decide fuera (bus.ts). */
export function detectTier(): TierDecision {
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return { tier: "T0", reason: "save-data" };
  if (!supportsFloatWebGL2()) return { tier: "T0", reason: "webgl2 no disponible" };

  const forced = forcedTier();
  if (forced === "T0") return { tier: "T0", reason: "forzado" };

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth <= 1024;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const modest = coarse || narrow || cores <= 4 || memory <= 4;

  if (forced === "T1" || modest) return { tier: "T1", reason: forced ? "forzado" : "dispositivo" };
  return { tier: "T2", reason: "escritorio" };
}

/** Frame medio máximo (ms) antes de bajar de nivel. T1→T0 equivale a < 24 fps. */
const DEGRADE_ABOVE_MS: Record<ActiveTier, number> = { T2: 22, T1: 1000 / 24 };
const WARMUP_MS = 700;
const WINDOW_MS = 2000;

/**
 * Degradación adaptativa: si el frame medio supera el límite durante 2 s,
 * baja un nivel sin recargar (T2→T1→T0). Nunca vuelve a subir en la visita.
 */
export function createFrameGovernor(start: ActiveTier, onDegrade: (next: Tier) => void) {
  let tier: ActiveTier = start;
  let elapsed = 0;
  let sum = 0;
  let count = 0;

  const reset = () => {
    elapsed = 0;
    sum = 0;
    count = 0;
  };

  return {
    /** Registra la duración de un frame, en ms. */
    sample(frameMs: number) {
      elapsed += frameMs;
      // La compilación de shaders y la primera subida de texturas no cuentan.
      if (elapsed < WARMUP_MS) return;
      sum += frameMs;
      count++;
      if (elapsed - WARMUP_MS < WINDOW_MS) return;

      const average = sum / count;
      reset();
      if (average <= DEGRADE_ABOVE_MS[tier]) {
        elapsed = WARMUP_MS; // ventana deslizante: sin repetir el calentamiento
        return;
      }
      const next: Tier = tier === "T2" ? "T1" : "T0";
      if (next !== "T0") tier = next;
      onDegrade(next);
    },
    /** Tras una pausa (pestaña oculta, escena fuera de vista) hay que medir de nuevo. */
    reset,
  };
}
