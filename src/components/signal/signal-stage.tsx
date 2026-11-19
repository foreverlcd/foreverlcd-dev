"use client";

import { useEffect, useRef, useState } from "react";

import { readMotionPreference, signalBus } from "./bus";
import { createHudWriter } from "./hud";

/** Contrato mínimo de la escena (su módulo solo se importa con import()). */
type SignalScene = { dispose: () => void };

type StageStatus = "loading" | "running" | "fallback" | "reduced" | "reading";

type Props = {
  /** Ids de las secciones renderizadas, en orden. */
  sections: string[];
  projectCount: number;
};

/**
 * Lienzo WebGL detrás del contenido. Nunca bloquea la lectura:
 * - El HTML del servidor ya es la página completa; esto llega después.
 * - Three.js se descarga solo cuando el navegador está ocioso.
 * - Sin WebGL2, Save-Data, modo lectura, contexto perdido dos veces o FPS bajos → T0 (sin canvas).
 * El estado se publica en `data-status` y `data-tier` del contenedor `[data-scene]`.
 */
export function SignalStage({ sections, projectCount }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contextLosses = useRef(0);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const onReading = () => setGeneration((g) => g + 1);
    window.addEventListener("signal:reading", onReading);
    return () => window.removeEventListener("signal:reading", onReading);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const hud = createHudWriter();
    const publish = (status: StageStatus, tier: string) => {
      stage.dataset.status = status;
      stage.dataset.tier = tier;
    };
    publish("loading", "");

    const motion = readMotionPreference();
    if (motion === "reading") {
      publish("reading", "T0");
      hud.label("LECTURA");
      return;
    }

    const fallback = (reason: string) => {
      publish("fallback", "T0");
      hud.label("ESTÁTICO");
      hud.tier("T0");
      signalBus.emit({ type: "status", line: `gpu: ${reason} · modo estático (T0)` });
    };

    const canvas = document.createElement("canvas");
    canvas.className = "sg-canvas";

    let cancelled = false;
    let tier = "T1";
    let scene: SignalScene | undefined;
    let idle = 0;

    const retire = (reason: string) => {
      scene?.dispose();
      scene = undefined;
      canvas.remove();
      fallback(reason);
    };

    const load = async (initial: "T2" | "T1") => {
      try {
        const { createSignalScene } = await import("./scene/signal-scene");
        if (cancelled) return;
        const nameLines = [...document.querySelectorAll<HTMLElement>("[data-name-line]")];
        const created = await createSignalScene({
          canvas,
          tier: initial,
          motion: motion === "reduced" ? "reduced" : "full",
          sections,
          projectCount,
          nameLines,
          onFrame: (frame) => hud.frame(frame, performance.now()),
          onInfo: (info) => hud.info(info),
          onTierChange: (next) => {
            if (cancelled) return;
            if (next === "T0") retire("rendimiento bajo (< 24 fps)");
            else {
              tier = next;
              stage.dataset.tier = next;
              signalBus.emit({ type: "status", line: `gpu: degradado a ${next} (frame > 22 ms)` });
            }
          },
          onContextLost: () => {
            if (cancelled) return;
            contextLosses.current += 1;
            if (contextLosses.current >= 2) retire("contexto perdido dos veces");
            else setGeneration((g) => g + 1);
          },
        });
        if (cancelled) {
          created.dispose();
          return;
        }
        scene = created;
        publish(motion === "reduced" ? "reduced" : "running", tier);
        if (motion === "reduced") hud.label("ESTÁTICO");
      } catch (error) {
        if (cancelled) return;
        retire(error instanceof Error ? error.message : "error");
      }
    };

    // La detección vive en scene/tiers (sin Three.js): se importa en caliente y es diminuta.
    const start = async () => {
      const { detectTier } = await import("./scene/tiers");
      if (cancelled) return;
      const decision = detectTier();
      if (decision.tier === "T0") {
        fallback(decision.reason);
        return;
      }
      tier = decision.tier;
      stage.append(canvas);
      const run = () => void load(decision.tier === "T1" ? "T1" : "T2");
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(run, { timeout: 1200 })
        : window.setTimeout(run, 300);
    };
    void start();

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      scene?.dispose();
      canvas.remove();
    };
  }, [sections, projectCount, generation]);

  return (
    <div
      ref={stageRef}
      className="sg-stage"
      data-scene=""
      data-status="loading"
      data-tier=""
      aria-hidden="true"
    />
  );
}
