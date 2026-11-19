#!/usr/bin/env node
// Capturas de navegador con WebGL (swiftshader por defecto; GPU=1 usa la GPU real) a partir de un plan JSON.
// Uso: node scripts/ui-shots.mjs scripts/ui-plans/smoke.json   (BASE_URL sobrescribe baseUrl)
// Plan: { name, baseUrl, runs:[{name,viewport:{w,h},reducedMotion?,mobile?}], steps:[{goto|waitFor|scrollTo|hover|click|fill|wait|shot|text|expect|expectStatus}] }
// Aserciones (cada fallo cuenta como error y el run imprime `aserciones ok N/M`):
//   { "expect": { "selector": "css", "text"?: "subcadena", "count"?: n, "min"?: n,
//                 "attr"?: { "name": "src", "includes": "res.cloudinary.com" } } }
//   { "expectStatus": { "path": "/x", "status": 404 } }   (fetch directo, sin navegador)
// Guarda en .shots/<plan>/<run>-<nn>-<shot>.png; sale con 1 si hay pageerror o errores de consola.
// CHROME_BIN fuerza un binario; si no, usa el Chromium de Playwright.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const planFile = process.argv[2];
if (!planFile) {
  console.error("uso: node scripts/ui-shots.mjs <plan.json>");
  process.exit(2);
}
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
const baseUrl = (process.env.BASE_URL ?? plan.baseUrl ?? "http://localhost:3000").replace(/\/$/, "");
const outDir = path.join(".shots", plan.name ?? path.basename(planFile, ".json"));
fs.mkdirSync(outDir, { recursive: true });

const probe = await fetch(baseUrl).then((r) => r.status).catch(() => 0);
if (probe >= 500) {
  console.error(`${baseUrl} responde ${probe}: la página falla al renderizar. Mira el log del servidor (.harness/dev.log).`);
  process.exit(1);
}
if (!probe) {
  console.error(`No responde ${baseUrl}. Arranca el servidor (scripts/init.sh o pnpm start) o define BASE_URL.`);
  process.exit(1);
}

// GPU=1 → GPU real por Vulkan (dGPU NVIDIA aquí); GPU=egl → GPU integrada por GL-EGL; vacío → swiftshader (CPU,
// determinista, los fps no significan nada). Medir rendimiento SIEMPRE con GPU=1.
const GPU_ARGS = {
  "": ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
  1: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=vulkan", "--enable-features=Vulkan"],
  egl: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=gl-egl"],
};

const browser = await chromium
  .launch({
    ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
    args: GPU_ARGS[process.env.GPU ?? ""] ?? GPU_ARGS[""],
  })
  .catch((e) => {
    console.error(`No se pudo abrir el navegador: ${String(e.message).split("\n")[0]}`);
    console.error("Corrige: `pnpm exec playwright install chromium` o define CHROME_BIN=/ruta/a/chromium.");
    process.exit(1);
  });

// Aserciones: lanzan Error con el motivo; el bucle de pasos lo registra junto al paso.
async function runExpect(page, e) {
  // Con `text`, el selector se filtra por ese texto: `count: 0` significa "ningún elemento lo contiene".
  const base = page.locator(e.selector);
  const loc = e.text !== undefined ? base.filter({ hasText: e.text }) : base;
  const what = e.text !== undefined ? `${e.selector} con el texto "${e.text}"` : e.selector;
  const count = await loc.count();
  if (e.count !== undefined && count !== e.count) {
    throw new Error(`se esperaban ${e.count} elementos y hay ${count} (${what})`);
  }
  if (e.min !== undefined && count < e.min) {
    throw new Error(`se esperaban al menos ${e.min} elementos y hay ${count} (${what})`);
  }
  if (e.count === undefined && e.min === undefined && count === 0) {
    throw new Error(`no existe ${what}; la página no lo renderiza`);
  }
  if (e.attr && count > 0) {
    const read = (els, name) => els.map((el) => el.getAttribute(name) ?? "");
    const values = await loc.evaluateAll(read, e.attr.name);
    if (!values.some((v) => v.includes(e.attr.includes))) {
      throw new Error(`ningún ${what} tiene ${e.attr.name} que incluya "${e.attr.includes}"`);
    }
  }
}

async function runExpectStatus({ path: p, status }) {
  const res = await fetch(new URL(p, baseUrl + "/"), { redirect: "manual" });
  if (res.status !== status) throw new Error(`${p} respondió ${res.status} y se esperaba ${status}`);
}

const safe = (s) => String(s).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "x";
let failed = false;

