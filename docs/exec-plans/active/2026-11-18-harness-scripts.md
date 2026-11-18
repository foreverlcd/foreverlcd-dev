# Scripts del harness de agentes

- **Dificultad:** media (sonnet)
- **Rama:** feat/runtime-experience (sin commit; integra el planificador)

## Objetivo
Dar a los agentes verificaciones mecánicas con salida corta y mensajes que dicen cómo corregir: gate único, reglas de arquitectura, presupuestos de rendimiento, capturas de navegador con WebGL, arranque del entorno y delegación multimotor.

## Contexto mínimo (lee esto y nada más)
- `AGENTS.md`, `package.json`, `compose.yaml`, `prisma.config.ts`, `.gitignore`.
- Referencia probada en otro proyecto del mismo autor (adáptala, no la copies a ciegas):
  - `/home/foreverlcd/Projects/Others/steam-society/frontend-steam-society/scripts/gate.sh`
  - `/home/foreverlcd/Projects/Others/steam-society/frontend-steam-society/scripts/check-boundaries.mjs`
  - `/home/foreverlcd/Projects/Others/steam-society/frontend-steam-society/scripts/ui-shots.mjs`
  - `/home/foreverlcd/Projects/Others/steam-society/backend-steam-society/scripts/harness/delegate.sh` y `pipeline.sh`
- Estructura actual: `src/app/**`, `src/components/runtime/**` (portada WebGL; `scene/**` es el único sitio que importa `three`), `src/server/**` (DAL, actions, auth; `server-only`), `src/lib/{prisma,auth,auth-client}.ts`.

## Archivos a crear (lista cerrada)
1. `scripts/gate.sh` — pasos con `ok/FAIL/SKIP` y tiempo, últimas 40 líneas solo si falla, `GATE PASSED|FAILED` al final:
   `boundaries` (node scripts/check-boundaries.mjs) · `typecheck` (pnpm exec tsc --noEmit) · `lint` (pnpm exec eslint) · `build` (pnpm build; si Postgres no responde en 127.0.0.1:5434 → `SKIP` con aviso, salvo `GATE_STRICT=1` que lo convierte en FAIL) · `budgets` (node scripts/check-budgets.mjs, solo si hubo build) · `secrets` (como el de referencia). Modo `scripts/gate.sh full` añade `shots` (node scripts/ui-shots.mjs scripts/ui-plans/smoke.json) arrancando antes `next start` en un puerto libre y parándolo al final. El build de Next a veces se detiene una vez con un aviso de seguridad de Next ("This command stopped to show the upgrade recommendation. Retry"): si la salida contiene esa frase, reintenta el comando una vez.
2. `scripts/check-boundaries.mjs` — sin dependencias, recorre `src/` y `scripts/`, imprime cada violación como `archivo:línea  REGLA  → cómo corregir` y sale con 1 si hay alguna. Reglas:
   - R1 Un archivo con `"use client"` no importa `@/server/**`, `@/lib/prisma`, `@/lib/auth` (sí puede `@/lib/auth-client`). → "mueve la lógica a un Server Component o a una Server Action".
   - R2 `@/lib/prisma` solo se importa desde `src/server/**`, `src/lib/auth.ts`, `src/app/api/**/route.ts` y `scripts/**`. → "usa una función del DAL en src/server/dal".
   - R3 Todo `.ts/.tsx` bajo `src/server/**` empieza con `import "server-only"` (excepto archivos que solo exportan tipos y los de `src/server/actions/**` que usan `"use server"`). → "añade import \"server-only\" en la primera línea".
   - R4 `three` solo se importa en `src/components/**/scene/**`; y los módulos de `scene/` solo se cargan con `import()` dinámico desde fuera de `scene/`. → "carga la escena con await import() para mantener Three.js fuera del bundle inicial".
   - R5 Páginas públicas (`src/app/page.tsx`, `src/app/proyectos/**/page.tsx`) no exportan `dynamic = "force-dynamic"` y sí exportan `revalidate`. → "la web pública es estática (plan gratuito); revalida con revalidatePath".
   - R6 Cada archivo de `src/server/actions/**` con funciones exportadas contiene `requireAdmin(` (salvo `action-state.ts` y archivos de tipos). → "verifica la sesión dentro de la action: requireAdmin()".
   - R7 Prohibido `window.confirm`, `window.alert`, `alert(` en `src/`. → "usa <dialog> o un segundo clic".
   - R8 En archivos `"use client"`, `process.env.X` solo con `NEXT_PUBLIC_`. → "los secretos no viajan al cliente".
