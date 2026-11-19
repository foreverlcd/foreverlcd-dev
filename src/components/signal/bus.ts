/**
 * Canal mínimo entre el DOM (Anime.js, interacción) y la escena WebGL.
 * Sin estado global de React: la escena vive fuera del ciclo de render.
 *
 * - Eventos discretos (sección activa, proyecto activo, líneas de estado): `signalBus`.
 * - Atmósfera continua: un único objeto mutable que el director interpola con
 *   Anime.js y que la escena lee en cada frame (sin asignaciones por frame).
 */

export type SignalEvent =
  | { type: "section"; index: number }
  | { type: "project"; index: number | null }
  | { type: "status"; line: string };

type Listener = (event: SignalEvent) => void;

const listeners = new Set<Listener>();
const history: SignalEvent[] = [];

/** Última sección y proyecto activos: una escena que llega tarde parte de aquí. */
export const signalState: { section: number; project: number | null } = {
  section: 0,
  project: null,
};

export const signalBus = {
  emit(event: SignalEvent) {
    if (event.type === "status") history.push(event);
    if (event.type === "section") signalState.section = event.index;
    if (event.type === "project") signalState.project = event.index;
    listeners.forEach((listener) => listener(event));
  },
  /** Los suscriptores tardíos reciben las líneas de estado ya emitidas. */
  subscribe(listener: Listener, replay = false) {
    listeners.add(listener);
    if (replay) history.forEach(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Atmósfera de una sección: tinte, niebla, haces, cámara y campo de partículas. */
export type Atmosphere = {
  tintR: number;
  tintG: number;
  tintB: number;
  fog: number;
  beam: number;
  dens: number;
  blk: number;
  cross: number;
  warm: number;
  lamp: number;
  yaw: number;
  pitch: number;
  roll: number;
  z: number;
  angle: number;
  curl: number;
  speed: number;
  gain: number;
  acid: number;
};

/** Valores iniciales: los de la sección de portada. */
export const atmosphere: Atmosphere = {
  tintR: 0.03,
  tintG: 0.026,
  tintB: 0.065,
  fog: 0.03,
  beam: 0.3,
  dens: 0.55,
  blk: 0.58,
  cross: 0.38,
  warm: 0.06,
  lamp: 1,
  yaw: 0,
  pitch: 0,
  roll: 0,
  z: 14,
  angle: 0,
  curl: 1.2,
  speed: 3.2,
  gain: 1,
  acid: 0,
};

/* Lectura del instrumento que la escena entrega al HUD. */
export type SceneState = "assembling" | "locked" | "flow" | "static";

/** Lectura del instrumento, reutilizada en cada frame (el HUD la copia al DOM). */
export type SceneFrame = {
  pointerX: number;
  pointerY: number;
  worldX: number;
  worldY: number;
  fps: number;
  flow: number;
  scrollProgress: number;
  pointerOn: number;
  /** Diámetro del retículo, en px. */
  reticle: number;
  state: SceneState;
};

export type SceneInfo = { tier: string; particles: number; sim: string; dpr: number };

export type MotionPreference = "full" | "reduced" | "reading";

const READING_KEY = "foreverlcd:reading";

export function readMotionPreference(): MotionPreference {
  if (typeof window === "undefined") return "reduced";
  // El almacenamiento se consulta también: el atributo puede no estar aún aplicado.
  if (document.documentElement.dataset.reading === "on" || readStoredReadingMode()) {
    return "reading";
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  return "full";
}

export function readStoredReadingMode() {
  try {
    return window.localStorage.getItem(READING_KEY) === "on";
  } catch {
    return false;
  }
}

export function storeReadingMode(on: boolean) {
  try {
    window.localStorage.setItem(READING_KEY, on ? "on" : "off");
  } catch {
    // Almacenamiento bloqueado: el modo solo dura esta visita.
  }
}
