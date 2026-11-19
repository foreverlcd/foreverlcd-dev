---
name: portfolio-art-direction
description: Protege la dirección artística «Dossier técnico» de foreverlcd.dev al implementar o revisar interfaz pública, dashboard, componentes, tokens o estilos. Úsala antes de tocar UI y cuando haya dudas de paleta, tipografía, composición o anti-patrones.
---

# Dirección artística — Dossier técnico

## Fuente de verdad

`docs/design-system.md` es el contrato visual. Esta skill es un recordatorio operativo, no una copia. Si hay conflicto, gana el documento.

Antes de implementar UI, lee al menos:

- §4 Dirección recomendada y principios.
- §5 Tokens.
- §6 Tipografía.
- §7 Composición.
- §8 Componentes.
- §19 Contraste.

## Identidad que no se negocia

- **Dossier técnico:** papel para leer, tinta para operar. Dos superficies con significado, no un tema conmutable.
- **Una sola señal:** bermellón `signal-500`/`signal-600`/`signal-700` según superficie y tamaño. Máximo 10 % de un viewport.
- **Tres voces:** Newsreader (display, ≥20 px), Archivo (lectura/UI), IBM Plex Mono (datos, índices, etiquetas).
- **Retícula asimétrica:** 12 columnas en desktop, relaciones 7/5, 8/4, 4/7+offset. Nunca todo centrado.
- **Reglas, índices y folios** hacen el trabajo visual. El adorno no compensa la falta de estructura.
- **Firma:** índices `01–07`, regla de señal de 2 px, wordmark + cuadrado bermellón, pie `FIG. 01`, colofón.

## Paleta: reglas duras

- Superficies: `paper-100` y `ink-950`; elevadas: `paper-200` e `ink-900`.
- Texto: `graphite-900`/`graphite-600` en papel; `paper-50`/`bone-300` en tinta.
- Acento de texto: `signal-700` en papel; `signal-400` en tinta.
- `signal-600` en papel solo para gráficos, iconos o texto ≥24 px (4.33:1, no AA normal).
- Peligro: `#B42318` en papel, `#F87171` en tinta. Nunca confundir peligro con la señal de marca.
- Prohibido: negro puro, blanco puro, gradientes decorativos, glows, glassmorphism, opacidad para texto atenuado.

## Tipografía: reglas duras

- No vuelvas a Geist. No añadas otra familia sin justificarlo y documentarlo.
- Newsreader nunca por debajo de 20 px. Una sola palabra en cursiva por titular, no párrafos completos.
- Archivo para cuerpo y controles. IBM Plex Mono para metadatos, no para párrafos.
- Medida de lectura: `max-w-text` (42rem). Titulares de 3–4 líneas como máximo.
- Etiquetas mono en mayúsculas con tracking; cuerpo en sentence case.
- Español correcto: `¿¡`, `«»`, `—`, `…`; fechas y números con `es-PE`.

## Componentes

- Usa los primitivos de `src/components/ui/` antes de crear otro.
- Consume tokens semánticos (`bg-surface`, `text-fg`, `border-rule`, `text-accent-text`, `border-stroke-strong`), no HEX ni colores crudos.
- Botones: 2 px de radio, sin pills, sin `scale`, sin sombra. Primario adapta su superficie con `--control-strong-*`.
- Listados de proyectos, experiencia y formación: filas/ledgers, no tarjetas.
- Tarjetas solo en admin para métricas o formularios discretos; 1 px de borde, 0 sombra.
- Imágenes: `Plate`, 1 px de marco, sin esquinas redondeadas, pie de figura obligatorio.
- Estados vacíos: `EmptyState` con índice/etiqueta y frase serena; nunca ilustración de error.

## Anti-patrones (rechazar de inmediato)

- Hero de dos columnas con tarjeta brillante.
- Dark + cian + glow como identidad.
- Pills para todo, tarjetas para listar contenido.
- Gradientes morados/azules, blur ambiental, partículas decorativas.
- Animación de letra por letra, typewriter, parallax en texto, cursor personalizado.
- Barras de porcentaje de habilidades, métricas o testimonios inventados.
- Copiar la composición de un portfolio conocido.

## Portfolio y dashboard

Comparten tipografía, reglas, señal y economía de color; no comparten composición.

- Portfolio: papel dominante, asimetría editorial, aire.
- Dashboard: tinta dominante, densidad mayor, sidebar, tablas y formularios; misma disciplina.
- Auth: hoja de papel sobre tinta. Preview: banner de señal `VISTA PREVIA · BORRADOR`.

## Checklist antes de dar UI por terminada

- [ ] ¿Se usa `data-surface` y tokens semánticos?
- [ ] ¿El bermellón aparece una sola vez por sección?
- [ ] ¿Los textos pequeños usan `signal-700`/`signal-400`, no `signal-600`?
- [ ] ¿Hay foco visible en todos los controles?
- [ ] ¿Funciona a 320 px y con zoom 200 %?
- [ ] ¿Los vacíos se ven intencionales?
- [ ] ¿Se evitó una tarjeta donde correspondía una fila?
- [ ] ¿El movimiento tiene propósito y respeta `prefers-reduced-motion`?

## Si falta una decisión

No improvises una variante. Detente, documenta el caso en `docs/design-system.md` (sección 20, registro de cambios) y pide aprobación. La consistencia vale más que la novedad.
