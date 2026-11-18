/**
 * Figuras objetivo de las partículas. Cada figura es una nube de N puntos
 * muestreada de texto (Canvas 2D con Unbounded) o de un campo de distancia (SDF).
 *
 * Las coordenadas son fracciones de pantalla: x, y ∈ [-0.5, 0.5] y z en unidades
 * de mundo. La escena las multiplica por el tamaño visible a la distancia actual
 * de la cámara, así la figura ocupa la misma zona sea cual sea el plano de la sección.
 * Este módulo no importa three: devuelve arrays planos RGBA (w = 1).
 */

export type TargetSpec =
  | { kind: "name" }
  | { kind: "text"; text: string }
  | { kind: "ring" };

export type TargetPlan = {
  specs: TargetSpec[];
  /** Índice de la primera figura de proyecto. */
  projectBase: number;
};

/** Máximo de figuras de proyecto (memoria: una textura RGBA32F por figura). */
export const MAX_PROJECT_FIGURES = 8;

/**
 * Orden de las figuras: [0] nombre (portada), [i] una por sección, y luego una por proyecto.
 * La figura de la sección i es la i-ésima; la del proyecto p es `projectBase + p`.
 */
export function planTargets(sections: string[], projectCount: number): TargetPlan {
  const specs: TargetSpec[] = sections.map((id, i): TargetSpec => {
    if (i === 0) return { kind: "name" };
    if (id === "contacto") return { kind: "text", text: "@" };
    if (id === "traza") return { kind: "ring" };
    return { kind: "text", text: String(i).padStart(2, "0") };
  });
  const projectBase = specs.length;
  const figures = Math.min(projectCount, MAX_PROJECT_FIGURES);
  for (let p = 0; p < figures; p++) specs.push({ kind: "text", text: `P${p + 1}` });
  return { specs, projectBase };
}

export type RasterOptions = {
  /** Partículas por figura (simSize²). */
  count: number;
  /** Líneas del nombre en el DOM (h1): su posición y tamaño reales se muestrean. */
  nameLines: HTMLElement[];
};

type Zone = { cx: number; cy: number; mw: number; mh: number };

/** Zona de las figuras de sección: a la derecha en escritorio, arriba en móvil. */
const zoneFor = (viewportWidth: number): Zone =>
  viewportWidth <= 760
    ? { cx: 0.72, cy: 0.2, mw: 0.5, mh: 0.17 }
    : { cx: 0.79, cy: 0.53, mw: 0.34, mh: 0.46 };

const ALPHA_THRESHOLD = 110;
const Z_JITTER = 0.3;

export function rasterizeTargets(specs: TargetSpec[], options: RasterOptions): Float32Array[] {
  const { count, nameLines } = options;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(1, 900 / vw);
  const cw = Math.max(2, Math.round(vw * scale));
  const ch = Math.max(2, Math.round(vh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas 2d no disponible");

  const family = nameLines[0]
    ? getComputedStyle(nameLines[0]).fontFamily
    : "system-ui, sans-serif";
  const hasLetterSpacing = "letterSpacing" in ctx;
  const zone = zoneFor(vw);

  const setFont = (size: number, tracking: number) => {
    ctx.font = `700 ${size}px ${family}`;
    if (hasLetterSpacing) ctx.letterSpacing = `${tracking * size}px`;
  };

  const verticalCenter = (m: TextMetrics) =>
    (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;

  const drawName = () => {
    const scrollY = window.scrollY;
    for (const line of nameLines) {
      const rect = line.getBoundingClientRect();
      if (rect.width === 0) continue;
      const text = (line.textContent ?? "").toUpperCase();
      let size = parseFloat(getComputedStyle(line).fontSize) * scale;
      setFont(size, -0.04);
      // Se reescala para que el ancho muestreado coincida con el ancho real del DOM.
      size *= (rect.width * scale) / ctx.measureText(text).width;
      setFont(size, -0.04);
      const m = ctx.measureText(text);
      // En móvil el nombre se estira en vertical con `transform: scaleY`; el DOM no lo refleja en offsetHeight.
      const stretch = line.offsetHeight > 0 ? rect.height / line.offsetHeight : 1;
      const cy = (rect.top + scrollY + rect.height / 2) * scale;
      ctx.save();
      ctx.translate(rect.left * scale, cy);
      ctx.scale(1, stretch);
      ctx.fillText(text, 0, verticalCenter(m));
      ctx.restore();
    }
  };

  const drawFitted = (text: string) => {
    setFont(200, -0.03);
    const probe = ctx.measureText(text);
    const height = probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent;
    const size = 200 * Math.min((zone.mw * cw) / probe.width, (zone.mh * ch) / height);
    setFont(size, -0.03);
    const m = ctx.measureText(text);
    ctx.textAlign = "center";
    ctx.fillText(text, zone.cx * cw, zone.cy * ch + verticalCenter(m));
  };

  /** Pixeles encendidos del lienzo tras dibujar. */
  const sampleCanvas = (draw: () => void) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    if (hasLetterSpacing) ctx.letterSpacing = "0px";
    draw();
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const lit = new Uint32Array(cw * ch);
    let total = 0;
    for (let i = 3, p = 0; i < data.length; i += 4, p++) {
      if (data[i] > ALPHA_THRESHOLD) lit[total++] = p;
    }
    return { lit, total };
  };

  const fromCanvas = (draw: () => void) => {
    const { lit, total } = sampleCanvas(draw);
    const out = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      let x = 0.5;
      let y = 0.5;
      if (total > 0) {
        const q = lit[(Math.random() * total) | 0];
        x = ((q % cw) + Math.random()) / cw;
        y = (Math.floor(q / cw) + Math.random()) / ch;
      }
      out.set([x - 0.5, 0.5 - y, (Math.random() - 0.5) * Z_JITTER, 1], i * 4);
    }
    return out;
  };

  /** Anillos concéntricos y retícula, por rechazo sobre un SDF. Es la "lectura" de la traza. */
  const fromRing = () => {
    const out = new Float32Array(count * 4);
    const radius = Math.min(zone.mw * cw, zone.mh * ch) * 0.5;
    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 24; attempt++) {
        const px = (Math.random() * 2 - 1) * radius;
        const py = (Math.random() * 2 - 1) * radius;
        const r = Math.hypot(px, py) / radius;
        const outer = Math.abs(r - 1) < 0.045;
        const inner = Math.abs(r - 0.56) < 0.03;
        const cross = r < 1 && (Math.abs(px) < radius * 0.012 || Math.abs(py) < radius * 0.012);
        x = px;
        y = py;
        if (outer || inner || cross) break;
      }
      const z = (Math.random() - 0.5) * Z_JITTER;
      out.set([zone.cx - 0.5 + x / cw, 0.5 - zone.cy - y / ch, z, 1], i * 4);
    }
    return out;
  };

  return specs.map((spec) => {
    if (spec.kind === "name") return fromCanvas(drawName);
    if (spec.kind === "ring") return fromRing();
    return fromCanvas(() => drawFitted(spec.text));
  });
}
