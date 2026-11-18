# Completar y sanear el dashboard de administración

- **Área:** dashboard + backend
- **Dificultad:** media (codex)
- **Rama:** feat/runtime-experience (sin commit; integra el planificador)

## Objetivo
El dashboard creado en `2026-11-18-admin-dashboard.md` funciona a medias: el código está comprimido en líneas enormes, las páginas consultan Prisma directamente y faltan pantallas y controles. Dejarlo completo, legible y conforme a las reglas de arquitectura.

## Contexto mínimo
- `AGENTS.md`, `docs/GOLDEN-PRINCIPLES.md`, `docs/ARCHITECTURE.md`.
- Plan anterior: `docs/exec-plans/completed/2026-11-18-admin-dashboard.md` (requisitos completos).
- Código: `src/app/admin/**`, `src/components/admin/**`, `src/server/actions/**`, `src/server/auth/**`, `src/server/dal/**`, `src/app/proyectos/[slug]/page.tsx`, `proxy.ts`.
- Salida de `node scripts/check-boundaries.mjs` (8 violaciones R2) y `pnpm lint` (1 error).

## Archivos a tocar
- `src/app/admin/**`, `src/components/admin/**`, `src/server/actions/**`
- NUEVO `src/server/dal/admin/*.ts` (lecturas del dashboard, con `import "server-only"`; incluyen borradores e inactivos)
- `src/app/proyectos/[slug]/page.tsx` (usar `getPublishedProjectBySlug` y un nuevo `src/server/dal/projects/get-published-project-slugs.ts`)

## Pasos
1. **Formato legible**: reescribe cada archivo tocado con formato estándar (2 espacios, una sentencia por línea, JSX en varias líneas, ≤ 110 columnas, como el resto del repo, p. ej. `src/server/dal/projects/get-published-projects.ts`). Ningún archivo con líneas de cientos de caracteres.
2. **R2**: ninguna página importa `@/lib/prisma`; crea funciones DAL en `src/server/dal/admin/` y úsalas.
3. **Lint**: `<a href="/">` → `<Link>` en `src/app/proyectos/[slug]/page.tsx`.
4. **Pantallas que faltan**: `/admin/redes` (CRUD, activar, reordenar) y añadirla a la navegación.
5. **Controles que faltan** en perfil, proyectos, skills, experiencia y formación: editar en línea o en página de edición, activar/desactivar, reordenar (subir/bajar con la action de reorden existente), publicar/despublicar proyecto y perfil, destacado, gestión de repositorios y skills del proyecto, alt editable y reorden de imágenes.
6. **UX mínima**: estados vacíos con un CTA, mensajes de éxito/error de `ActionState`, botones con estado pendiente, etiquetas `<label>` asociadas, foco visible. Estilo sobrio con los tokens existentes (`data-surface="ink"`); el rediseño visual vendrá después.
7. Mantén `requireAdmin()` en cada página y action (R6) y `revalidatePath` en cada mutación.

## Criterio de terminado
- [ ] `node scripts/check-boundaries.mjs` sin violaciones.
- [ ] `pnpm exec tsc --noEmit` y `pnpm exec eslint` sin errores.
- [ ] Ninguna línea > 140 caracteres en los archivos tocados (`awk 'length > 140' <archivos>` vacío).
- [ ] Cada entidad (perfil, redes, categorías, skills, proyectos con repos/skills/imágenes, experiencia, formación) se puede crear, editar, activar/publicar, reordenar y borrar desde la UI.
- [ ] Docs: ninguno (el planificador actualiza).

## Fuera de alcance
Esquema Prisma, `src/components/runtime/**`, `src/app/page.tsx`, `src/server/portfolio/**`, `scripts/**`, `docs/**`, dependencias nuevas, commits. Sin red en el sandbox: no intentes conectar a Postgres; el planificador probará de punta a punta.

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-18 | planificador | Creado tras verificar la entrega de codex: auth correcta en 21 actions; R2 ×8, lint ×1, código comprimido, UI incompleta |
| 2026-11-18 | codex | Entrega parcial (BLOCKED): R2 ×8 resuelto, `/admin/redes`, DAL admin; tsc/eslint limpios. Falta formato y controles → Sonnet |
