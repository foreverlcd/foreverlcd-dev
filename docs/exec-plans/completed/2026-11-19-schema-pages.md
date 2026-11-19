# Páginas del esquema: /proyectos, ficha completa y /stack/[slug]

- **Área:** web pública
- **Dificultad:** media (Sonnet implementer)
- **Rama:** feat/schema-driven-site (sin commit; integra el planificador)

## Objetivo
Crear las rutas que exige `docs/product/SPEC.md`:
- el índice `/proyectos`;
- la ficha completa `/proyectos/[slug]`;
- la página de cada skill `/stack/[slug]`.

También los componentes públicos compartidos que reutilizará la portada (plan `2026-11-19-home-schema.md`). El esquema manda: se muestra cada campo `show` de `docs/product/schema-map.json` para estas rutas.

## Contexto mínimo
- `docs/product/SPEC.md` (reglas de presentación: iconos, fechas, repos, imágenes, vacíos), `docs/product/schema-map.json`
- `docs/ART-DIRECTION.md` (SIGNAL; estas páginas no llevan escena WebGL), `src/components/signal/signal.css` (tokens `--signal`, `--ink`, `--ash`, `--line`, `--pad`…)
- `src/app/proyectos/[slug]/page.tsx` (la ficha actual, escasa), `src/components/signal/format.ts`
- `src/server/dal/projects/*`, `src/server/dal/skills/*`, `src/server/actions/common.ts` (`revalidatePortfolio`), `src/app/sitemap.ts`
- `src/server/portfolio/demo-portfolio.ts`: el modo DEMO debe seguir funcionando en `/`. Las páginas nuevas pueden usar solo la base.
- Next 16: `node_modules/next/dist/docs/` para `generateStaticParams`, `revalidatePath(path, "page")` y `next/image`. No inventes APIs.

## Archivos a tocar
- NUEVO `src/components/public/`:
  - `site-header.tsx`: marca → `/`, enlaces a Proyectos, Stack (`/#stack`) y Contacto (`/#contacto`). Táctil ≥ 44 px.
  - `skill-chip.tsx`: enlace a `/stack/[slug]` con icono.
  - `skill-icon.tsx`: aplica la regla `Skill.icon` del SPEC, exportando `iconKind(icon)` puro.
  - `repo-links.tsx`: etiquetas Backend / Frontend / Código.
  - `project-card.tsx`: portada con `next/image`, título, `shortDescription`, años, insignia `DESTACADO`, chips.
  - `dates.ts`: `formatMonthYear` con `Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric', timeZone: 'UTC' })`, más un rango con "actual".
  - `public.css` si hace falta (importa tokens de `signal.css`, no los duplica).
- NUEVO `src/app/proyectos/page.tsx`: índice. `revalidate = 86400`, metadata y canonical.
- NUEVO `src/app/proyectos/project-filter.tsx` (`"use client"`): filtro por skill con botones `aria-pressed`. Sin JS se ven todos los proyectos.
- `src/app/proyectos/[slug]/page.tsx`: ficha completa. Contiene:
  - portada;
  - fechas mes-año;
  - descripción;
  - chips;
  - repositorios por tipo;
  - demo;
  - galería en rejilla con `width`/`height` reales;
  - navegación anterior/siguiente según el orden del índice.
- NUEVO `src/app/stack/[slug]/page.tsx`: icono, nombre, categoría (`name`), `description` y las tarjetas de los proyectos publicados que la usan. Lleva `generateStaticParams`, metadata y 404 si la skill o su categoría están inactivas.
- `src/server/dal/projects/get-published-projects.ts`: lo usa la portada; no rompas su forma. Si hace falta, añade `getPublishedProjectNeighbors(slug)` en un archivo nuevo del mismo directorio.
- NUEVO `src/server/dal/skills/get-published-skill-by-slug.ts` y `get-published-skill-slugs.ts`. Una skill solo es pública si `isActive` y su categoría `isActive`. Sus proyectos: solo los `PUBLISHED`, ordenados como el índice.
- `src/server/actions/common.ts`: `revalidatePortfolio` también revalida `/proyectos`, `revalidatePath("/proyectos/[slug]", "page")` y `revalidatePath("/stack/[slug]", "page")`.
- `src/app/sitemap.ts`: añade `/proyectos` y cada `/stack/<slug>`.

## Pasos
1. Componentes y `dates.ts`. Las etiquetas de repos salen del SPEC, no de `REPOSITORY_LABEL` de la portada.
2. DAL de skills y vecinos, con `import "server-only"`. Los selects nombran solo campos `show`/`use` del mapa.
3. Las tres páginas, con `<SiteHeader/>`, `main#principal`, un `h1` único y `notFound()` para slugs inexistentes o en borrador.
4. Estilo SIGNAL sobrio:
   - tipografía display en el `h1` y mono en las etiquetas;
   - reglas finas `--line`;
   - insignia `DESTACADO` en mono y color `--signal`.
   - Mobile-first: 360 px sin scroll horizontal.
   - Rejilla del índice: 1, 2 y 3 columnas.
5. Revalidación y sitemap.
6. `node scripts/check-schema-coverage.mjs`: las parejas de estas rutas deben quedar cubiertas. Baja el baseline con `--write-baseline` y explica en tu informe qué parejas siguen sin cubrir y por qué.

## Criterio de terminado
- [ ] `pnpm build`: `/proyectos` ○, `/proyectos/[slug]` y `/stack/[slug]` ● con Revalidate 1d.
- [ ] Un slug inexistente devuelve 404 en ambas rutas dinámicas.
- [ ] `bash scripts/gate.sh` en verde. `coverage` sin deuda en `/proyectos`, `/proyectos/[slug]` ni `/stack/[slug]`.
- [ ] El JS inicial de `/` no crece (presupuesto en el gate).
- [ ] **No ejecutes** `seed:fixture` ni ui-shots contra `:3000`: lo hace el planificador. No mates el servidor de `:3000`.
- [ ] Docs: ninguno (el planificador actualiza ARCHITECTURE y PROGRESS).

## Fuera de alcance
- `src/components/signal/**` y la portada: es el plan siguiente.
- Prisma, dependencias, git y el dashboard (salvo `common.ts`).

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-19 | planificador | Creado desde SPEC.md tras la directriz "el esquema manda" |