3. `scripts/check-budgets.mjs` — tras `next build`: lee `.next/server/app/index.html`, localiza los `<script src="/_next/static/chunks/...">`, suma su tamaño gzip (zlib) y falla si supera `BUDGET_INITIAL_JS_KB` (por defecto 230). Falla si algún chunk inicial contiene `WebGLRenderer`. Imprime una tabla corta (chunk, kB gzip) y el total. Si no hay build, dilo y sal con 2.
4. `scripts/ui-shots.mjs` + `scripts/ui-plans/smoke.json` + `scripts/ui-plans/admin.json` — adapta el de referencia. Plan JSON: `{ "name", "baseUrl", "runs": [{ "name", "viewport": {w,h}, "reducedMotion"?: true, "mobile"?: true }], "steps": [{ "goto" | "waitFor" | "scrollTo" (selector) | "hover" | "click" | "fill" {selector,value|env} | "wait" (ms) | "shot" (nombre) | "text" (selector → imprime innerText recortado) }] }`. Chromium con `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` para WebGL sin GPU. Guarda en `.shots/<plan>/<run>-<nn>-<shot>.png`. Al final imprime por run: estado de `.runtime-stage[data-status]` si existe, fps medido 2 s, y errores/avisos de consola; sale con 1 si hubo `pageerror` o errores de consola. `BASE_URL` sobrescribe `baseUrl`. `smoke.json`: portada en escritorio 1440×900, móvil 390×844 y reduced motion; capturas de hero, `#proyectos`, `#traza`. `admin.json`: login con `ADMIN_EMAIL`/`ADMIN_PASSWORD` de entorno (`fill` con `env`), captura de `/admin` y `/admin/proyectos`.
5. `scripts/init.sh` — arranque del entorno para cualquier sesión de agente: `docker compose up -d db`, espera a que Postgres responda (máx. 30 s), `pnpm exec prisma migrate status` (solo informa), arranca `pnpm dev` en segundo plano en `PORT` (3000 por defecto) con log en `.harness/dev.log` y pid en `.harness/dev.pid` (si ya corre, lo reutiliza), espera a `/` y `/api/health`, imprime un resumen de 5 líneas. `scripts/init.sh stop` lo detiene.
6. `scripts/harness/delegate.sh` y `scripts/harness/pipeline.sh` — adapta los de referencia a UN solo repo (este). Roles en `docs/harness/roles/<rol>.md` (implementer, reviewer, art-reviewer, doc-gardener). Motores: `sonnet|haiku` (claude -p), `codex` (gpt-6-luna), `agy` (solo roles de lectura), `opencode` (aviso de terceros). El rol `art-reviewer` es de solo lectura y recibe además, en el prompt, la lista de rutas de `.shots/**/*.png` más recientes para que las lea. Salida en `.harness/runs/`. El pipeline NO hace commit (el planificador integra): implementa → gate → revisa → para.

## Prohibido
Tocar `package.json` (el planificador añadirá los scripts), `src/**`, `docs/**` (salvo la bitácora de este plan), `.env`. Nada de commits. No instales dependencias (ya están `playwright` y Node 24).

## Criterio de terminado
- [ ] `node scripts/check-boundaries.mjs` corre y lista violaciones reales si las hay (no las arregles: inclúyelas en el informe).
- [ ] `bash scripts/gate.sh` corre de principio a fin y su salida cabe en ~15 líneas cuando todo pasa.
- [ ] `node scripts/check-budgets.mjs` funciona tras un build existente o informa que falta.
- [ ] `bash -n` sin errores en todos los `.sh`; `node --check` en los `.mjs`.
- [ ] Cada script tiene un comentario de cabecera de 2–5 líneas: uso y propósito.

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-18 | planificador | Plan creado y delegado a sonnet |
