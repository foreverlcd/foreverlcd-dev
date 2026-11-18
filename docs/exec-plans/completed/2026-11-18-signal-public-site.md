# Portada SIGNAL / ESTRUCTURA (sitio público)

- **Área:** sitio público + escena WebGL
- **Dificultad:** alta (Sonnet implementer; el planificador verifica con GPU y art-reviewer)
- **Rama:** feat/runtime-experience (sin commit; integra el planificador)

## Objetivo
Sustituir la portada "Runtime", que el dueño rechazó, por la dirección vinculante de `docs/ART-DIRECTION.md`: partículas GPGPU (SIGNAL) dentro de una estructura atmosférica (MEGASTRUCTURE). Debe funcionar en todos los dispositivos, con niveles T2/T1/T0, y mostrar contenido real de `loadPortfolio()`.

## Contexto mínimo
- `docs/ART-DIRECTION.md` (vinculante: paleta, tipos, niveles, presupuestos, prohibiciones).
- `docs/ARCHITECTURE.md` (capas, caché estática, capa WebGL) y `docs/GOLDEN-PRINCIPLES.md`.
- Prototipos de referencia, que se portan sin copiar a ciegas:
  - `docs/art/prototypes/signal.html`: simulación de partículas, objetivos desde texto, HUD, `go(idx)`, puntero/táctil, `fallback()`, `step()`.
  - `docs/art/prototypes/megastructure.html`: atmósfera por sección (`sectionTargets`, keyframes tint/fog/beam/yaw/roll) y niebla/haces.
- Código actual que se conserva y reutiliza:
  - `src/server/portfolio/load-portfolio.ts` (tipo `Portfolio`, con trace) y `demo-portfolio.ts`.
  - `src/components/runtime/bus.ts` (bus DOM → escena, `readMotionPreference`, modo lectura) y `format.ts`.
  - `src/components/runtime/reading-toggle.tsx`, `trace-log.tsx`, `visit-timing.ts`, `visit-waterfall.tsx`.
- Three.js r187 y Anime.js 4.5: verifica cada API en `node_modules/three/src/**` y `node_modules/animejs/dist/**/*.d.ts` antes de usarla. Para fuentes e imágenes, `node_modules/next/dist/docs/`.

## Archivos a tocar
- NUEVO `src/components/signal/**`:
  - `signal-page.tsx`: Server Component con las secciones.
  - `signal-stage.tsx`: cliente; carga diferida de la escena y `data-scene data-status`.
  - `signal-director.tsx`: Anime.js; entradas, atmósfera por sección, scramble del HUD.
  - `hud.tsx` y `signal.css`.
  - `scene/signal-scene.ts`, `scene/shaders.ts`, `scene/targets.ts` (figuras desde texto y SDF), `scene/tiers.ts` (detección y degradación).
- Mover a `src/components/signal/` los 7 archivos que se conservan de `src/components/runtime/`:
  - `bus.ts`, `format.ts`, `reading-toggle.tsx`, `trace-log.tsx`, `visit-timing.ts`, `visit-waterfall.tsx` (con sus imports actualizados).
  - `bus.ts` puede ampliar su tipo de eventos.
- `src/app/page.tsx`: renderiza `<SignalPage portfolio={...} />`; conserva `revalidate` y `generateMetadata`.
- `src/app/layout.tsx`: fuentes Unbounded 700, Geist 400/500 y Geist Mono 400/500 vía `next/font/google`, como variables CSS; quita Newsreader, Archivo y IBM Plex Mono si nadie más las usa.
- `src/app/globals.css`: solo tokens nuevos de la paleta. No rompas los estilos del dashboard (`data-surface="ink"`); si algún token del admin desaparece, mantenlo.
- `src/app/proyectos/[slug]/page.tsx`: solo estilos para que use la nueva paleta y tipografía; sin cambiar los datos.
- BORRAR, tras comprobar con grep que nada más los importa:
  - `src/components/runtime/` completo (graph, canvas, director, page, css, scene).
  - `src/components/site/`.

