#!/usr/bin/env node
// Presupuestos de rendimiento tras `next build`: suma el JS inicial (gzip) de
// .next/server/app/index.html y prohíbe WebGLRenderer en chunks iniciales.
// Uso: node scripts/check-budgets.mjs   Env: BUDGET_INITIAL_JS_KB (230)
// Sale con 2 si no hay build, 1 si se supera un presupuesto.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const BUDGET_KB = Number(process.env.BUDGET_INITIAL_JS_KB ?? 230);
const html = path.join(".next", "server", "app", "index.html");
if (!fs.existsSync(html)) {
  console.error("budgets: no hay build (.next/server/app/index.html). Corre `pnpm build` primero.");
  process.exit(2);
}

const page = fs.readFileSync(html, "utf8");
const srcs = [...new Set([...page.matchAll(/<script[^>]*\ssrc="(\/_next\/static\/chunks\/[^"?]+)[^"]*"/g)].map((m) => m[1]))];
if (!srcs.length) {
  console.error("budgets: index.html no referencia chunks iniciales (¿página dinámica?).");
  process.exit(2);
}

let total = 0;
const problems = [];
console.log("chunk".padEnd(52), "kB gzip");
for (const src of srcs) {
  const file = path.join(".next", decodeURIComponent(src.replace("/_next/", "")));
  if (!fs.existsSync(file)) {
    problems.push(`falta el chunk ${src} en disco`);
    continue;
  }
  const buf = fs.readFileSync(file);
  const kb = zlib.gzipSync(buf).length / 1024;
  total += kb;
  console.log(path.basename(src).padEnd(52), kb.toFixed(1).padStart(7));
  if (buf.includes("WebGLRenderer"))
    problems.push(`${path.basename(src)} contiene WebGLRenderer → carga la escena con await import() para sacar Three.js del bundle inicial`);
}
console.log("TOTAL".padEnd(52), total.toFixed(1).padStart(7), `(presupuesto ${BUDGET_KB})`);
if (total > BUDGET_KB)
  problems.push(`JS inicial ${total.toFixed(1)} kB gzip > ${BUDGET_KB} kB → mueve código pesado a import() dinámico o reduce dependencias del cliente`);

if (problems.length) {
  for (const p of problems) console.error(`FAIL ${p}`);
  process.exit(1);
}
console.log("budgets: ok");
