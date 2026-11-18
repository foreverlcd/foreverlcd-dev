# Dirección de arte — SIGNAL / ESTRUCTURA

> **Estado (2026-11-18):** VINCULANTE. Elegida por el dueño entre tres prototipos: base **SIGNAL** con elementos de **MEGASTRUCTURE**, y requisito explícito de verse bien en **todos los dispositivos**.
> Prototipos de referencia: `docs/art/prototypes/signal.html` (base) y `megastructure.html` (acentos); `spectra.html` descartado. Cambiar esta dirección requiere preguntar al dueño (`AGENTS.md`).

## Concepto
El portfolio es un **instrumento que lee una señal**. Unas 65 000 partículas calculadas en la GPU forman el nombre del dueño, se dispersan con el cursor o el dedo y se recomponen. Al bajar por la página, la cámara atraviesa una **estructura** oscura, con niebla y haces de luz, que cambia de atmósfera en cada sección. Cada proyecto tiene una forma y un color de señal propios. Alrededor, un HUD de instrumento (reglas, coordenadas, estado, flujo) da el tono de ingeniería.

| De SIGNAL (base) | De MEGASTRUCTURE (acentos) |
|---|---|
| Partículas GPGPU que forman texto y figuras; dispersión por puntero; reensamblado | Profundidad: niebla, haces volumétricos falsos, planos y vigas estructurales en la lejanía |
| HUD: reglas X/Y, coordenadas, estado, flujo, sección `00/03` | Una "atmósfera" por sección (tinte, densidad de niebla, ángulo y rol de cámara) interpolada con Anime.js |
| Lista de proyectos tipográfica, enorme y legible | Color de señal por proyecto: lima, ultravioleta, coral |
| Retícula y cursor de mira (solo con puntero fino) | Unbounded como display del nombre y los títulos |

## Paleta
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#050507` | fondo; nunca negro puro en grandes planos con niebla, sí en el lienzo |
| `--fog` | `#0B0A14` | niebla y superficies profundas (tinte UV) |
| `--ink` | `#E8F0F2` | texto principal |
| `--ash` | `#7C8388` | HUD, metadatos (contraste ≥ 4.5:1 sobre `--bg` en texto ≥ 12 px) |
| `--signal` | `#D4FF3A` | acento primario: estado, foco, enlaces activos, partículas en reposo |
| `--uv` | `#7B5CFF` | acento secundario: profundidad, haces, segunda señal de proyecto |
| `--coral` | `#FF4D2E` | tercera señal de proyecto y alertas; nunca más de un elemento coral a la vez en pantalla |

El color de cada proyecto rota `signal → uv → coral` según su orden. No hay gradientes decorativos: los únicos gradientes salen de la luz de la escena.

## Tipografía (`next/font/google`, auto-hospedada)
- **Unbounded** (700): nombre y H2. También es la fuente de la que se muestrean las partículas, así que debe estar cargada antes de generar los objetivos (`document.fonts.load`).
- **Geist** (400/500): texto, descripciones, lista de proyectos.
- **Geist Mono** (400/500): HUD, etiquetas, stack, números.

## Movimiento (Anime.js 4.5 = coreógrafo; Three.js = escena)
- **Entrada:** las partículas pasan de ruido a nombre (≈ 1.6 s) mientras `scrambleText` revela el HUD y `splitText` las líneas del hero. El texto real del DOM es legible desde el primer pintado; la escena se le suma, nunca lo bloquea.
- **Sección:** al entrar en una sección, Anime.js interpola los uniforms de la atmósfera (tinte, niebla, haces, yaw/roll de cámara) y las partículas cambian de figura.
- **Proyecto:** con hover/foco (puntero) o el proyecto centrado en pantalla (táctil), las partículas forman la figura del proyecto con su color de señal.
- **Puntero:** dispersión radial y estela. En táctil, arrastrar dispersa y soltar reensambla. Nada de la experiencia depende de hover.
- **Movimiento reducido:** sin cámara ni morph animado. Las figuras cambian por corte y la escena queda casi estática.

## Todos los dispositivos (vinculante)
| Nivel | Cuándo | Escena |
|---|---|---|
| **T2 escritorio** | puntero fino, ≥ 8 núcleos o GPU no móvil | sim 256² (65 536), DPR ≤ 1.75, capa de estructura y haces, estela |
| **T1 móvil/tableta** | `pointer: coarse`, ancho ≤ 1024, ≤ 4 núcleos o `deviceMemory` ≤ 4 | sim 128² (16 384), DPR ≤ 1.5, sin estructura (solo niebla y tinte), sin estela |
| **T0 estático** | sin WebGL2, `Save-Data`, modo lectura, contexto perdido 2 veces o FPS < 24 sostenido en T1 | sin canvas: nombre en Unbounded con textura de puntos en CSS/SVG, mismo HUD y todo el contenido |

- **Degradación adaptativa:** si el frame medio supera 22 ms durante 2 s, se baja un nivel (T2→T1→T0) sin recargar. No se vuelve a subir en la misma visita.
- Pausa del bucle con `visibilitychange` y cuando el hero y la escena no son visibles; liberación completa en `dispose`.
- **Diseño fluido de 320 px a 2560 px:** `clamp()` para tipos, `100svh`/`100dvh` en el hero, `env(safe-area-inset-*)`, orientación horizontal en teléfonos sin que el texto se tape. En ≤ 760 px el HUD se reduce a lo esencial (estado y sección); la navegación pasa a una barra inferior fija de 3 enlaces con objetivos táctiles ≥ 44 px.
- Teclado: todo es alcanzable con Tab, el foco es visible (contorno `--signal`) y el foco en un proyecto equivale al hover.

## Legibilidad para reclutadores (no negociable)
En < 2 s y sin WebGL: nombre, rol, stack principal, enlace a proyectos y contacto. La lista de proyectos es HTML real (título, una línea, stack, enlaces). El detalle `/proyectos/[slug]` es una página normal, legible y compartible. El modo lectura (conservado de la dirección anterior) apaga la escena.

## Presupuestos técnicos
| Recurso | Límite |
|---|---|
| JS inicial de `/` (gzip) | ≤ 230 kB (`scripts/check-budgets.mjs`) |
| Three.js en el bundle inicial | 0 (`import()` tras `requestIdleCallback`) |
| `devicePixelRatio` del canvas | ≤ 1.75 (T2), ≤ 1.5 (T1) |
| Partículas GPGPU | 256² (T2), 128² (T1) |
| Capa de estructura | 1 pasada a ≤ 0.5 de resolución, solo T2 |
| Texturas o modelos externos | ninguno (todo procedural; las figuras de proyecto se generan de texto o SDF) |
| Fuentes | 3 familias, `display: swap`, subconjunto latin |
| Tiempo hasta contenido legible | < 2 s sin depender de WebGL |
| Rendimiento medido | con GPU real (`GPU=1 node scripts/ui-shots.mjs …`): ≥ 55 fps en T2 a 1440×900 |

## Prohibido
Esferas 3D genéricas, partículas sin función (cada estado de las partículas representa contenido), gradientes decorativos, look de dashboard SaaS, glassmorphism, efectos que tapen texto, hover como única vía a la información.

## Lecciones
- La dirección "Runtime" (serif editorial, tinta y bermellón, grafo de líneas finas) fue rechazada por no ser futurista. Se conservan como capacidades la traza real, el modo lectura, la carga diferida y el bus DOM → escena.
- Validar la dirección con prototipos comparables antes de tocar `src/`.