try {
  for (const run of plan.runs ?? [{ name: "default", viewport: { w: 1440, h: 900 } }]) {
    const vp = run.viewport ?? { w: 1440, h: 900 };
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      isMobile: !!run.mobile,
      hasTouch: !!run.mobile,
      deviceScaleFactor: 1,
      reducedMotion: run.reducedMotion ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const logs = [];
    let errors = 0;
    page.on("pageerror", (e) => {
      errors++;
      logs.push(`pageerror: ${String(e.message).split("\n")[0]}`);
    });
    page.on("console", (m) => {
      if (m.type() === "error") {
        errors++;
        logs.push(`console.error: ${m.text().split("\n")[0]}`);
      } else if (m.type() === "warning") logs.push(`console.warn: ${m.text().split("\n")[0]}`);
    });

    let n = 0;
    let assertOk = 0;
    let assertTotal = 0;
    const texts = [];
    for (const step of plan.steps ?? []) {
      try {
        if (step.goto !== undefined) {
          await page.goto(new URL(step.goto, baseUrl + "/").toString(), { waitUntil: "load" });
        } else if (step.waitFor) await page.waitForSelector(step.waitFor, { timeout: 15000 });
        else if (step.scrollTo) {
          // scrollIntoView({block:"start"}) respeta scroll-margin-top como un clic en un ancla real;
          // scrollIntoViewIfNeeded no, y deja el título bajo la cabecera fija (falso positivo).
          await page.locator(step.scrollTo).first().evaluate((el) => el.scrollIntoView({ block: "start" }));
        }
        else if (step.hover) await page.locator(step.hover).first().hover();
        else if (step.click) await page.locator(step.click).first().click();
        else if (step.fill) {
          const { selector, value, env } = step.fill;
          const v = env ? process.env[env] : value;
          if (v === undefined) throw new Error(`falta la variable de entorno ${env}`);
          await page.locator(selector).first().fill(v);
        } else if (step.wait !== undefined) await page.waitForTimeout(step.wait);
        else if (step.shot) {
          n++;
          const file = path.join(outDir, `${safe(run.name)}-${String(n).padStart(2, "0")}-${safe(step.shot)}.png`);
          // caret "initial": ocultar el cursor inyecta style en los inputs y, si la hidratación no terminó,
          // React lo reporta como "attributes didn't match" (falso positivo, ver docs/harness/LOG.md).
          await page.screenshot({ path: file, caret: "initial", fullPage: Boolean(step.fullPage) });
          // Ningún viewport admite scroll horizontal (docs/ART-DIRECTION.md: todos los dispositivos).
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          if (overflow > 1) {
            errors++;
            logs.push(`scroll horizontal de ${overflow}px en ${page.url()} (${step.shot}); busca el elemento que desborda`);
          }
        } else if (step.text) {
          const t = (await page.locator(step.text).first().innerText({ timeout: 5000 })).replace(/\s+/g, " ").trim();
          texts.push(`${step.text}: ${t.slice(0, 200)}`);
        } else if (step.expect) {
          assertTotal++;
          await runExpect(page, step.expect);
          assertOk++;
        } else if (step.expectStatus) {
          assertTotal++;
          await runExpectStatus(step.expectStatus);
          assertOk++;
        }
      } catch (e) {
        errors++;
        const kind = step.expect || step.expectStatus ? "aserción" : "paso";
        logs.push(`${kind} ${JSON.stringify(step)} falló: ${String(e.message).split("\n")[0]}`);
      }
    }

    const status = await page
      .locator("[data-scene], .runtime-stage")
      .first()
      .getAttribute("data-status", { timeout: 1000 })
      .catch(() => null);
    const renderer = await page
      .evaluate(() => {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return "sin webgl2";
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        return String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      })
      .catch(() => null);
    const fps = await page
      .evaluate(
        () =>
          new Promise((resolve) => {
            let frames = 0;
            const t0 = performance.now();
            const tick = (t) => {
              frames++;
              if (t - t0 >= 2000) resolve(Math.round((frames * 1000) / (t - t0)));
              else requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }),
      )
      .catch(() => null);

    console.log(`[${run.name}] status=${status ?? "n/a"} fps=${fps ?? "n/a"} errores=${errors}`);
    console.log(`  gpu ${renderer ?? "n/a"}`);
    console.log(`  aserciones ok ${assertOk}/${assertTotal}`);
    for (const t of texts) console.log(`  text ${t}`);
    for (const l of logs) console.log(`  ${l}`);
    if (errors) failed = true;
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Capturas en ${outDir}/`);
process.exit(failed ? 1 : 0);
