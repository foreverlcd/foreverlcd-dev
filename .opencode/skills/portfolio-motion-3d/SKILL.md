---
name: portfolio-motion-3d
description: Protege la estrategia de movimiento, Anime.js y Three.js de foreverlcd.dev. Úsala al implementar animaciones, la escena topográfica, fallbacks, rendimiento o accesibilidad de movimiento.
---

# Movimiento y 3D — Dossier técnico

## Fuente de verdad

`docs/design-system.md` §11 (movimiento) y §12 (3D). Esta skill no sustituye el documento.

## Principios

1. El movimiento confirma estructura; no decora ni rellena silencios.
2. Una secuencia orquestada por vista como máximo. El hero tiene la suya.
3. Interacción: 160–400 ms. Revelación: 700 ms máximo.
4. Sin ambiente continuo: nada de partículas, tickers, glows pulsantes ni marquesinas de contenido.
5. Sin JS, el contenido debe verse completo. La animación es una mejora.

## Reparto de responsabilidades

- **CSS:** hover, foco, subrayados, botones, nav al scroll, diálogos, toasts, escala de imagen.
- **Anime.js v4:** timeline del hero, revelado de encabezados con `onScroll`, menú móvil, dibujo de reglas SVG.
- **Three.js:** solo la escena del hero. Nada de 3D en secciones internas ni en el dashboard.
- **Nunca Anime.js para:** hover, cambios de color, layout, scroll hijacking, párrafos o letra por letra.

## Anime.js v4: reglas

- Solo en Client Components (`"use client"`), nunca en el layout raíz ni en Server Components.
- API prevista: `animate`, `createTimeline`, `stagger`, `onScroll`, `svg.createDrawable`.
- Comprobar `prefers-reduced-motion` **antes** de crear timelines; si está activo, aplicar el estado final y no animar.
- Cancelar timelines y observers en el cleanup de `useEffect`.
- Animar solo `transform` y `opacity`. No `height`, `width`, `top`, `left`, `box-shadow`, `filter`.
- Máximo 2 timelines activos a la vez. `will-change` temporal y retirado al terminar.

## Three.js: escena «Levantamiento»

- Concepto: curvas de nivel topográficas en línea, hueso sobre tinta, un punto bermellón. No esferas, toros ni cubos.
- Una sola escena, en el hero, decorativa y `aria-hidden="true"`. Nunca es la única vía de información.
- `WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })`.
- `PerspectiveCamera(28, aspect, 0.1, 100)`; terreno paramétrico 32 × 48; 24–32 curvas; < 5 000 vértices.
- `LineBasicMaterial` + `signal-400` para el marcador. Sin luces, sombras, texturas, niebla ni postprocesado.
- Rotación lenta (0.02 rad/s), parallax de puntero ±3°, scroll máximo 0.08 rad. Sin orbit controls.
- DPR máximo 2 en desktop, 1.5 en móvil.
- Pausar con `IntersectionObserver` y `visibilitychange`; reanudar solo al volver a vista.
- `ResizeObserver` para cámara/renderer.

## Fallbacks obligatorios

Usar SVG topográfico estático si:

- no hay WebGL;
- `prefers-reduced-motion: reduce`;
- `navigator.connection.saveData === true`;
- viewport < 768 px;
- `navigator.deviceMemory <= 4`.

`navigator.deviceMemory` y `navigator.connection.saveData` son opcionales. Si no existen, continuar con el render normal; nunca lanzar errores ni bloquear el sitio.

El SVG es también el poster inicial y el LCP. El canvas aparece con crossfade de 300 ms cuando está listo.

## Presupuesto y limpieza

- Chunk 3D ≤ 180 KB gzip, fuera del critical path; importar tras el primer render o al entrar en viewport.
- 60 fps objetivo en desktop; 30 fps aceptable en móvil. Si no se sostiene, SVG.
- Limpieza: `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, `setAnimationLoop(null)`, remover listeners y observers.
- Sin fugas de memoria al navegar fuera del hero.

## Accesibilidad

- Todo el contenido funciona sin 3D y sin animación.
- `prefers-reduced-motion` desactiva parallax, rotación, stagger y transiciones.
- Sin flashing, sin movimiento de alta frecuencia, sin mareos.
- El foco visible no depende de la animación.
- Los videos no se autorreproducen con sonido y llevan subtítulos.

## Checklist de revisión

- [ ] ¿El movimiento revela algo o solo decora?
- [ ] ¿Se anima solo transform/opacity?
- [ ] ¿Respeta `prefers-reduced-motion` y `saveData`?
- [ ] ¿El SVG fallback se ve intencional?
- [ ] ¿La escena se pausa fuera de vista y limpia recursos?
- [ ] ¿El texto no se superpone a la escena?
- [ ] ¿Se probó a 1440, 1024 y 390 px?
- [ ] ¿El LCP es el titular/SVG, no el canvas?
- [ ] ¿La escena fue aprobada visualmente antes de considerarse definitiva?

## Alcance

En la Etapa 2.1 no se instala ni se implementa Anime.js ni Three.js. Esta skill se activa en la Etapa 3, después de aprobar los fundamentos visuales.
