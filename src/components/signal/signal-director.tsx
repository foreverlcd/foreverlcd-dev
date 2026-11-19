"use client";

import { animate, scrambleText, splitText, stagger, utils } from "animejs";
import { useEffect, useState } from "react";

import { atmosphere, readMotionPreference, signalBus, type Atmosphere } from "./bus";

type Revertible = { revert: () => unknown };

/* ------------------------------------------------------------------ */
/* Atmósfera por sección (SEC de SIGNAL + claves de MEGASTRUCTURE)    */
/* ------------------------------------------------------------------ */

const BASE: Atmosphere = { ...atmosphere };

const SECTION_ATMOSPHERE: Record<string, Partial<Atmosphere>> = {
  inicio: {},
  "sobre-mi": {
    z: 14, angle: -0.2, curl: 0.9, gain: 0.95, acid: 0.02, roll: 0.02, speed: 3.2,
    dens: 0.38, blk: 0.5, cross: 0.4, beam: 0.24, fog: 0.024, warm: 0.06, lamp: 0.95,
    yaw: 0.04, pitch: 0.03, tintR: 0.03, tintG: 0.028, tintB: 0.072,
  },
  proyectos: {
    z: 11, angle: -0.62, curl: 1, gain: 1.1, acid: 0.12, roll: -0.05, speed: 3.8,
    dens: 0.92, blk: 0.88, cross: 0.3, beam: 0.42, fog: 0.048, warm: 0.14, lamp: 1.15,
    yaw: 0.1, pitch: 0.02, tintR: 0.034, tintG: 0.028, tintB: 0.08,
  },
  trayectoria: {
    z: 16, angle: 1.5708, curl: 0.8, gain: 0.9, acid: 0, roll: 0.06, speed: 3,
    dens: 0.28, blk: 0.46, cross: 0.55, beam: 0.22, fog: 0.02, warm: 0, lamp: 0.9,
    yaw: -0.08, pitch: 0.06, tintR: 0.026, tintG: 0.028, tintB: 0.075,
  },
  stack: {
    z: 13, angle: 2.3, curl: 1.1, gain: 1, acid: 0.06, roll: -0.02, speed: 3.4,
    dens: 0.45, blk: 0.52, cross: 0.45, beam: 0.26, fog: 0.026, warm: 0.04, lamp: 0.95,
    yaw: 0.05, pitch: 0.03, tintR: 0.028, tintG: 0.027, tintB: 0.07,
  },
  traza: {
    z: 12, angle: 2.8, curl: 1.4, gain: 1.05, acid: 0.18, roll: 0.03, speed: 3.6,
    dens: 0.7, blk: 0.7, cross: 0.34, beam: 0.4, fog: 0.038, warm: 0.1, lamp: 1.1,
    yaw: -0.04, pitch: 0, tintR: 0.032, tintG: 0.028, tintB: 0.07,
  },
  contacto: {
    z: 9, angle: 3.1416, curl: 1.7, gain: 1.15, acid: 0.3, roll: 0, speed: 4.2,
    dens: 0.6, blk: 0.7, cross: 0.34, beam: 0.3, fog: 0.05, warm: 0.1, lamp: 0.7,
    yaw: 0, pitch: 0, tintR: 0.062, tintG: 0.028, tintB: 0.05,
  },
};

const CAMERA_KEYS = ["z", "roll", "yaw", "pitch"] as const;

function atmosphereFor(id: string): Atmosphere {
  return { ...BASE, ...SECTION_ATMOSPHERE[id] };
}

/** Interpola la atmósfera compartida; la escena la lee en cada frame. */
function applyAtmosphere(id: string, cut: boolean, track: (a: Revertible) => void) {
  const next = atmosphereFor(id);
  if (cut) {
    Object.assign(atmosphere, next);
    return;
  }
  const camera: Partial<Atmosphere> = {};
  const field: Partial<Atmosphere> = {};
  for (const key of Object.keys(next) as (keyof Atmosphere)[]) {
    const bucket = (CAMERA_KEYS as readonly string[]).includes(key) ? camera : field;
    bucket[key] = next[key];
  }
  track(animate(atmosphere, { ...camera, duration: 1500, ease: "inOutQuart" }));
  track(animate(atmosphere, { ...field, duration: 1600, ease: "inOutQuad" }));
}

/* ------------------------------------------------------------------ */
/* Texto cinético                                                      */
/* ------------------------------------------------------------------ */

const inlineBlock = (nodes: HTMLElement[]) => nodes.forEach((n) => (n.style.display = "inline-block"));

function split(el: HTMLElement, track: (a: Revertible) => void) {
  const splitter = splitText(el, { words: true, chars: true });
  track(splitter);
  const chars = splitter.chars as HTMLElement[];
  inlineBlock(splitter.words as HTMLElement[]);
  inlineBlock(chars);
  return chars;
}

