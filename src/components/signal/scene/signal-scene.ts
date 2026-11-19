/**
 * Escena SIGNAL / ESTRUCTURA: partículas GPGPU que forman texto y figuras, sobre
 * una capa atmosférica (estructura en T2, niebla y tinte en T1).
 *
 * Portado de docs/art/prototypes/signal.html y megastructure.html.
 * Vive fuera de React: se carga con import() y solo habla con el DOM por el bus
 * (eventos de sección y proyecto, objeto de atmósfera) y por callbacks.
 */
import * as THREE from "three";
import {
  GPUComputationRenderer,
  type Variable,
} from "three/examples/jsm/misc/GPUComputationRenderer.js";

import {
  atmosphere,
  signalBus,
  signalState,
  type SceneFrame,
  type SceneInfo,
  type SceneState,
} from "../bus";
import {
  FOG_FRAG,
  FULLSCREEN_VERT,
  POINTS_FRAG,
  POINTS_VERT,
  POSITION_FRAG,
  STRUCTURE_COMPOSITE_FRAG,
  STRUCTURE_FRAG,
  VELOCITY_FRAG,
} from "./shaders";
import { MAX_PROJECT_FIGURES, planTargets, rasterizeTargets, type TargetPlan } from "./targets";
import {
  STRUCTURE_SCALE,
  TIERS,
  createFrameGovernor,
  type ActiveTier,
  type Tier,
} from "./tiers";

const FOV = 38;
const INTRO_MS = 3000;
const STRUCTURE_STEPS = 56;
const STRUCTURE_DIM = 0.42;
const STRUCTURE_LENGTH = 150;

/* ------------------------------------------------------------------ */
/* Tipos públicos                                                      */
/* ------------------------------------------------------------------ */

export type SignalSceneOptions = {
  canvas: HTMLCanvasElement;
  tier: ActiveTier;
  motion: "full" | "reduced";
  /** Ids de las secciones, en orden de página. */
  sections: string[];
  projectCount: number;
  /** Líneas del nombre en el DOM, de donde se muestrea la primera figura. */
  nameLines: HTMLElement[];
  onFrame?: (frame: SceneFrame) => void;
  onInfo?: (info: SceneInfo) => void;
  /** La degradación adaptativa bajó de nivel. `T0` pide retirar la escena. */
  onTierChange?: (tier: Tier) => void;
  onContextLost?: () => void;
};

export type SignalScene = { dispose: () => void };

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));
const outQuad = (t: number) => 1 - (1 - t) * (1 - t);
const outQuart = (t: number) => 1 - (1 - t) ** 4;
const inOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const inOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

/** Colores de señal: signal → uv → coral según el orden del proyecto. */
const SIGNAL_RGB: [number, number, number] = [0.831, 1, 0.227];
const SIGNAL_COLORS: [number, number, number][] = [SIGNAL_RGB, [0.482, 0.361, 1], [1, 0.302, 0.18]];
const projectColor = (index: number) => SIGNAL_COLORS[index % SIGNAL_COLORS.length];

const pathXY = (z: number): [number, number] => [
  Math.sin(z * 0.045) * 1.6 + Math.sin(z * 0.11) * 0.6,
  Math.cos(z * 0.037) * 0.8,
];

type Uniforms = Record<string, THREE.IUniform>;
const uniform = <T>(value: T): THREE.IUniform<T> => ({ value });

const orthoCamera = () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