## Pasos
1. **Estructura y contenido (sin WebGL).** `signal-page.tsx` renderiza en HTML real, en este orden:
   - `#inicio`: nombre, titular, bio breve, CTA "Ver proyectos" y contacto.
   - `#proyectos`: lista tipográfica grande con título, una línea, stack, años, enlaces demo/repos y enlace a `/proyectos/[slug]`; color de señal rotando `signal → uv → coral`.
   - `#trayectoria`: experiencia y formación activas.
   - `#stack`: categorías con skills.
   - `#contacto`: email y redes activas.
   - `#traza`: `TraceLog` + `VisitWaterfall` presentados como lectura del instrumento.
   - Estado sin perfil publicado: "En compilación" con la traza (feature `pub-waiting`).
   - Datos solo de `Portfolio`: no inventes contenido.
   - El HUD es `aria-hidden` y no lleva información que no esté también en el DOM accesible.
2. **Responsive de 320 a 2560 px** según "Todos los dispositivos" de `ART-DIRECTION.md`:
   - `clamp()`, `100svh`, safe-area, teléfono en horizontal.
   - En ≤ 760 px, HUD mínimo y barra inferior fija con 3 enlaces de ≥ 44 px.
   - Foco visible en `--signal`.
3. **Niveles** (`scene/tiers.ts`):
   - Detección inicial T2/T1/T0, como en el documento.
   - Degradación adaptativa: más de 22 ms de frame medio durante 2 s baja un nivel sin recargar.
   - `data-status` en el contenedor `[data-scene]`, con valores `loading | running | fallback | reduced | reading`.
   - T0 = sin canvas, con el nombre en Unbounded y una textura de puntos en CSS/SVG.
4. **Escena** (`scene/signal-scene.ts`), portada del prototipo SIGNAL:
   - Ping-pong de posición y velocidad en render targets de float (256² en T2, 128² en T1).
   - Objetivos generados desde texto con Unbounded ya cargada (`document.fonts.load`): nombre, una figura por proyecto (texto corto o SDF procedural) y una por sección.
   - Dispersión por puntero; en táctil, arrastrar dispersa y soltar reensambla.
   - Capa MEGASTRUCTURE solo en T2: planos y vigas en la lejanía con niebla y haces falsos, en una pasada a ≤ 0.5 de resolución. En T1 solo niebla y tinte.
   - Uniforms de atmósfera por sección: `uTint`, `uFog`, `uBeam`, yaw y roll de cámara.
   - Requisitos de robustez:
     - Pausa con `visibilitychange` e IntersectionObserver.
     - Pérdida de contexto: dos veces → T0.
     - `dispose()` que libera todo.
     - DPR limitado por nivel.
   - Three.js se carga con `import()` tras `requestIdleCallback`, nunca en el bundle inicial.
5. **Director** (`signal-director.tsx`, Anime.js):
   - Entrada: ruido → nombre, `splitText` en el hero, `scrambleText` en el HUD.
   - Atmósfera por sección interpolando los uniforms.
   - Proyecto activo: hover o foco con puntero, o el proyecto centrado en pantalla en táctil.
   - Movimiento reducido: cambios por corte, sin scramble ni cámara.
   - Modo lectura: sin escena.
   - Se comunica con la escena solo a través del bus.
6. **Limpieza.** Borra `src/components/runtime/` y `src/components/site/` (ver "Archivos a tocar") y actualiza `scripts/ui-plans/smoke.json` solo si cambian los selectores. Ese es el único archivo de `scripts/` permitido.

## Criterio de terminado
- [ ] `node scripts/check-boundaries.mjs`, `node_modules/.bin/tsc --noEmit` y `node_modules/.bin/eslint` limpios.
- [ ] Ninguna línea > 140 caracteres en los archivos nuevos.
- [ ] Sin `three` en el bundle inicial; el gate de presupuestos lo comprueba (el planificador ejecuta el build).
- [ ] Con WebGL2 desactivado, toda la información queda visible.
- [ ] Docs: ninguno (el planificador actualiza `ARCHITECTURE.md`, `PROGRESS.md` y `feature_list.json`).
- [ ] El planificador verifica:
  - `PORTFOLIO_DEMO=1`, con `GPU=1 node scripts/ui-shots.mjs` a 360×740, 390×844, 768×1024, 1024×768, 1440×900 y 2560×1440, además de reduced.
  - Revisión del `art-reviewer`.

## Fuera de alcance
Dashboard (`src/app/admin/**`, `src/components/admin/**`, `src/server/actions/**`: otro agente trabaja ahí en paralelo, NO los toques), esquema Prisma, DAL, dependencias nuevas, commits. No ejecutes `scripts/gate.sh` completo ni `pnpm build`: otro agente comparte `.next`; el planificador construye.

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-18 | planificador | Creado tras la elección del dueño (SIGNAL + MEGASTRUCTURE, todos los dispositivos) |
