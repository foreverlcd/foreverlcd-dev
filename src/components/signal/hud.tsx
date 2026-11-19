"use client";

import { useEffect } from "react";

import { signalBus, type SceneFrame, type SceneInfo, type SceneState } from "./bus";

const STATE_LABEL: Record<SceneState, string> = {
  assembling: "ENSAMBLANDO",
  locked: "BLOQUEADO",
  flow: "FLUJO LAMINAR",
  static: "ESTÁTICO",
};

type HudKey =
  | "x" | "y" | "px" | "py" | "fps" | "state" | "flow" | "particles" | "sim" | "sec" | "tier"
  | "mkx" | "mky" | "ret";

const pad = (v: number, n: number) => String(Math.max(0, Math.round(v))).padStart(n, "0");
const signed = (v: number) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);

/**
 * Escritor del HUD: actualiza el DOM directamente (nada de estado de React por frame).
 * El HUD es decorativo y `aria-hidden`: todo lo que dice también está en el DOM accesible.
 */
export function createHudWriter() {
  const cache = new Map<HudKey, HTMLElement | null>();
  const el = (key: HudKey) => {
    let node = cache.get(key);
    if (!node || !node.isConnected) {
      node = document.querySelector<HTMLElement>(`[data-hud="${key}"]`);
      cache.set(key, node);
    }
    return node;
  };
  const text = (key: HudKey, value: string) => {
    const node = el(key);
    if (node && node.textContent !== value) node.textContent = value;
  };
  let lastText = 0;

  return {
    label(value: string) {
      text("state", value);
    },
    tier(value: string) {
      text("tier", value);
    },
    info(info: SceneInfo) {
      text("particles", info.particles.toLocaleString("es"));
      text("sim", info.sim);
      text("tier", info.tier);
    },
    frame(f: SceneFrame, now: number) {
      const ret = el("ret");
      if (ret) {
        ret.style.opacity = (f.pointerOn * 0.9).toFixed(2);
        ret.style.transform =
          `translate(${f.pointerX - 50}px,${f.pointerY - 50}px) scale(${(f.reticle / 100).toFixed(3)})`;
      }
      const mkx = el("mkx");
      if (mkx) mkx.style.left = `${Math.min(100, Math.max(0, (f.pointerX / innerWidth) * 100))}%`;
      const mky = el("mky");
      if (mky) mky.style.top = `${(f.scrollProgress * 100).toFixed(2)}%`;
      if (now - lastText < 90) return;
      lastText = now;
      text("x", signed(f.worldX));
      text("y", signed(f.worldY));
      text("px", pad(f.pointerX, 4));
      text("py", pad(f.pointerY, 4));
      text("fps", f.fps ? String(f.fps) : "--");
      text("flow", f.flow.toFixed(2));
      text("state", STATE_LABEL[f.state]);
    },
  };
}

/** Reglas, coordenadas, estado y flujo: la lectura del instrumento. */
export function Hud({ sectionTotal }: { sectionTotal: number }) {
  useEffect(
    () =>
      signalBus.subscribe((event) => {
        if (event.type !== "section") return;
        const node = document.querySelector<HTMLElement>('[data-hud="sec"]');
        if (node) node.textContent = String(event.index).padStart(2, "0");
      }),
    [],
  );

  return (
    <div aria-hidden="true">
      <div className="sg-hud sg-rx">
        <i data-hud="mkx" />
      </div>
      <div className="sg-hud sg-ry">
        <i data-hud="mky" />
      </div>
      <div className="sg-hud sg-hud-b">
        <div className="sg-hud-c1">
          <span>
            X <b data-hud="x">+0.000</b> &nbsp;Y <b data-hud="y">+0.000</b>
          </span>
          <span>
            PX <b data-hud="px">0000</b>,<b data-hud="py">0000</b> &nbsp;FPS <b data-hud="fps">--</b>
          </span>
        </div>
        <div className="sg-hud-c2">
          <span>
            ESTADO <b className="sg-ac" data-hud="state">INICIANDO</b>
          </span>
          <span>
            FLUJO <b data-hud="flow">0.00</b>
          </span>
        </div>
        <div className="sg-hud-c3">
          <span>
            PARTÍCULAS <b data-hud="particles">—</b> · SIM <b data-hud="sim">—</b>
          </span>
          <span>
            <span className="sg-opt">NIVEL <b data-hud="tier">—</b> · </span>
            SEC <b data-hud="sec">00</b>/{String(sectionTotal).padStart(2, "0")}
          </span>
        </div>
      </div>
      <div className="sg-ret" data-hud="ret" />
    </div>
  );
}
