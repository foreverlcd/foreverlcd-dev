# Portada completa según el esquema: #sobre-mi, destacados, trayectoria y stack

- **Área:** web pública
- **Dificultad:** media-alta (Sonnet implementer; el planificador revisa el arte)
- **Rama:** feat/schema-driven-site (sin commit)
- **Depende de:** `2026-11-19-schema-pages.md` (usa `src/components/public/*`)

## Objetivo
Que `/` muestre cada campo `show` de las secciones de la portada en `docs/product/schema-map.json`, con el orden y las reglas de `docs/product/SPEC.md`, sin perder la escena SIGNAL ni sus presupuestos.

## Contexto mínimo
- `docs/product/SPEC.md` (secciones de `/`, en orden), `docs/product/schema-map.json`, `docs/ART-DIRECTION.md`
- `src/components/signal/signal-page.tsx`, `signal.css`, `format.ts`, `signal-director.tsx` (secciones y navegación: `data-section`, `data-nav`)
- `src/server/portfolio/load-portfolio.ts` y `demo-portfolio.ts`: el DEMO debe rellenar también los campos nuevos (foto: `https://res.cloudinary.com/demo/image/upload/sample.jpg`; textos marcados como DEMO)
- `src/components/public/*` (skill-chip, skill-icon, repo-links, dates)

## Archivos a tocar
- `src/components/signal/signal-page.tsx`, `signal.css`, `format.ts`. Si `signal-page.tsx` pasa de ~500 líneas, extrae secciones a `src/components/signal/sections/*.tsx`.
- `src/components/signal/signal-director.tsx`: solo para registrar la sección nueva en la navegación y el seguimiento.
- `src/server/portfolio/demo-portfolio.ts`
- `src/server/dal/education/get-active-education.ts` y `experience/get-active-experiences.ts`: solo si falta seleccionar algún campo `show`.

## Pasos
1. **`#sobre-mi`**, nueva, entre el hero y `#proyectos`, y añadida a la navegación ("Sobre mí"). Contiene:
   - la foto real con `next/image` (`alt = fullName`, dimensiones fijas, por ejemplo 480×600 `object-cover`, y `sizes` correcto);
   - `biography` completa, respetando los saltos de párrafo;
   - `location`;
   - `email` (`mailto`);
   - las redes activas con `label` y una etiqueta de `platform` (GITHUB → "GitHub", etc.).
   - Composición SIGNAL: la foto en un marco con regla HUD y coordenadas, no una tarjeta genérica.
   - La escena WebGL no cambia en este plan; el retrato en partículas es otro plan.
2. **`#proyectos`:**
   - Solo los destacados. Si no hay ninguno, los 3 primeros por `displayOrder`.
   - Cada uno con:
     - portada (`next/image` con `width`/`height` del registro);
     - insignia `DESTACADO`;
     - años;
     - chips de skills (enlazan a `/stack/[slug]`);
     - repos con etiquetas del SPEC;
     - demo.
   - Al final, "Ver todos los proyectos (N)" → `/proyectos`, con N = total de publicados.
   - Sin portada se conserva la figura actual.
3. **`#trayectoria`:**
   - Experience: `location`, `employmentType` (OTHER oculto), "actual" si `isCurrent` y `description`.
   - Education: `fieldOfStudy` solo si difiere de `degree`, más `type`, `location`, `description` y "Ver credencial ↗".
   - Ningún separador huérfano.
4. **`#stack`:** `SkillCategory.description` bajo el nombre. Cada skill es un `SkillChip` con icono que enlaza a `/stack/[slug]`.
5. **Hero:** sin cambios de comportamiento; comprueba que el nombre de 4 palabras sigue en 2 líneas.
6. **DEMO:** rellena foto, biografía, portadas, repos, iconos y credencial para que `PORTFOLIO_DEMO=1` muestre todas las secciones.
7. `node scripts/check-schema-coverage.mjs` sin deuda en `/`. Baja el baseline.

## Criterio de terminado
- [ ] `bash scripts/gate.sh` en verde. El JS inicial de `/` sigue ≤ 230 kB gzip y Three.js sigue diferido.
- [ ] `coverage`: 0 parejas sin cubrir en `/` y `meta`.
- [ ] Sin WebGL (`?tier=0`) y en modo lectura, todas las secciones se leen completas.
- [ ] **No ejecutes** `seed:fixture` ni ui-shots contra `:3000`; no mates el servidor. Lo hace el planificador.

## Fuera de alcance
- El retrato en partículas: plan aparte tras la revisión de arte.
- Prisma, dependencias, git y el dashboard.

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-19 | planificador | Creado desde SPEC.md |