function fullscreenPass(fragmentShader: string, uniforms: Uniforms) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
  );
  const material = new THREE.ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return {
    scene,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Capa atmosférica (MEGASTRUCTURE)                                    */
/* ------------------------------------------------------------------ */

type BackdropFrame = {
  time: number;
  boot: number;
  dt: number;
  snap: boolean;
  aspect: number;
  scrollProgress: number;
  /** Linterna: posición suavizada del puntero en [-1, 1]. */
  lanternX: number;
  lanternY: number;
  flash: number;
  signalColor: THREE.Vector3;
  signalMix: number;
  nameBox: THREE.Vector4;
  nameDim: number;
  leftDim: number;
};

type Backdrop = {
  update: (frame: BackdropFrame) => void;
  render: () => void;
  resize: (bufferWidth: number, bufferHeight: number) => void;
  dispose: () => void;
};

/** T2: estructura raymarcheada a ≤ 0.5 de resolución, con niebla y haz de linterna. */
function createStructureBackdrop(renderer: THREE.WebGLRenderer): Backdrop {
  const march: Uniforms = {
    uRes: uniform(new THREE.Vector2(2, 2)),
    uTime: uniform(0),
    uBlk: uniform(0.58),
    uDens: uniform(0.55),
    uCross: uniform(0.38),
    uBeam: uniform(0.3),
    uFog: uniform(0.03),
    uWarm: uniform(0.06),
    uLamp: uniform(1),
    uFlash: uniform(0),
    uSigMix: uniform(0),
    uRhythm: uniform(0.35),
    uFl: uniform(1.3),
    uDim: uniform(STRUCTURE_DIM),
    uSteps: uniform(STRUCTURE_STEPS),
    uRo: uniform(new THREE.Vector3()),
    uAng: uniform(new THREE.Vector3()),
    uSigCol: uniform(new THREE.Vector3(0.62, 0.48, 1)),
    uTint: uniform(new THREE.Vector3()),
    uMouse: uniform(new THREE.Vector2()),
  };
  const composite: Uniforms = {
    tMap: uniform<THREE.Texture | null>(null),
    uRes: uniform(new THREE.Vector2(2, 2)),
    uBoot: uniform(0),
    uTime: uniform(0),
    uNameBox: uniform(new THREE.Vector4()),
    uNameDim: uniform(0),
    uLeftDim: uniform(0),
  };

  const target = new THREE.WebGLRenderTarget(2, 2, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
  composite.tMap.value = target.texture;
  const marchPass = fullscreenPass(STRUCTURE_FRAG, march);
  const compositePass = fullscreenPass(STRUCTURE_COMPOSITE_FRAG, composite);
  const camera = orthoCamera();

  let camZ = 0;
  let previousZ = 0;
  let velocity = 0;

  return {
    update(f) {
      const a = atmosphere;
      const targetZ = f.scrollProgress * STRUCTURE_LENGTH;
      camZ = f.snap ? targetZ : damp(camZ, targetZ, 2.6, f.dt);
      velocity = f.dt > 0 ? damp(velocity, (camZ - previousZ) / f.dt, 6, f.dt) : 0;
      previousZ = camZ;

      const z = camZ - (1 - clamp(f.boot)) ** 3 * 16;
      const p = pathXY(z);
      const slope = (pathXY(z + 1)[0] - pathXY(z - 1)[0]) * 0.5;
      const mx = f.lanternX;
      const my = f.lanternY;
      (march.uRo.value as THREE.Vector3).set(p[0] + mx * 0.45, p[1] + my * 0.35, z);
      (march.uAng.value as THREE.Vector3).set(
        Math.atan(slope) + a.yaw + mx * 0.1,
        a.pitch + my * 0.08,
        a.roll + mx * 0.03 - clamp(velocity * 0.0009, -0.05, 0.05),
      );
      (march.uMouse.value as THREE.Vector2).set(mx * f.aspect * 0.5, my * 0.5);
      march.uFl.value = Math.min(1.3, f.aspect * 0.735) * (1 - Math.min(Math.abs(velocity) * 0.004, 0.18));
      march.uBlk.value = a.blk;
      march.uDens.value = a.dens;
      march.uCross.value = a.cross;
      march.uBeam.value = a.beam;
      march.uFog.value = a.fog;
      march.uWarm.value = a.warm;
      march.uLamp.value = a.lamp;
      march.uFlash.value = f.flash;
      march.uSigMix.value = f.signalMix;
      march.uRhythm.value = 0.35 + f.signalMix * 0.45;
      (march.uSigCol.value as THREE.Vector3).copy(f.signalColor);
      (march.uTint.value as THREE.Vector3).set(a.tintR, a.tintG, a.tintB);
      march.uTime.value = f.time;
      composite.uTime.value = f.time;
      composite.uBoot.value = f.boot;
      (composite.uNameBox.value as THREE.Vector4).copy(f.nameBox);
      composite.uNameDim.value = f.nameDim;
      composite.uLeftDim.value = f.leftDim;
    },
    render() {
      renderer.setRenderTarget(target);
      renderer.render(marchPass.scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(compositePass.scene, camera);
    },
    resize(bufferWidth, bufferHeight) {
      const w = Math.max(2, Math.round(bufferWidth * STRUCTURE_SCALE));
      const h = Math.max(2, Math.round(bufferHeight * STRUCTURE_SCALE));
      target.setSize(w, h);
      (march.uRes.value as THREE.Vector2).set(w, h);
      (composite.uRes.value as THREE.Vector2).set(bufferWidth, bufferHeight);
    },
    dispose() {
      marchPass.dispose();
      compositePass.dispose();
      target.dispose();
    },
  };
}

/** T1: niebla, tinte y haces suaves en una sola pasada barata. */
function createFogBackdrop(renderer: THREE.WebGLRenderer): Backdrop {
  const uniforms: Uniforms = {
    uRes: uniform(new THREE.Vector2(2, 2)),
    uTint: uniform(new THREE.Vector3()),
    uTime: uniform(0),
    uFog: uniform(0.03),
    uBeam: uniform(0.3),
    uYaw: uniform(0),
    uBoot: uniform(0),
  };
  const pass = fullscreenPass(FOG_FRAG, uniforms);
  const camera = orthoCamera();

  return {
    update(f) {
      const a = atmosphere;
      (uniforms.uTint.value as THREE.Vector3).set(a.tintR, a.tintG, a.tintB);
      uniforms.uFog.value = a.fog;
      uniforms.uBeam.value = a.beam;
      uniforms.uYaw.value = a.yaw;
      uniforms.uTime.value = f.time;
      uniforms.uBoot.value = f.boot;
    },
    render() {
      renderer.setRenderTarget(null);
      renderer.render(pass.scene, camera);
    },
    resize(bufferWidth, bufferHeight) {
      (uniforms.uRes.value as THREE.Vector2).set(bufferWidth, bufferHeight);
    },
    dispose: pass.dispose,
  };
}

/* ------------------------------------------------------------------ */
/* Escena                                                              */
/* ------------------------------------------------------------------ */

const loadFonts = async (family: string) => {
  try {
    await Promise.race([
      document.fonts.load(`700 100px ${family}`),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
    await document.fonts.ready;
  } catch {
    // Sin la fuente se muestrea la de reserva: la figura sigue siendo legible.
  }
};

type Morph = { t: number; soft: boolean; from: number };

export async function createSignalScene(options: SignalSceneOptions): Promise<SignalScene> {
  const { canvas, sections, projectCount, nameLines, motion } = options;
  const reduced = motion === "reduced";

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    throw new Error("webgl2 no disponible");
  }
  if (!renderer.extensions.has("EXT_color_buffer_float")) {
    renderer.dispose();
    throw new Error("texturas flotantes no disponibles");
  }
  renderer.autoClear = false;
  renderer.setClearColor(0x050507, 1);

  let tier: ActiveTier = options.tier;
  let disposed = false;
  let dpr = Math.min(window.devicePixelRatio || 1, TIERS[tier].maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 0.1, 80);
  camera.position.set(0, 0, atmosphere.z);

  const family = nameLines[0] ? getComputedStyle(nameLines[0]).fontFamily : "sans-serif";
  await loadFonts(family);

  /* ---------- uniforms compartidos ---------- */
  const U = {
    uTime: uniform(0),
    uDt: uniform(1 / 60),
    uAssemble: uniform(0),
    uMorph: uniform(0),
    uFlow: uniform(0),
    uScrollV: uniform(0),
    uPress: uniform(0),
    uMouseOn: uniform(0),
    uMouse: uniform(new THREE.Vector3(999, 999, 0)),
    uMouseVel: uniform(new THREE.Vector2()),
    uMouseR: uniform(1.6),
    uFlowAngle: uniform(0),
    uCurl: uniform(4),
    uSpeed: uniform(3.2),
    uBound: uniform(new THREE.Vector3(10, 6, 4)),
    uHot: uniform(0),
    uGain: uniform(0),
    uTrail: uniform(TIERS[tier].trail ? 1 : 0),
    uHotAmp: uniform(TIERS[tier].trail ? 45 : 12),
    uView: uniform(new THREE.Vector2(10, 6)),
    tA: uniform<THREE.Texture | null>(null),
    tB: uniform<THREE.Texture | null>(null),
  };
  const D = {
    tPos: uniform<THREE.Texture | null>(null),
    tVel: uniform<THREE.Texture | null>(null),
    uPx: uniform(dpr),
    uAcid: uniform(0),
    uDepth: uniform(atmosphere.z),
    uGain: U.uGain,
    uHot: U.uHot,
    uSig: uniform(new THREE.Vector3(...SIGNAL_RGB)),
  };
  const VELOCITY_UNIFORMS = [
    "uTime", "uDt", "uAssemble", "uMorph", "uFlow", "uScrollV", "uPress", "uMouseOn", "uMouse",
    "uMouseVel", "uMouseR", "uFlowAngle", "uCurl", "uSpeed", "uHot", "uTrail", "uHotAmp", "uView", "tA", "tB",
  ] as const;

  /* ---------- plano de figuras y simulación ---------- */
  const plan: TargetPlan = planTargets(sections, projectCount);
  const sectionTarget = (section: number) => (section < sections.length ? section : 0);
  const projectTarget = (project: number) =>
    plan.projectBase + Math.min(project, MAX_PROJECT_FIGURES - 1);

  type Sim = {
    gpu: GPUComputationRenderer;
    position: Variable;
    velocity: Variable;
    points: THREE.Points;
    size: number;
  };
  let sim: Sim | null = null;
  let targets: THREE.DataTexture[] = [];
  let idxA = 0;
  let idxB = 0;
  let targetIdx = 0;
  let morph: Morph | null = null;

  const updateBounds = () => {
    const halfH = Math.tan((FOV * Math.PI) / 360) * 16;
    U.uBound.value.set(halfH * (innerWidth / innerHeight) * 1.12, halfH * 1.12, 4);
  };

  const buildTargets = (size: number) => {
    const raw = rasterizeTargets(plan.specs, { count: size * size, nameLines });
    return raw.map((data) => {
      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
      texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
      return texture;
    });
  };

  const bindTargets = () => {
    U.tA.value = targets[idxA];
    U.tB.value = targets[idxB];
  };

  const disposeSim = () => {
    if (!sim) return;
    scene.remove(sim.points);
    sim.points.geometry.dispose();
    (sim.points.material as THREE.Material).dispose();
    sim.gpu.dispose();
    targets.forEach((t) => t.dispose());
    targets = [];
    sim = null;
  };

  const buildSim = (size: number) => {
    disposeSim();
    updateBounds();

    const gpu = new GPUComputationRenderer(size, size, renderer);
    const initialPosition = gpu.createTexture();
    const initialVelocity = gpu.createTexture();
    const data = initialPosition.image.data as Float32Array;
    const b = U.uBound.value;
    for (let i = 0; i < data.length; i += 4) {
      const spread = (extent: number) => (Math.random() * 2 - 1) * extent;
      data.set([spread(b.x), spread(b.y), spread(b.z), 1], i);
    }
    const velocity = gpu.addVariable("textureVelocity", VELOCITY_FRAG, initialVelocity);
    const position = gpu.addVariable("texturePosition", POSITION_FRAG, initialPosition);
    gpu.setVariableDependencies(velocity, [position, velocity]);
    gpu.setVariableDependencies(position, [position, velocity]);
    for (const key of VELOCITY_UNIFORMS) velocity.material.uniforms[key] = U[key];
    position.material.uniforms.uDt = U.uDt;
    position.material.uniforms.uBound = U.uBound;
    const error = gpu.init();
    if (error !== null) {
      gpu.dispose();
      throw new Error(error);
    }

    targets = buildTargets(size);
    bindTargets();

    const count = size * size;
    const ref = new Float32Array(count * 2);
    for (let y = 0, i = 0; y < size; y++) {
      for (let x = 0; x < size; x++, i++) ref.set([(x + 0.5) / size, (y + 0.5) / size], i * 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aRef", new THREE.BufferAttribute(ref, 2));
    const material = new THREE.ShaderMaterial({
      uniforms: D,
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    sim = { gpu, position, velocity, points, size };
  };

  const emitInfo = () => {
    if (!sim) return;
    const particles = sim.size * sim.size;
    options.onInfo?.({ tier, particles, sim: `${sim.size}×${sim.size}`, dpr });
    signalBus.emit({
      type: "status",
      line: `gpu: ${tier} · ${particles.toLocaleString("es")} partículas · dpr ${dpr.toFixed(2)}`,
    });
  };

  const syncDisplay = () => {
    if (!sim) return;
    D.tPos.value = sim.gpu.getCurrentRenderTarget(sim.position).texture;
    D.tVel.value = sim.gpu.getCurrentRenderTarget(sim.velocity).texture;
  };

  /* ---------- capa atmosférica ---------- */
  let backdrop: Backdrop = TIERS[tier].structure
    ? createStructureBackdrop(renderer)
    : createFogBackdrop(renderer);

  /** Los puntos crecen con el ancho de pantalla para que el nombre no se diluya en 2K+. */
  const pointSize = () => dpr * clamp(innerWidth / 1500, 1, 1.8);

  /** Caja del nombre en coordenadas de documento (px). */
  const nameBox = { x0: 0, y0: 0, x1: 0, y1: 0 };
  const measureNameBox = () => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const line of nameLines) {
      const r = line.getBoundingClientRect();
      if (r.width === 0) continue;
      x0 = Math.min(x0, r.left);
      x1 = Math.max(x1, r.right);
      y0 = Math.min(y0, r.top + window.scrollY);
      y1 = Math.max(y1, r.bottom + window.scrollY);
    }
    if (x0 === Infinity) x0 = y0 = x1 = y1 = 0;
    Object.assign(nameBox, { x0, y0, x1, y1 });
  };

  const resizeBuffers = () => {
    D.uPx.value = pointSize();
    measureNameBox();
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    backdrop.resize(Math.round(innerWidth * dpr), Math.round(innerHeight * dpr));
  };

  buildSim(TIERS[tier].simSize);
  resizeBuffers();
  emitInfo();

  /* ---------- estado de interacción ---------- */
  let activeSection = signalState.section;
  let activeProject: number | null = null;
  let introMs = reduced ? INTRO_MS : 0;
  let introDone = reduced;
  let tAcc = 0;
  let flowK = 0;
  let scrollV = 0;
  let previousScroll = window.scrollY;
  let pointerX = -999;
  let pointerY = -999;
  let pointerOn = 0;
  let pointerOnSmooth = 0;
  let havePointer = false;
  let pressTarget = 0;
  let hotTarget = 0;
  let lastPointerAt = -1e9;
  let wasPointerWorld = false;
  const lantern = { x: 0.06, y: 0.02, vx: 0, vy: 0, tx: 0.06, ty: 0.02 };
  const signalTarget = new THREE.Vector3(...SIGNAL_RGB);
  let signalMixTarget = 0;
  let flash = 0;
  const signalMix = { value: 0 };
  const world = new THREE.Vector3();
  const previousWorld = new THREE.Vector3();
  const worldVelocity = new THREE.Vector2();
  const ndc = new THREE.Vector3();
  const frameStats: SceneFrame = {
    pointerX: 0, pointerY: 0, worldX: 0, worldY: 0, fps: 0, flow: 0,
    scrollProgress: 0, pointerOn: 0, reticle: 0, state: "assembling",
  };

  const desiredTarget = () =>
    activeProject !== null ? projectTarget(activeProject) : sectionTarget(activeSection);

  /** Reensamblado instantáneo (movimiento reducido): simula hasta asentar y pinta. */
  const settle = (steps: number, index?: number) => {
    if (!sim) return;
    if (index !== undefined) {
      idxA = idxB = targetIdx = index;
      bindTargets();
    }
    morph = null;
    U.uMorph.value = 0;
    U.uAssemble.value = 1;
    U.uFlow.value = 0;
    U.uGain.value = 1;
    U.uMouseOn.value = 0;
    U.uPress.value = 0;
    U.uHot.value = 0;
    for (let i = 0; i < steps; i++) {
      U.uDt.value = 0.04;
      U.uTime.value += 0.04;
      sim.gpu.compute();
    }
    syncDisplay();
  };

  /** Cambio de figura: dispersa, interpola al nuevo objetivo y reensambla. */
  const go = (index: number, soft = false) => {
    if (reduced) {
      settle(70, index);
      renderOnce();
      return;
    }
    if (index === targetIdx) return;
    targetIdx = index;
    if (morph) {
      if (U.uMorph.value > 0.5) idxA = idxB;
      U.uMorph.value = 0;
      U.tA.value = targets[idxA];
    }
    idxB = index;
    U.tB.value = targets[index];
    morph = { t: 0, soft, from: U.uAssemble.value };
  };

  const advanceMorph = (dtMs: number) => {
    if (!morph) return;
    morph.t += dtMs;
    const soft = morph.soft;
    const dipTo = soft ? 0.35 : 0.06;
    const dipDur = soft ? 220 : 420;
    const morphAt = soft ? 60 : 200;
    const morphDur = soft ? 700 : 900;
    const riseAt = soft ? 300 : 620;
    const riseDur = soft ? 700 : 1100;
    const t = morph.t;

    U.uMorph.value = inOutQuad(clamp((t - morphAt) / morphDur));
    if (t < dipDur) U.uAssemble.value = lerp(morph.from, dipTo, outQuad(t / dipDur));
    else if (t < riseAt) U.uAssemble.value = dipTo;
    else U.uAssemble.value = lerp(dipTo, 1, inOutCubic(clamp((t - riseAt) / riseDur)));

    if (t >= riseAt + riseDur) {
      idxA = idxB;
      U.tA.value = targets[idxA];
      U.uMorph.value = 0;
      U.uAssemble.value = 1;
      morph = null;
    }
  };

  /* ---------- eventos del bus ---------- */
  const unsubscribe = signalBus.subscribe((event) => {
    if (event.type === "section") {
      activeSection = event.index;
      if (introDone && activeProject === null) go(sectionTarget(activeSection));
    } else if (event.type === "project") {
      activeProject = event.index;
      if (event.index === null) {
        hotTarget = 0;
        signalMixTarget = 0;
        signalTarget.set(...SIGNAL_RGB);
      } else {
        hotTarget = 1;
        signalMixTarget = 1;
        signalTarget.set(...projectColor(event.index));
      }
      if (reduced) {
        D.uSig.value.copy(signalTarget);
        signalMix.value = signalMixTarget;
      }
      if (introDone) go(desiredTarget(), true);
    }
  });

  /* ---------- puntero ---------- */
  const onPointerMove = (e: PointerEvent) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerOn = 1;
    havePointer = true;
    lastPointerAt = performance.now();
  };
  const onPointerDown = (e: PointerEvent) => {
    onPointerMove(e);
    pressTarget = 1;
    flash = 1;
  };
  const onPointerUp = (e: PointerEvent) => {
    pressTarget = 0;
    if (e.pointerType === "touch") pointerOn = 0;
  };
  const onPointerLeave = () => {
    pointerOn = 0;
  };
  if (!reduced) {
    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("pointerdown", onPointerDown, { passive: true });
    addEventListener("pointerup", onPointerUp);
    addEventListener("pointercancel", onPointerUp);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("mouseleave", onPointerLeave);
  }

  /* ---------- bucle ---------- */
  const governor = createFrameGovernor(tier, (next) => {
    if (disposed) return;
    if (next === "T0") {
      options.onTierChange?.("T0");
      return;
    }
    applyTier(next);
    options.onTierChange?.(next);
  });

  function applyTier(next: ActiveTier) {
    tier = next;
    dpr = Math.min(window.devicePixelRatio || 1, TIERS[next].maxDpr);
    renderer.setPixelRatio(dpr);
    D.uPx.value = pointSize();
    U.uTrail.value = TIERS[next].trail ? 1 : 0;
    U.uHotAmp.value = TIERS[next].trail ? 45 : 12;
    backdrop.dispose();
    backdrop = TIERS[next].structure ? createStructureBackdrop(renderer) : createFogBackdrop(renderer);
    buildSim(TIERS[next].simSize);
    resizeBuffers();
    emitInfo();
  }

  const scrollProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? clamp(window.scrollY / max) : 0;
  };

  const updateLantern = (dt: number, snap: boolean) => {
    if (snap) {
      lantern.x = lantern.tx = 0.06;
      lantern.y = lantern.ty = 0.02;
      lantern.vx = lantern.vy = 0;
      return;
    }
    const aspect = innerWidth / innerHeight;
    if (havePointer && performance.now() - lastPointerAt < 3200) {
      lantern.tx = clamp((pointerX / innerWidth - 0.5) * 2, -1.2, 1.2);
      lantern.ty = clamp(-(pointerY / innerHeight - 0.5) * 2, -1.2, 1.2);
    } else {
      // Sin puntero (o táctil en reposo) la linterna recorre la estructura sola.
      lantern.tx = Math.sin(tAcc * 0.37) * 0.72 * (aspect < 1 ? 1.4 : 1) + 0.16;
      lantern.ty = Math.sin(tAcc * 0.53 + 1.3) * 0.4;
    }
    lantern.vx += ((lantern.tx - lantern.x) * 120 - lantern.vx * 14) * dt;
    lantern.vy += ((lantern.ty - lantern.y) * 120 - lantern.vy * 14) * dt;
    lantern.x += lantern.vx * dt;
    lantern.y += lantern.vy * dt;
  };

  const backdropFrame: BackdropFrame = {
    time: 0, boot: 0, dt: 0, snap: false, aspect: 1, scrollProgress: 0, lanternX: 0, lanternY: 0,
    flash: 0, signalColor: new THREE.Vector3(...SIGNAL_RGB), signalMix: 0,
    nameBox: new THREE.Vector4(), nameDim: 0, leftDim: 0,
  };

  let nameDimK = 0;
  let leftDimK = 0;

  const updateBackdrop = (dt: number, snap: boolean) => {
    updateLantern(dt, snap);
    const f = backdropFrame;
    f.time = tAcc;
    f.boot = snap ? 1 : inOutQuart(clamp(introMs / 2400));
    f.dt = dt;
    f.snap = snap;
    f.aspect = innerWidth / innerHeight;
    f.scrollProgress = scrollProgress();
    f.lanternX = lantern.x;
    f.lanternY = lantern.y;
    f.flash = flash;
    f.signalColor.copy(D.uSig.value);
    f.signalMix = signalMix.value;
    const nameTarget = activeSection === 0 ? 1 : 0;
    const leftTarget = activeSection >= 1 && innerWidth >= 761 ? 1 : 0;
    nameDimK = snap ? nameTarget : damp(nameDimK, nameTarget, 3, dt);
    leftDimK = snap ? leftTarget : damp(leftDimK, leftTarget, 3, dt);
    f.nameDim = nameDimK;
    f.leftDim = leftDimK;
    const sy = window.scrollY;
    f.nameBox.set(
      nameBox.x0 / innerWidth,
      1 - (nameBox.y1 - sy) / innerHeight,
      nameBox.x1 / innerWidth,
      1 - (nameBox.y0 - sy) / innerHeight,
    );
    backdrop.update(f);
  };

  const draw = () => {
    backdrop.render();
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  };

  const staticCamera = () => {
    camera.position.set(0, 0, atmosphere.z);
    camera.rotation.set(0, 0, 0);
    D.uDepth.value = atmosphere.z;
    const halfH = Math.tan((FOV * Math.PI) / 360) * atmosphere.z;
    U.uView.value.set(halfH * 2 * camera.aspect, halfH * 2);
    camera.updateMatrixWorld();
  };

  function renderOnce() {
    if (disposed) return;
    staticCamera();
    updateBackdrop(0.016, true);
    syncDisplay();
    draw();
  }

  const updateIntro = (dtMs: number) => {
    if (introDone) return;
    introMs = Math.min(INTRO_MS, introMs + dtMs);
    const t = introMs;
    U.uGain.value = outQuad(clamp(t / 900)) * atmosphere.gain;
    if (!morph) U.uAssemble.value = inOutQuart(clamp((t - 500) / 2200));
    if (t >= INTRO_MS) {
      introDone = true;
      U.uAssemble.value = 1;
      go(desiredTarget());
    }
  };

  const hudState = (assemble: number): SceneState => {
    if (reduced) return "static";
    if (assemble > 0.96) return "locked";
    return assemble > 0.4 || !introDone ? "assembling" : "flow";
  };

  let fpsTime = 0;
  let fpsFrames = 0;

  function step(dt: number) {
    tAcc += dt;
    const sy = window.scrollY;
    scrollV = damp(scrollV, (sy - previousScroll) / dt, 7, dt);
    previousScroll = sy;
    const sv = clamp(scrollV / 2200, -1, 1);
    U.uScrollV.value = sv;
    const flowIn = clamp((Math.abs(sv) - 0.04) / 0.45);
    flowK += (flowIn - flowK) * (1 - Math.exp(-dt * (flowIn > flowK ? 10 : 2.2)));
    U.uFlow.value = flowK;

    updateIntro(dt * 1000);
    advanceMorph(dt * 1000);
    if (introDone) U.uGain.value = damp(U.uGain.value, atmosphere.gain, 4, dt);

    const introT = clamp(introMs / INTRO_MS);
    const introCam = lerp(1.8, 1, outQuart(introT));
    const curl = lerp(4, atmosphere.curl, inOutQuad(clamp(introMs / 2600)));
    U.uCurl.value = curl;
    U.uSpeed.value = atmosphere.speed;
    U.uFlowAngle.value = atmosphere.angle;
    D.uAcid.value = atmosphere.acid;

    const eff = U.uAssemble.value * (1 - flowK * 0.9);
    const dis = clamp(1 - eff);

    /* cámara */
    const zc = atmosphere.z * introCam * (1 - flowK * 0.06);
    camera.position.set(Math.sin(tAcc * 0.23) * 1.4 * dis, Math.cos(tAcc * 0.19) * 0.8 * dis, zc);
    camera.rotation.set(
      atmosphere.pitch * dis,
      atmosphere.yaw * dis - Math.sin(tAcc * 0.23) * 0.05 * dis,
      atmosphere.roll * dis + Math.sin(tAcc * 0.11) * 0.03 * dis,
    );
    camera.updateMatrixWorld();
    D.uDepth.value = Math.max(atmosphere.z, 6);
    const viewH = 2 * Math.tan((FOV * Math.PI) / 360) * zc;
    U.uView.value.set(viewH * camera.aspect, viewH);

    /* puntero → mundo */
    pointerOnSmooth += (pointerOn - pointerOnSmooth) * (1 - Math.exp(-dt * 8));
    U.uMouseOn.value = pointerOnSmooth;
    if (havePointer) {
      ndc
        .set((pointerX / innerWidth) * 2 - 1, -(pointerY / innerHeight) * 2 + 1, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      world.copy(camera.position).addScaledVector(ndc, -camera.position.z / ndc.z);
      const k = 1 - Math.exp(-dt * 12);
      const vx = wasPointerWorld ? (world.x - previousWorld.x) / dt : 0;
      const vy = wasPointerWorld ? (world.y - previousWorld.y) / dt : 0;
      wasPointerWorld = true;
      previousWorld.copy(world);
      worldVelocity.x += (vx - worldVelocity.x) * k;
      worldVelocity.y += (vy - worldVelocity.y) * k;
      const speed = worldVelocity.length();
      if (speed > 45) worldVelocity.multiplyScalar(45 / speed);
      U.uMouse.value.copy(world);
      U.uMouseVel.value.copy(worldVelocity);
    }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    U.uMouseR.value = (coarse ? 0.2 : 0.15) * viewH;
    U.uPress.value = damp(U.uPress.value, pressTarget, pressTarget ? 14 : 4, dt);
    U.uHot.value = damp(U.uHot.value, hotTarget, 6, dt);
    D.uSig.value.x = damp(D.uSig.value.x, signalTarget.x, 8, dt);
    D.uSig.value.y = damp(D.uSig.value.y, signalTarget.y, 8, dt);
    D.uSig.value.z = damp(D.uSig.value.z, signalTarget.z, 8, dt);
    signalMix.value = damp(signalMix.value, signalMixTarget, 5, dt);
    flash = damp(flash, 0, 3, dt);

    /* simulación + pintado */
    U.uDt.value = Math.min(dt, 1 / 30);
    U.uTime.value = tAcc;
    sim?.gpu.compute();
    syncDisplay();
    updateBackdrop(dt, false);
    draw();

    /* lectura para el HUD */
    fpsTime += dt;
    fpsFrames++;
    if (fpsTime >= 0.5) {
      frameStats.fps = Math.round(fpsFrames / fpsTime);
      fpsTime = 0;
      fpsFrames = 0;
    }
    const f = frameStats;
    f.pointerX = pointerX;
    f.pointerY = pointerY;
    f.worldX = world.x;
    f.worldY = world.y;
    f.flow = flowK;
    f.scrollProgress = scrollProgress();
    f.pointerOn = pointerOnSmooth;
    f.reticle = ((2 * U.uMouseR.value * (1 + U.uPress.value * 0.8)) / viewH) * innerHeight;
    f.state = hudState(eff);
    options.onFrame?.(f);
  }

  let rafId = 0;
  let lastTime = 0;
  let inView = true;

  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame);
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.1) dt = 0.1;
    if (dt <= 0) dt = 0.001;
    step(dt);
    governor.sample(dt * 1000);
  };

  const syncLoop = () => {
    const shouldRun = !document.hidden && inView && !reduced;
    if (shouldRun && !rafId) {
      lastTime = performance.now();
      previousScroll = window.scrollY;
      governor.reset();
      rafId = requestAnimationFrame(frame);
    } else if (!shouldRun && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const onVisibility = () => syncLoop();
  document.addEventListener("visibilitychange", onVisibility);

  const observer = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    syncLoop();
  });
  observer.observe(canvas);

  /* ---------- redimensionado ---------- */
  let resizeTimer = 0;
  let lastWidth = innerWidth;
  let lastHeight = innerHeight;
  const onResize = () => {
    resizeBuffers();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // La barra de direcciones móvil cambia la altura sin cambiar la composición.
      if (innerWidth === lastWidth && Math.abs(innerHeight - lastHeight) < 120) return;
      lastWidth = innerWidth;
      lastHeight = innerHeight;
      if (!sim) return;
      updateBounds();
      const previous = targets;
      targets = buildTargets(sim.size);
      bindTargets();
      previous.forEach((t) => t.dispose());
      if (reduced) {
        settle(70);
        renderOnce();
      }
    }, 250);
  };
  addEventListener("resize", onResize);

  let scrollFrame = 0;
  const onStaticScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      renderOnce();
    });
  };
  if (reduced) addEventListener("scroll", onStaticScroll, { passive: true });

  const onContextLost = (event: Event) => {
    event.preventDefault();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    options.onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  /* ---------- arranque ---------- */
  if (reduced) {
    staticCamera();
    settle(100, sectionTarget(activeSection));
    renderOnce();
  } else {
    syncLoop();
  }

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(scrollFrame);
      window.clearTimeout(resizeTimer);
      unsubscribe();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onStaticScroll);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pointerdown", onPointerDown);
      removeEventListener("pointerup", onPointerUp);
      removeEventListener("pointercancel", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("mouseleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      try {
        disposeSim();
        backdrop.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {
        // Con el contexto ya perdido no queda nada más que liberar.
      }
    },
  };
}