/** Revela el texto desde ruido. Restaura el texto original al terminar. */
function scramble(el: HTMLElement, delay: number, duration: number, track: (a: Revertible) => void) {
  const text = el.textContent ?? "";
  track(
    animate(el, {
      innerHTML: scrambleText({ chars: "A-Z0-9", revealRate: 40, text }),
      duration,
      delay,
      ease: "linear",
      onComplete: () => {
        el.textContent = text;
      },
    }),
  );
}

/**
 * Nombre en retrato (≤ 1024): el bloque no pasa de ~38 % (móvil) o ~34 % (tableta) del alto.
 * Si sobra espacio se estira en vertical (--stretch-want, máx. 1.85); si falta, se reduce (--fit).
 */
function fitName(root: HTMLElement) {
  const h1 = root.querySelector<HTMLElement>("#signal-name");
  if (!h1) return;
  h1.style.removeProperty("--fit");
  h1.style.removeProperty("--stretch-want");
  if (!window.matchMedia("(max-width: 1024px) and (orientation: portrait)").matches) return;
  const natural = h1.getBoundingClientRect().height;
  if (natural <= 0) return;
  const widest = Math.max(
    ...[...h1.querySelectorAll<HTMLElement>("[data-name-line]")].map(
      (ln) => ln.getBoundingClientRect().width,
    ),
  );
  // Ninguna línea puede pasar del 90 % del ancho, aunque el nombre tenga letras anchas.
  const widthFit = Math.min(1, (innerWidth * 0.9) / Math.max(widest, 1));
  const height = natural * widthFit;
  const max = innerHeight * (innerWidth <= 760 ? 0.38 : 0.34);
  if (height > max) {
    h1.style.setProperty("--fit", (widthFit * (max / height)).toFixed(3));
  } else {
    if (widthFit < 1) h1.style.setProperty("--fit", widthFit.toFixed(3));
    h1.style.setProperty("--stretch-want", Math.min(2.2, max / height).toFixed(3));
  }
}

/* ------------------------------------------------------------------ */
/* Director                                                            */
/* ------------------------------------------------------------------ */

/**
 * Coreógrafo (Anime.js). Entradas, atmósfera por sección, proyecto activo y texto cinético.
 * Habla con la escena solo por el bus y el objeto `atmosphere`.
 * - Movimiento reducido: cambios por corte, sin scramble ni cámara.
 * - Modo lectura: sin escena ni movimiento; solo mantiene el enlace activo del menú.
 */
