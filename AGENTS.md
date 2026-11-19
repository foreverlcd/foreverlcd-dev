# foreverlcd.dev — portfolio + dashboard (Next.js 16)

Portfolio profesional de un ingeniero de software (full stack, backend, IA aplicada, experiencias interactivas) con un dashboard privado para administrar el contenido. Un solo desarrollador. Despliegue en el plan **gratuito** de Vercel (subdominio `*.vercel.app`) con Postgres gratuito.
Responde en español. Código, identificadores y commits en inglés.

## Al empezar y al terminar CADA sesión
1. `bash scripts/init.sh` (Postgres + dev server + comprobación básica). Si falla, arregla eso primero.
   **Excepción:** si eres un agente delegado en un sandbox sin Docker ni red (p. ej. codex), NO ejecutes `init.sh`: trabaja sin base de datos, corre `node scripts/check-boundaries.mjs`, `pnpm exec tsc --noEmit` y `pnpm exec eslint`, y dilo en tu informe. El planificador verifica de punta a punta.
2. Lee `docs/PROGRESS.md` y `docs/feature_list.json`. Trabaja en UNA funcionalidad o UN plan de `docs/exec-plans/active/` a la vez.
3. Al terminar: `bash scripts/gate.sh` en verde; actualiza `docs/PROGRESS.md`; en `feature_list.json` solo cambias `passes` a `true` tras verificarlo en el navegador (`scripts/ui-shots.mjs`). Nunca borres ni reescribas funcionalidades de la lista.

## Mapa (carga bajo demanda, no todo)
- Índice de documentos: `docs/00-INDEX.md`
- Qué muestra la web (el esquema es el contrato): `docs/product/SPEC.md` + `schema-map.json`
- Arquitectura, capas y caché: `docs/ARCHITECTURE.md`
- Reglas que todo cambio respeta: `docs/GOLDEN-PRINCIPLES.md`
- Dirección de arte y presupuestos 3D: `docs/ART-DIRECTION.md`
- Arnés de agentes (motores, roles, ciclo): `docs/HARNESS.md`
- Despliegue (producción en https://foreverlcd.vercel.app): `docs/DEPLOY.md`
- Calidad por área: `docs/QUALITY-SCORE.md` · Deuda: `docs/exec-plans/tech-debt-tracker.md`

Los documentos son la fuente de verdad. Si el código y un documento se contradicen: DETENTE y pregunta; no lo cambies en silencio.

## Comandos
- `bash scripts/gate.sh` — definición mínima de terminado (boundaries, tipos, lint, build, presupuestos, secretos). `full` añade capturas.
- `node scripts/check-boundaries.mjs` — reglas de arquitectura; cada error dice cómo corregir.
- `node scripts/ui-shots.mjs scripts/ui-plans/<plan>.json` — el agente ve la app (WebGL incluido) → `.shots/`.
- `PORTFOLIO_DEMO=1 pnpm dev` — contenido DEMO en local con la base vacía.
- `pnpm seed:fixture --yes` — datos ficticios que rellenan TODO el esquema (solo base local); `node scripts/ui-shots.mjs scripts/ui-plans/coverage.json` los verifica. Lo decide el planificador: el dueño puede estar viendo :3000.
- `node scripts/check-schema-coverage.mjs` — cada campo `show` del mapa se lee y se renderiza en su ruta (trinquete).
- `scripts/harness/delegate.sh <motor> <rol> <plan.md>` — delegar (ver `docs/HARNESS.md`).

## Stack (cerrado)
Next.js 16.4 App Router · React 19.3 · TypeScript · Tailwind 4 (CSS-first) · Prisma 7 + `@prisma/adapter-pg` (cliente en `src/generated/prisma`) · PostgreSQL 18 (Docker, puerto 5434) · Better Auth 1.7 + plugin admin · zod 4 · Three.js r187 · Anime.js 4.5 · Cloudinary (sin SDK) · pnpm · Node 24. Versiones reales: `package.json`.

## Detente y pregunta antes de
- Instalar una dependencia (justifica necesidad, tamaño, mantenimiento).
- Cambiar `prisma/schema.prisma` o crear/editar migraciones.
- Operaciones destructivas (`rm -rf`, `docker compose down -v`, resetear la base).
- Cambiar la dirección de arte de `docs/ART-DIRECTION.md`.

## Git y seguridad
- Nunca leas, imprimas ni edites `.env`; usa `.env.example`. Ningún secreto en el repo ni en logs.
- Los agentes delegados no hacen commit, push, merge, rebase ni reset: integra el planificador.
- No inventes APIs: verifica en `node_modules/<pkg>` (tipos) o en la guía local de Next de abajo.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
