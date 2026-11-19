#!/usr/bin/env node
// Cobertura del esquema: cada campo `show` de docs/product/schema-map.json debe leerse en el código
// de cada ruta que lo muestra ($routes) y seleccionarse en src/server/dal (fuera de admin/).
// Uso: node scripts/check-schema-coverage.mjs [--write-baseline]   (sale con 1 si hay errores)
// Trinquete: docs/product/coverage-baseline.json guarda las parejas campo × ruta sin cubrir (deuda).
// Una pareja nueva sin cubrir es error; una del baseline ya cubierta también (el baseline solo encoge).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MAP_FILE = "docs/product/schema-map.json";
const BASELINE_FILE = "docs/product/coverage-baseline.json";
const writeBaseline = process.argv.includes("--write-baseline");
const errors = [];
const fail = (subject, problem, fix) => errors.push(`${subject}: ${problem}  → ${fix}`);

const map = JSON.parse(fs.readFileSync(path.join(ROOT, MAP_FILE), "utf8"));
const routes = map.$routes ?? {};
const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");

// --- Esquema: campos por modelo ---------------------------------------------------------------
function schemaFields(model) {
  const m = schema.match(new RegExp(`^model ${model} \\{([\\s\\S]*?)^\\}`, "m"));
  if (!m) return null;
  const fields = [];
  for (const raw of m[1].split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("@@")) continue;
    fields.push(line.split(/\s+/)[0]);
  }
  return fields;
}

// --- Código: lectura de archivos --------------------------------------------------------------
const stripComments = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:\\"'`])\/\/[^\n]*/g, "$1");

function sourceFiles(entry, out = []) {
  const abs = path.join(ROOT, entry);
  if (!fs.existsSync(abs)) return out;
  if (fs.statSync(abs).isDirectory()) {
    for (const e of fs.readdirSync(abs)) sourceFiles(path.join(entry, e), out);
  } else if (/\.tsx?$/.test(entry)) out.push(entry);
  return out;
}

const readCode = (files) =>
  files.map((f) => stripComments(fs.readFileSync(path.join(ROOT, f), "utf8"))).join("\n");

const routeCode = {};
for (const [route, entries] of Object.entries(routes)) {
  routeCode[route] = readCode([...new Set(entries.flatMap((e) => sourceFiles(e)))]);
}
const dalFiles = sourceFiles("src/server/dal").filter((f) => !f.split(path.sep).includes("admin"));
const dalCode = readCode(dalFiles);

const accessed = (code, f) =>
  new RegExp(`\\.${f}\\b|\\b${f}\\s*:|\\{[^{}]*\\b${f}\\b[^{}]*\\}\\s*=`).test(code);
const selected = (code, f) => new RegExp(`\\b${f}\\s*:\\s*(true\\b|\\{)`).test(code);

// "/#hero" usa la entrada de su ruta base ("/"); "/proyectos/[slug]" y "meta" se quedan tal cual.
const baseRoute = (r) => (r.includes("#") ? r.split("#")[0] || "/" : r);

// --- Validación del mapa contra el esquema y cálculo de parejas -------------------------------
const pairs = new Map(); // "Modelo.campo @ ruta" -> cubierta (bool)
for (const [model, mapped] of Object.entries(map.models)) {
  const real = schemaFields(model);
  if (!real) {
    fail(MAP_FILE, `el modelo ${model} no existe en prisma/schema.prisma`,
         "quítalo del mapa o corrige el nombre");
    continue;
  }
  for (const f of real) {
    if (!mapped[f]) {
      fail(`${model}.${f}`, "falta en el mapa", `añádelo a ${MAP_FILE} con show/use/internal`);
    }
  }
  for (const [f, spec] of Object.entries(mapped)) {
    if (!real.includes(f)) {
      fail(`${model}.${f}`, "el mapa nombra un campo que no existe en el esquema",
        `quítalo o corrige el nombre en ${MAP_FILE}`);
      continue;
    }
    for (const r of new Set((spec.show ?? []).map(baseRoute))) {
      if (!(r in routes)) {
        fail(`${model}.${f}`, `la ruta "${r}" no está en $routes`,
             `añade sus archivos a "$routes" en ${MAP_FILE}`);
        continue;
      }
      pairs.set(`${model}.${f} @ ${r}`, accessed(routeCode[r], f) && selected(dalCode, f));
    }
  }
}

// --- Trinquete --------------------------------------------------------------------------------
const uncovered = [...pairs].filter(([, ok]) => !ok).map(([k]) => k).sort();
const total = pairs.size;

if (writeBaseline) {
  fs.writeFileSync(path.join(ROOT, BASELINE_FILE), JSON.stringify({ uncovered }, null, 2) + "\n");
  console.log(`Baseline escrito: ${uncovered.length} parejas sin cubrir de ${total} (${BASELINE_FILE}).`);
} else {
  const baseFile = path.join(ROOT, BASELINE_FILE);
  const stored = fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, "utf8")).uncovered : [];
  const baseline = new Set(stored);
  for (const k of uncovered) {
    if (!baseline.has(k)) {
      fail(k, "pareja nueva sin cubrir",
        "muéstrala en esa ruta (léela en su código y selecciónala en src/server/dal)");
    }
  }
  for (const k of baseline) {
    if (pairs.get(k) === true || !pairs.has(k)) {
      const why = pairs.has(k) ? "ya está cubierta" : "ya no existe en el mapa";
      fail(k, `${why} pero sigue en el baseline`,
        "corre `node scripts/check-schema-coverage.mjs --write-baseline` para bajar el baseline");
    }
  }
}

// --- Informe ----------------------------------------------------------------------------------
const byRoute = {};
for (const k of uncovered) {
  const [field, route] = k.split(" @ ");
  (byRoute[route] ??= []).push(field);
}
console.log(`Cobertura del esquema: cubiertos ${total - uncovered.length} / ${total} (campo × ruta)`);
if (uncovered.length && !writeBaseline) {
  console.log(`Deuda (aviso, ${uncovered.length} parejas) por ruta:`);
  for (const [route, fields] of Object.entries(byRoute)) {
    console.log(`  ${route} (${fields.length}): ${fields.join(", ")}`);
  }
}
if (errors.length) {
  console.error(`\n${errors.length} error(es):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("check-schema-coverage: OK");