export function SignalDirector() {
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const onReading = () => setGeneration((g) => g + 1);
    window.addEventListener("signal:reading", onReading);
    return () => window.removeEventListener("signal:reading", onReading);
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".signal");
    if (!root) return;
    const motion = readMotionPreference();
    const full = motion === "full";
    const cut = motion !== "full";

    const sections = [...root.querySelectorAll<HTMLElement>("[data-section]")];
    const navLinks = [...root.querySelectorAll<HTMLAnchorElement>("[data-nav]")];
    const rows = [...root.querySelectorAll<HTMLElement>("[data-project]")];

    fitName(root);
    const onResize = () => fitName(root);
    window.addEventListener("resize", onResize);

    const created: Revertible[] = [];
    const track = (a: Revertible) => void created.push(a);
    const disposers: (() => void)[] = [() => window.removeEventListener("resize", onResize)];
    const scrambled = new Map<HTMLElement, string>();
    const hidden: HTMLElement[] = [];

    /* ---------- sección activa ---------- */
    let activeSection = -1;
    const activate = (index: number) => {
      if (index === activeSection) return;
      activeSection = index;
      const id = sections[index]?.dataset.section ?? "";
      root.dataset.sec = id;
      navLinks.forEach((link) => {
        if (link.dataset.nav === id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (motion === "reading") return;
      signalBus.emit({ type: "section", index });
      applyAtmosphere(id, cut, track);
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activate(sections.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => sectionObserver.observe(s));
    disposers.push(() => sectionObserver.disconnect());

    /* ---------- proyecto activo (hover/foco con puntero; centrado en táctil) ---------- */
    const titleChars = rows.map((row) => {
      const title = row.querySelector<HTMLElement>("[data-title]");
      if (!title || !full) return [] as HTMLElement[];
      title.setAttribute("aria-label", title.textContent ?? "");
      return split(title, track);
    });

    let activeProject: number | null = null;
    let leaveTimer = 0;
    const setProject = (index: number | null) => {
      if (index === activeProject) return;
      activeProject = index;
      rows.forEach((row, i) => row.classList.toggle("is-active", i === index));
      signalBus.emit({ type: "project", index });
      if (index !== null && full) {
        track(
          animate(titleChars[index], {
            translateY: [{ to: -12, duration: 150 }, { to: 0, duration: 340 }],
            delay: stagger(16),
            ease: "outQuad",
          }),
        );
      }
    };
    const leave = (index: number) => {
      window.clearTimeout(leaveTimer);
      // Pequeña espera: pasar de un proyecto a otro no debe pasar por "ninguno".
      leaveTimer = window.setTimeout(() => {
        if (activeProject === index) setProject(null);
      }, 90);
    };

    if (motion !== "reading") {
      rows.forEach((row, i) => {
        const enter = () => {
          window.clearTimeout(leaveTimer);
          setProject(i);
        };
        const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && enter();
        const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && leave(i);
        const onFocusOut = (e: FocusEvent) => {
          if (!row.contains(e.relatedTarget as Node | null)) leave(i);
        };
        row.addEventListener("pointerenter", onEnter);
        row.addEventListener("pointerleave", onLeave);
        row.addEventListener("focusin", enter);
        row.addEventListener("focusout", onFocusOut);
        disposers.push(() => {
          row.removeEventListener("pointerenter", onEnter);
          row.removeEventListener("pointerleave", onLeave);
          row.removeEventListener("focusin", enter);
          row.removeEventListener("focusout", onFocusOut);
        });
      });

      if (window.matchMedia("(pointer: coarse)").matches) {
        const centered = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const i = rows.indexOf(entry.target as HTMLElement);
              if (entry.isIntersecting) setProject(i);
              else if (activeProject === i) setProject(null);
            }
          },
          { rootMargin: "-42% 0px -42% 0px" },
        );
        rows.forEach((row) => centered.observe(row));
        disposers.push(() => centered.disconnect());
      }
    }

    /* ---------- entrada y revelado (solo con movimiento completo) ---------- */
    if (full) {
      const lede = root.querySelector<HTMLElement>("[data-lede]");
      const header = [...root.querySelectorAll<HTMLElement>("[data-hi]")];
      const scr = [...root.querySelectorAll<HTMLElement>("[data-scr]")].filter(
        (el) => !el.closest("main"),
      );

      const ledeChars = lede ? split(lede, track) : [];
      utils.set(ledeChars, { opacity: 0 });
      utils.set(header, { opacity: 0 });
      track(
        animate(header, {
          opacity: [0, 1],
          translateY: [-8, 0],
          duration: 700,
          delay: stagger(80, { start: 250 }),
        }),
      );
      track(
        animate(ledeChars, {
          opacity: [0, 1],
          translateY: ["0.6em", 0],
          duration: 800,
          delay: stagger(14, { start: 1700 }),
        }),
      );
      scr.forEach((el, i) => {
        scrambled.set(el, el.textContent ?? "");
        scramble(el, 200 + i * 70, 1500, track);
      });

      const reveal = [...root.querySelectorAll<HTMLElement>("[data-rv]")];
      const headings = [...root.querySelectorAll<HTMLElement>("[data-split]")].map((el) => {
        el.setAttribute("aria-label", el.textContent ?? "");
        return { el, chars: split(el, track) };
      });
      utils.set(reveal, { opacity: 0, translateY: 26 });
      headings.forEach((h) => utils.set(h.chars, { opacity: 0 }));
      hidden.push(...reveal, ...headings.flatMap((h) => h.chars));

      const revealObserver = new IntersectionObserver(
        (entries) => {
          let k = 0;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            revealObserver.unobserve(el);
            const heading = headings.find((h) => h.el === el);
            if (heading) {
              track(
                animate(heading.chars, {
                  opacity: [0, 1],
                  translateY: ["0.5em", 0],
                  delay: stagger(24),
                  duration: 900,
                  ease: "outExpo",
                }),
              );
              continue;
            }
            track(
              animate(el, {
                opacity: [0, 1],
                translateY: [26, 0],
                duration: 900,
                delay: k++ * 90,
                ease: "outExpo",
              }),
            );
            if (el.hasAttribute("data-scr")) {
              scrambled.set(el, el.textContent ?? "");
              scramble(el, 100, 900, track);
            }
          }
        },
        { threshold: 0.12 },
      );
      [...reveal, ...headings.map((h) => h.el)].forEach((el) => revealObserver.observe(el));
      disposers.push(() => revealObserver.disconnect());
    }

    // La sección visible al cargar (p. ej. al recargar a mitad de página) fija la atmósfera inicial.
    const current = sections.findIndex((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= innerHeight / 2 && r.bottom > innerHeight / 2;
    });
    activate(Math.max(0, current));

    return () => {
      window.clearTimeout(leaveTimer);
      disposers.forEach((dispose) => dispose());
      created.forEach((a) => a.revert());
      scrambled.forEach((text, el) => (el.textContent = text));
      hidden.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
      rows.forEach((row) => row.classList.remove("is-active"));
      if (activeProject !== null) signalBus.emit({ type: "project", index: null });
    };
  }, [generation]);

  return null;
}
