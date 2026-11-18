#!/usr/bin/env node
// Reglas de arquitectura (R1-R8) sobre src/ y scripts/, sin dependencias.
// Uso: node scripts/check-boundaries.mjs   (sale con 1 si hay violaciones)
// Formato de salida: archivo:línea  REGLA  → cómo corregir
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", "generated", ".git", ".harness", ".shots"]);
const EXTS = new Set([".ts", ".tsx", ".mjs", ".js", ".jsx"]);
const violations = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (EXTS.has(path.extname(e.name))) out.push(path.join(dir, e.name));
  }
  return out;
}

const report = (file, line, rule, fix) =>
  violations.push(`${file}:${line}  ${rule}  → ${fix}`);

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

// Quita comentarios conservando saltos de línea (los números de línea no cambian).
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:\\"'`])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
}

// Normaliza un especificador a "@/..." cuando apunta dentro de src/.
function normalize(spec, file) {
  if (spec.startsWith("@/")) return spec;
  if (spec.startsWith(".")) {
    const abs = path.resolve(path.dirname(file), spec);
    const rel = path.relative(path.join(ROOT, "src"), abs).split(path.sep).join("/");
    if (!rel.startsWith("..")) return `@/${rel.replace(/\.(ts|tsx|mjs|js)$/, "")}`;
  }
  return spec.replace(/\.(ts|tsx)$/, "");
}

function imports(code) {
  const found = [];
  const re =
    /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(["'])([^"'\n]+)\1/g;
  let m;
  while ((m = re.exec(code))) {
    found.push({ raw: m[2], line: lineOf(code, m.index), dynamic: /^import\s*\(/.test(m[0]) });
  }
  return found;
}

const hasDirective = (code, name) => {
  const head = code.replace(/^\s+/, "");
  return new RegExp(`^(["'])${name}\\1`).test(head);
};

const isPrismaSpec = (s) => s === "@/lib/prisma";
const isAuthSpec = (s) => s === "@/lib/auth";
const isServerSpec = (s) => s === "@/server" || s.startsWith("@/server/");

const files = [...walk(path.join(ROOT, "src")), ...walk(path.join(ROOT, "scripts"))];

for (const abs of files) {
  const file = path.relative(ROOT, abs).split(path.sep).join("/");
  const original = fs.readFileSync(abs, "utf8");
  const code = stripComments(original);
  const isClient = hasDirective(code, "use client");
  const isSrc = file.startsWith("src/");
  const isScript = file.startsWith("scripts/");
  const imps = imports(code).map((i) => ({ ...i, spec: normalize(i.raw, abs) }));

  for (const i of imps) {
    // R1 — las Server Actions ("use server" en src/server/actions/**) sí se importan desde el cliente.
    const isActionSpec = i.spec.startsWith("@/server/actions/");
    if (isClient && !isActionSpec && (isServerSpec(i.spec) || isPrismaSpec(i.spec) || isAuthSpec(i.spec)))
      report(file, i.line, "R1", "mueve la lógica a un Server Component o a una Server Action (el cliente solo puede usar @/lib/auth-client)");
    // R2
    if (isPrismaSpec(i.spec)) {
      const ok =
        isScript ||
        file.startsWith("src/server/") ||
        file === "src/lib/auth.ts" ||
        /^src\/app\/api\/.+\/route\.ts$/.test(file);
      if (!ok) report(file, i.line, "R2", "usa una función del DAL en src/server/dal");
    }
    // R4 (three)
    if (i.raw === "three" || i.raw.startsWith("three/")) {
      if (!/^src\/components\/(?:.+\/)?scene\//.test(file))
        report(file, i.line, "R4", "carga la escena con await import() para mantener Three.js fuera del bundle inicial (three solo dentro de scene/)");
    }
    // R4 (módulos de scene/ solo con import() dinámico desde fuera)
    if (isSrc && /(?:^|\/)scene(?:\/|$)/.test(i.spec) && !/\/scene\//.test(`/${file}`) && !i.dynamic)
      report(file, i.line, "R4", "carga la escena con await import() para mantener Three.js fuera del bundle inicial");
  }

  // R3
  if (file.startsWith("src/server/") && /\.tsx?$/.test(file)) {
    const base = path.basename(file);
    const exemptActions =
      file.startsWith("src/server/actions/") && (hasDirective(code, "use server") || base === "action-state.ts");
    const typesOnly = !/^export\s+(?:async\b|const\b|let\b|var\b|function\b|class\b|enum\b|default\b|\*)|^export\s*\{(?!\s*type\b)/m.test(code);
    const firstStmt = code.replace(/^\s+/, "").replace(/^(["'])use (?:server|client)\1;?\s*/, "");
    const hasServerOnly = /^import\s+(["'])server-only\1/.test(firstStmt);
    if (!exemptActions && !typesOnly && !hasServerOnly)
      report(file, 1, "R3", 'añade import "server-only" en la primera línea');
  }

  // R5
  if (file === "src/app/page.tsx" || /^src\/app\/proyectos\/.+\/page\.tsx$/.test(file)) {
    const fd = /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/.exec(code);
    if (fd)
      report(file, lineOf(code, fd.index), "R5", "la web pública es estática (plan gratuito); revalida con revalidatePath");
    if (!/export\s+const\s+revalidate\b/.test(code))
      report(file, 1, "R5", "la web pública es estática (plan gratuito); exporta `revalidate` y revalida con revalidatePath");
  }

  // R6
  if (file.startsWith("src/server/actions/") && /\.tsx?$/.test(file)) {
    const base = path.basename(file);
    const exportsFn = /^export\s+(?:async\s+function|function|const\s+\w+\s*=\s*(?:async\s*)?(?:\(|function))/m.test(code);
    if (base !== "action-state.ts" && exportsFn && hasDirective(code, "use server") && !/requireAdmin\(/.test(code))
      report(file, 1, "R6", "verifica la sesión dentro de la action: requireAdmin()");
  }

  // R7
  if (isSrc) {
    const re = /\bwindow\.(?:confirm|alert)\s*\(|(?<![.\w])alert\s*\(|(?<![.\w])confirm\s*\(/g;
    let m;
    while ((m = re.exec(code)))
      report(file, lineOf(code, m.index), "R7", "usa <dialog> o un segundo clic");
  }

  // R8
  if (isClient) {
    const re = /\bprocess\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
    let m;
    while ((m = re.exec(code)))
      if (!m[1].startsWith("NEXT_PUBLIC_") && m[1] !== "NODE_ENV")
        report(file, lineOf(code, m.index), "R8", "los secretos no viajan al cliente (solo NEXT_PUBLIC_*)");
  }
}

if (violations.length) {
  console.log(violations.join("\n"));
  console.log(`\n${violations.length} violación(es) de arquitectura.`);
  process.exit(1);
}
console.log("boundaries: sin violaciones");
