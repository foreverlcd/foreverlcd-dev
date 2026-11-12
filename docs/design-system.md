# Sistema de diseño — foreverlcd.dev

> **Estado:** propuesta para aprobación · Etapa 1
> **Fecha:** 12 de noviembre de 2026
> **Alcance:** portfolio público + dashboard administrativo
> **Naturaleza:** documento de dirección y contrato visual. No implementa interfaz.
> **Fuente de verdad:** cualquier sesión que implemente la Etapa 2 debe partir de este documento y no reinterpretar la identidad.

---

## 0. Resumen ejecutivo

La dirección recomendada es **Dossier técnico**: un portfolio que se lee como un expediente de ingeniería bien editado.

- **Dos superficies con significado:** papel hueso para leer; tinta azul-negro para el instrumento, los medios y el dashboard.
- **Una sola señal:** bermellón de lápiz corrector, usado con avaricia.
- **Tres voces tipográficas:** serif editorial para la escala, grotesca para la lectura, mono para los datos.
- **Composición asimétrica de 12 columnas**, con índices, folios, reglas y anotaciones al margen.
- **Movimiento editorial**, no ambiental: revela estructura, no decora.
- **3D secundario y propio:** un levantamiento topográfico en línea sobre la portada de tinta, con fallback SVG inmediato.

La hipótesis previa —instrumento de precisión, azul marino, cian y turquesa— se evaluó y se conserva en su idea central (precisión, instrumento, retícula), pero se descarta su superficie: el dark+cian con glows es hoy el aspecto por defecto de decenas de portfolios generados. El resultado propuesto es más difícil de confundir, más legible y más duradero.

---

## 1. Contexto y restricciones

### 1.1 Producto

- Portfolio personal en español, orientado a oportunidades de **Full Stack, Frontend, Backend e IA aplicada**.
- Un único administrador. Registro público deshabilitado.
- Portfolio público + dashboard privado para proyectos, repositorios, habilidades, experiencia, formación, perfil, enlaces e imágenes.
- Cloudinary para medios; PostgreSQL + Prisma 7; Better Auth 1.7.
- Next.js 16.4.3, React 19.3, TypeScript, Tailwind CSS 4.

### 1.2 Restricciones técnicas reales

| Restricción | Consecuencia de diseño |
|---|---|
| Tailwind 4 CSS-first, sin `tailwind.config.js` | Los tokens viven en `@theme` dentro de `globals.css`. No se crean configuraciones paralelas. |
| `next/font/google` disponible | Las familias se cargan con `next/font`, con subsets `latin`, `display: swap` y variables CSS. |
| Server Components por defecto | La mayoría del sitio es estático/servidor. El cliente se reserva para navegación, menú, formularios y 3D. |
| Prisma con campos opcionales | El diseño debe funcionar sin foto, sin portada, sin URL, sin descripción y sin fechas. |
| Cloudinary | Las imágenes llegan con dimensiones y `alt`; el diseño no depende de recortes perfectos. |
| Sin librería de componentes | Los primitivos se construyen a mano; no se hereda una estética ajena. |
| Tres.js y Anime.js aún no instalados | El documento define su papel y presupuesto; la instalación ocurre en Etapas 2–3. |

### 1.3 Contenido disponible y estados vacíos

Hoy la base de datos no tiene contenido público. El sistema debe verse intencional en tres situaciones:

1. **Desarrollo:** datos ficticios claramente marcados con una etiqueta `DEMO` visible. Nunca se mezclan con contenido real.
2. **Producción con perfil publicado pero secciones vacías:** las secciones sin contenido **no se renderizan** y desaparecen del índice y de la navegación. No se muestran cinco bloques vacíos.
3. **Producción sin perfil publicado:** página de espera sobria, con wordmark, una frase de estado y el canal de contacto si existe. Sin secciones fantasma.

El detalle de estos estados está en §9 y §15.

---

## 2. Criterios de evaluación

Cada dirección se puntúa de 1 a 5 en:

1. **Identidad:** ¿se recuerda y se distingue de la categoría?
2. **Legibilidad:** ¿funciona para textos largos, metadatos y pantallas pequeñas?
3. **Coherencia:** ¿el portfolio y el dashboard pueden pertenecer al mismo producto?
4. **Viabilidad técnica:** ¿se implementa con el stack actual sin deuda desproporcionada?
5. **Utilidad profesional:** ¿ayuda a que un reclutador o cliente entienda el trabajo?
6. **Durabilidad:** ¿seguirá pareciendo vigente en tres años?
7. **Accesibilidad:** ¿el contraste, el foco y el movimiento son defendibles?
8. **Movimiento/3D:** ¿la dirección da un papel claro y no decorativo a Anime.js y Three.js?

No se premia la facilidad de implementación. Se premia la claridad del sistema.

---

## 3. Direcciones evaluadas

### 3.1 Dirección A — Instrumento de precisión (hipótesis refinada)

**Concepto.** El portfolio como un instrumento calibrado: panel oscuro, retícula de cristal líquido, telemetría, anotaciones HUD. La pantalla es un dispositivo que mide el trabajo.

**Paleta.** Tinta `#05080B`, azul marino `#0B1220`, cian `#22D3EE`, turquesa `#2DD4BF`, hueso `#E8E4D9`.

**Tipografía.** Grotesca técnica para titulares (p. ej. Space Grotesk), mono para datos (JetBrains Mono), serif solo como acento.

**Composición.** 12 columnas, full-bleed oscuro, reglas cian de 1 px, etiquetas HUD, esquinas con marcas de registro.

**Imágenes.** Oscuras, luminosas, enmarcadas como lecturas de instrumentos; overlays cian.

**Componentes.** Paneles, pills, LEDs de estado, glows suaves, bordes luminosos.

**Movimiento.** Ambiente continuo: partículas, líneas de escaneo, desplazamientos ligados al scroll.

**3D.** Protagonista, a sangre, objeto central del hero.

**Fortalezas.**
- Coherencia inmediata con Three.js.
- Impacto visual en los primeros cinco segundos.
- Lenguaje familiar para una audiencia técnica.

**Debilidades.**
- Es la estética por defecto del portfolio dev/IA de 2023–2026: dark + cian + glow.
- El movimiento ambiental compite con la lectura y envejece rápido.
- El texto largo sobre negro exige más cuidado; los estados vacíos parecen «sistema caído».
- El HUD y los glows son decoración con disfraz de función.

**Veredicto.** Se descarta como dirección principal. Se conservan la metáfora del instrumento, la superficie de tinta y la retícula; se eliminan neón, glows y telemetría decorativa.

---

### 3.2 Dirección B — Dossier técnico (recomendada)

**Concepto.** Un expediente de ingeniería encuadernado: portada de tinta, interior de papel, índices, folios, reglas, anotaciones de lápiz rojo y láminas de proyecto. El portfolio no simula una máquina: **es el documento que produce alguien que sabe construir**.

**Paleta.** Papel hueso `#F1EADC`, tinta `#070B0F`, grafito `#1B2126`, bermellón `#E04E1F`, hueso claro `#F7F2E9`.

**Tipografía.** Serif editorial (Newsreader) para titulares y citas; grotesca (Archivo) para lectura e interfaz; mono (IBM Plex Mono) para índices, fechas, etiquetas y código.

**Composición.** 12 columnas asimétricas, cortes duros entre papel y tinta, reglas de 1 px, numeración de sección, textos al margen, láminas con pie de figura.

**Imágenes.** Láminas naturales, sin filtros, con marco de 1 px y pie de figura. La ausencia de imagen se resuelve con una lámina tipográfica, no con un placeholder gris.

**Componentes.** Filas de registro (*ledger*), fichas de proyecto, reglas, etiquetas mono, formularios de línea. Sin tarjetas, sin sombras, sin glassmorphism.

**Movimiento.** Entradas editoriales breves, subrayados que se dibujan, una sola secuencia orquestada en el hero. Nada de ambiente continuo.

**3D.** Secundario y compositivo: un levantamiento topográfico en línea sobre la portada de tinta, con versión SVG estática.

**Fortalezas.**
- Se distingue de la categoría sin ser estridente.
- Excelente legibilidad para biografía, casos de estudio y metadatos.
- Los estados vacíos se sienten como campos deliberadamente en blanco.
- Coherencia natural con un dashboard: la misma tipografía y reglas, superficie de tinta.
- Durable: se apoya en tipografía, retícula y contraste, no en efectos de moda.
- Funciona sin fotografía y sin proyectos: la estructura sostiene el contenido.

**Debilidades.**
- Exige disciplina tipográfica y de espaciado; no perdona la improvisación.
- Puede leerse como «estudio de diseño» si el copy no tiene criterio técnico.
- El 3D debe componerse con cuidado para no romper la lógica de papel.
- Requiere más decisiones de composición que una plantilla oscura.

**Veredicto.** Recomendada.

---

### 3.3 Dirección C — Señal / broadcast editorial

**Concepto.** Una transmisión en vivo: póster, titular condensado gigante, cinta de datos, sellos, alto contraste y energía de imprenta.

**Paleta.** Negro `#0A0A0A`, hueso `#F5F1E8`, lima ácida `#D7FF3E`, naranja `#FF4D00`.

**Tipografía.** Display condensada (Anton o Archivo Black), mono para datos, todo en mayúsculas.

**Composición.** Cartel de 12 columnas con solapamientos intencionales, titulares que sangran, marquesinas y sellos.

**Imágenes.** Alto contraste, recortes agresivos, semitono.

**Componentes.** Cintas, sellos, adhesivos, números enormes, botones tipo bloque.

**Movimiento.** Ticker, transiciones rápidas, distorsión al hover.

**3D.** Señal abstracta o ruido; el 3D es un gag visual.

**Fortalezas.**
- Energía inmediata y alta memorabilidad.
- Muy compartible en redes.

**Debilidades.**
- Demasiado ruido para un contexto de contratación.
- La lima sobre papel no cumple contraste para texto; el sistema depende de bloques.
- Envejece con el ciclo del brutalismo web.
- Difícil de sostener en casos de estudio largos y en un dashboard sobrio.
- El 3D queda decorativo.

**Veredicto.** Se descarta. Se toma prestada la confianza en la escala tipográfica, no la estridencia.

---

### 3.4 Comparación

| Criterio | A — Instrumento | B — Dossier | C — Señal |
|---|---:|---:|---:|
| Identidad diferencial | 3 | **5** | 4 |
| Legibilidad | 3 | **5** | 2 |
| Coherencia portfolio/dashboard | 4 | **5** | 3 |
| Viabilidad técnica | 4 | **5** | 3 |
| Utilidad profesional | 3 | **5** | 2 |
| Durabilidad | 3 | **5** | 2 |
| Accesibilidad | 3 | **5** | 2 |
| Movimiento/3D | **5** | 4 | 4 |

La puntuación no es una fórmula: es un resumen de la argumentación anterior. B gana por margen amplio en los criterios que más importan para un portfolio de contratación; A solo gana en el criterio menos importante a largo plazo.

---

## 4. Dirección recomendada

### 4.1 Concepto

**«Dossier técnico»: el trabajo de un ingeniero, editado como un documento de precisión.**

La página se comporta como un expediente:

- Una **portada de tinta** con el instrumento (3D) y los datos de identificación.
- Un **interior de papel** donde se leen perfil, proyectos, trayectoria y formación.
- Una **lámina de especímenes** en tinta para las habilidades.
- Un **colofón** en tinta para el cierre y el contacto.

El dashboard no es otro producto: es el **panel de control del instrumento**, en tinta, con la misma tipografía, las mismas reglas y la misma economía de color.

### 4.2 Principios

1. **La estructura es el adorno.** Reglas, índices, folios y retícula hacen el trabajo visual; no se añaden efectos para compensar.
2. **Una señal por sección.** El bermellón aparece una vez: una regla, un estado, un enlace activo. Si hay dos, sobra uno.
3. **Papel para leer, tinta para operar.** La superficie comunica el modo: lectura o instrumento.
4. **El contenido manda, pero la composición tiene opinión.** Asimetría, escala y silencio; no bloques centrados intercambiables.
5. **El vacío es un estado, no un error.** Un campo sin contenido se diseña como una lámina en blanco con su etiqueta.
6. **El movimiento confirma, no entretiene.** Si se quita, la interfaz sigue siendo clara.
7. **El 3D es un instrumento, no un fondo.** Tiene una función compositiva y un fallback que también es bello.
8. **Nada de plantilla.** Se prohíben los patrones de §4.3.

### 4.3 Firma visual (lo que hace reconocible al sitio)

1. **Corte de superficie:** paso duro de papel a tinta, siempre con una regla de 1 px y un tic de señal de 2 px × 24 px.
2. **Índice de sección:** `01`, `02`, `03` en mono, alineado al margen, con una regla vertical corta.
3. **Titular serif de gran escala** con una sola palabra en cursiva; nunca todo el titular en cursiva.
4. **Regla de señal:** segmento bermellón de 2 px que marca el inicio de una sección o el estado activo.
5. **Wordmark:** `foreverlcd` en Archivo 600, minúsculas, con un cuadrado bermellón de 5 px al final (no un punto).
6. **Pie de figura:** `FIG. 01 — descripción` en mono de 10 px, bajo cada lámina.
7. **Colofón:** cierre en tinta con datos de versión, ubicación y última actualización.

**Prohibiciones explícitas.**

- Hero con texto a la izquierda y tarjeta brillante a la derecha.
- Gradientes decorativos, glows, glassmorphism, blur ambiental.
- Tarjetas para listar proyectos, experiencia o formación.
- Pills para todo; solo se permiten etiquetas rectangulares de 2 px de radio.
- Iconos rellenos, emojis como iconos, ilustraciones 3D genéricas (esferas, toros, cubos flotantes).
- Animaciones de letra por letra, typewriter, parallax en texto, cursor personalizado, scroll hijacking.
- Métricas inventadas, barras de porcentaje de habilidad, testimonios ficticios.
- Modo oscuro conmutables: las superficies son composición, no un tema.

---

## 5. Tokens

### 5.1 Color

#### Paleta cruda

| Token | HEX | Uso |
|---|---|---|
| `ink-950` | `#070B0F` | Fondo de tinta principal |
| `ink-900` | `#0B1117` | Superficie de tinta elevada |
| `ink-800` | `#121B23` | Filas/hover en tinta |
| `ink-700` | `#1B2732` | Reglas en tinta |
| `ink-600` | `#26343F` | Bordes decorativos en tinta |
| `paper-50` | `#F7F2E9` | Texto principal sobre tinta |
| `paper-100` | `#F1EADC` | Fondo de papel principal |
| `paper-200` | `#E6DCCB` | Superficie de papel alterna |
| `paper-300` | `#D5C8B4` | Reglas decorativas en papel |
| `graphite-900` | `#1B2126` | Texto principal sobre papel |
| `graphite-700` | `#3C454C` | Texto secundario fuerte |
| `graphite-600` | `#596168` | Texto atenuado y bordes de control |
| `graphite-400` | `#8B949B` | Texto deshabilitado / placeholder decorativo |
| `bone-300` | `#CFC4B1` | Texto atenuado sobre tinta |
| `signal-700` | `#9F3A10` | Texto de enlace sobre papel |
| `signal-600` | `#C2410C` | Foco y gráficos sobre papel |
| `signal-500` | `#E04E1F` | Marca, botón hover, regla de señal |
| `signal-400` | `#FF6B3D` | Texto y foco sobre tinta |

#### Tokens semánticos por superficie

| Token | Papel | Tinta |
|---|---|---|
| `surface` | `paper-100` | `ink-950` |
| `surface-raised` | `paper-200` | `ink-900` |
| `fg` | `graphite-900` | `paper-50` |
| `fg-muted` | `graphite-600` | `bone-300` |
| `rule` | `paper-300` | `ink-700` |
| `border-strong` | `#596168` | `#5F6E79` |
| `accent-graphic` | `signal-600` | `signal-400` |
| `accent-text` | `signal-700` | `signal-400` |
| `focus` | `signal-600` | `signal-400` |

#### Estados

| Estado | Papel | Tinta |
|---|---|---|
| Éxito | `#256B4D` | `#4ADE80` |
| Advertencia | `#7A4F00` | `#FBBF24` |
| Peligro | `#B42318` | `#F87171` |
| Información | `#1D4ED8` | `#60A5FA` |

Los estados nunca se comunican solo con color: siempre llevan icono y texto.

#### Reglas de uso

- **Máximo 10 % de bermellón por viewport.** Una sección con dos acentos compite consigo misma.
- **Sin degradados.** La única excepción es un scrim funcional sobre una imagen para garantizar contraste de texto; se implementa como capa sólida con opacidad, no como gradiente decorativo.
- **Sin negro puro ni blanco puro.** `#000` y `#FFF` quedan prohibidos en superficies y texto.
- **No se usa opacidad para texto atenuado.** Se usan los tokens `fg-muted`; la opacidad se reserva para medios y estados hover.
- **El bermellón no es «peligro».** El peligro usa `#B42318` y siempre va acompañado de icono y texto.

### 5.2 Tipografía

| Familia | Rol | Licencia | Carga |
|---|---|---|---|
| **Newsreader** | Titulares, citas, énfasis editorial | SIL OFL 1.1 | `next/font/google`, variable `opsz 6..72`, `wght 200..800`, normal + italic |
| **Archivo** | Lectura, interfaz, botones, navegación | SIL OFL 1.1 | `next/font/google`, variable `wdth 62..125`, `wght 100..900` |
| **IBM Plex Mono** | Índices, fechas, etiquetas, código, datos | SIL OFL 1.1 | `next/font/google`, pesos 400/500/600; la cursiva 400 se omite hasta que exista una necesidad real |

**Por qué no Geist.** Geist es correcta y ya está instalada, pero es la tipografía por defecto del ecosistema Next/Vercel: neutra hasta desaparecer. Archivo aporta una grotesca con carácter y excelente cobertura del español; IBM Plex Mono aporta la textura de documento técnico que Geist Mono no tiene. Newsreader da la voz editorial que ninguna de las dos puede dar.

**Variables CSS.**

```css
--font-display: var(--font-newsreader), ui-serif, Georgia, "Times New Roman", serif;
--font-sans: var(--font-archivo), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: var(--font-plex-mono), ui-monospace, "SFMono-Regular", Menlo, monospace;
```

**Carga implementada (Etapa 2.1).**

```ts
Newsreader({ subsets: ["latin"], variable: "--font-newsreader", axes: ["opsz"], style: ["normal", "italic"], display: "swap" })
Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" })
IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500", "600"], display: "swap" })
```

### 5.3 Espaciado

Base de 4 px. Escala: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192`.

| Token | Valor | Uso |
|---|---|---|
| `--spacing-section` | `clamp(4.5rem, 8vw, 9rem)` | Separación vertical entre secciones |
| `--spacing-section-sm` | `clamp(3rem, 5vw, 5rem)` | Secciones compactas |
| `--spacing-block` | `clamp(2rem, 3vw, 3rem)` | Bloques internos |
| `--spacing-gutter` | `clamp(1rem, 1.5vw, 1.5rem)` | Gutter de retícula |
| `--spacing-margin` | `clamp(1.25rem, 5vw, 5rem)` | Margen lateral de página |

Regla: el espacio entre un título y su contenido es siempre menor que el espacio entre secciones. La jerarquía se lee por aire, no por líneas.

### 5.4 Contenedores, retícula y breakpoints

| Token | Valor | Uso |
|---|---|---|
| `--container-page` | `90rem` (1440 px) | Ancho máximo de página |
| `--container-wide` | `78rem` (1248 px) | Contenido ancho |
| `--container-text` | `42rem` (672 px) | Texto de lectura, 62–70 caracteres |
| `--container-narrow` | `32rem` (512 px) | Formularios y textos breves |

**Retícula.**

- **≥ 1024 px:** 12 columnas.
- **640–1023 px:** 8 columnas.
- **< 640 px:** 4 columnas.
- Gutter: `clamp(1rem, 1.5vw, 1.5rem)`.
- Márgenes laterales: `clamp(1.25rem, 5vw, 5rem)`.

**Breakpoints (Tailwind 4).**

| Token | Valor |
|---|---|
| `xs` | `30rem` (480 px) |
| `sm` | `40rem` (640 px) |
| `md` | `48rem` (768 px) |
| `lg` | `64rem` (1024 px) |
| `xl` | `80rem` (1280 px) |
| `2xl` | `96rem` (1536 px) |

**Patrones de asimetría permitidos.**

- `7 / 5` para titular y apoyo.
- `8 / 4` para contenido y metadatos.
- `4 / 7` con offset de 1 para lámina y texto.
- `5 / 6` con offset de 1 para bloques editoriales.
- `12` full-bleed solo para láminas y cortes de superficie.

Prohibido: todo centrado, columnas iguales para secciones editoriales, grids de tarjetas de 3×2.

### 5.5 Bordes, radios y sombras

| Token | Valor | Uso |
|---|---|---|
| `--border-hairline` | `1px` | Reglas, marcos, divisores |
| grosor fuerte | `2px` | Foco, estado activo, regla de señal (se aplica con `border-t-2` u `outline-2`) |
| `--radius-control` | `2px` | Botones, inputs, etiquetas |
| `--radius-none` | `0` | Láminas, secciones, imágenes, contenedores |
| `--radius-pill` | `9999px` | Solo puntos de estado y avatares |

**Nota de nombres.** `--border-strong` es el color semántico definido en §5.1; no es un token de grosor. El grosor de 2 px se aplica con utilidades, no con una variable independiente.

**Sombras.** Solo para overlays (diálogos, menús, toasts):

```css
--shadow-overlay: 0 24px 64px -24px rgb(7 11 15 / 0.55), 0 2px 0 0 rgb(7 11 15 / 0.08);
```

Ninguna tarjeta, fila o sección usa sombra. La elevación se comunica con superficie y regla, no con blur.

### 5.6 Movimiento

| Token | Valor |
|---|---|
| `--duration-instant` | `80ms` |
| `--duration-fast` | `160ms` |
| `--duration-base` | `240ms` |
| `--duration-slow` | `400ms` |
| `--duration-reveal` | `700ms` |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--motion-distance-sm` | `8px` |
| `--motion-distance-md` | `16px` |
| `--motion-distance-lg` | `24px` |
| `--motion-stagger` | `48ms` |

### 5.7 Z-index

| Token | Valor |
|---|---|
| `--z-base` | `0` |
| `--z-sticky` | `20` |
| `--z-nav` | `40` |
| `--z-overlay` | `60` |
| `--z-modal` | `70` |
| `--z-toast` | `80` |

### 5.8 Implementación Tailwind 4

Los tokens se declaran en `src/app/globals.css`, no en un archivo de configuración. Este bloque es el contrato para la Etapa 2:

```css
@import "tailwindcss";

@theme {
  /* Color */
  --color-ink-950: #070b0f;
  --color-ink-900: #0b1117;
  --color-ink-800: #121b23;
  --color-ink-700: #1b2732;
  --color-ink-600: #26343f;
  --color-paper-50: #f7f2e9;
  --color-paper-100: #f1eadc;
  --color-paper-200: #e6dccb;
  --color-paper-300: #d5c8b4;
  --color-graphite-900: #1b2126;
  --color-graphite-700: #3c454c;
  --color-graphite-600: #596168;
  --color-graphite-400: #8b949b;
  --color-bone-300: #cfc4b1;
  --color-signal-700: #9f3a10;
  --color-signal-600: #c2410c;
  --color-signal-500: #e04e1f;
  --color-signal-400: #ff6b3d;

  /* Tipografía */
  --font-display: var(--font-newsreader), ui-serif, Georgia, "Times New Roman", serif;
  --font-sans: var(--font-archivo), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, "SFMono-Regular", Menlo, monospace;

  --text-2xs: 0.6875rem;
  --text-2xs--line-height: 1.2;
  --text-2xs--letter-spacing: 0.12em;
  --text-xs: 0.75rem;
  --text-xs--line-height: 1.45;
  --text-xs--letter-spacing: 0.01em;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.5;
  --text-base: 1rem;
  --text-base--line-height: 1.6;
  --text-lg: 1.125rem;
  --text-lg--line-height: 1.6;
  --text-xl: 1.25rem;
  --text-xl--line-height: 1.3;
  --text-2xl: 1.5rem;
  --text-2xl--line-height: 1.25;
  --text-body-lg: 1.125rem;
  --text-body-lg--line-height: 1.6;
  --text-lead: clamp(1.25rem, 1rem + 0.5vw, 1.5rem);
  --text-lead--line-height: 1.45;
  --text-lead--letter-spacing: -0.005em;
  --text-h4: 1.25rem;
  --text-h4--line-height: 1.3;
  --text-h4--letter-spacing: -0.01em;
  --text-h3: clamp(1.5rem, 1.25rem + 1.1vw, 2.25rem);
  --text-h3--line-height: 1.12;
  --text-h3--letter-spacing: -0.015em;
  --text-h2: clamp(2rem, 1.5rem + 2.4vw, 3.5rem);
  --text-h2--line-height: 1.04;
  --text-h2--letter-spacing: -0.02em;
  --text-h1: clamp(2.5rem, 1.75rem + 3.8vw, 5rem);
  --text-h1--line-height: 0.98;
  --text-h1--letter-spacing: -0.03em;
  --text-display: clamp(3rem, 2rem + 5.5vw, 7rem);
  --text-display--line-height: 0.94;
  --text-display--letter-spacing: -0.035em;

  /* Espaciado y contenedores */
  --spacing-section: clamp(4.5rem, 8vw, 9rem);
  --spacing-section-sm: clamp(3rem, 5vw, 5rem);
  --spacing-block: clamp(2rem, 3vw, 3rem);
  --spacing-gutter: clamp(1rem, 1.5vw, 1.5rem);
  --spacing-margin: clamp(1.25rem, 5vw, 5rem);
  --container-page: 90rem;
  --container-wide: 78rem;
  --container-text: 42rem;
  --container-narrow: 32rem;

  /* Bordes, radios, sombras */
  --radius-control: 2px;
  --radius-pill: 9999px;
  --shadow-overlay: 0 24px 64px -24px rgb(7 11 15 / 0.55), 0 2px 0 0 rgb(7 11 15 / 0.08);

  /* Movimiento */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);

  /* Breakpoints */
  --breakpoint-xs: 30rem;
}

@theme inline {
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-rule: var(--rule);
  --color-accent-graphic: var(--accent-graphic);
  --color-accent-text: var(--accent-text);
  --color-focus: var(--focus);
  --color-stroke-strong: var(--border-strong);
}

:root {
  --duration-instant: 80ms;
  --duration-fast: 160ms;
  --duration-base: 240ms;
  --duration-slow: 400ms;
  --duration-reveal: 700ms;
  --motion-distance-sm: 8px;
  --motion-distance-md: 16px;
  --motion-distance-lg: 24px;
  --motion-stagger: 48ms;
  --z-base: 0;
  --z-sticky: 20;
  --z-nav: 40;
  --z-overlay: 60;
  --z-modal: 70;
  --z-toast: 80;
}

:root,
[data-surface="paper"] {
  --surface: var(--color-paper-100);
  --surface-raised: var(--color-paper-200);
  --fg: var(--color-graphite-900);
  --fg-muted: var(--color-graphite-600);
  --rule: var(--color-paper-300);
  --accent-graphic: var(--color-signal-600);
  --accent-text: var(--color-signal-700);
  --focus: var(--color-signal-600);
  --border-strong: #596168;
  color-scheme: light;
}

[data-surface="ink"] {
  --surface: var(--color-ink-950);
  --surface-raised: var(--color-ink-900);
  --fg: var(--color-paper-50);
  --fg-muted: var(--color-bone-300);
  --rule: var(--color-ink-700);
  --accent-graphic: var(--color-signal-400);
  --accent-text: var(--color-signal-400);
  --focus: var(--color-signal-400);
  --border-strong: #5f6e79;
  color-scheme: dark;
}
```

**Regla de clases:** los componentes usan tokens semánticos (`bg-surface`, `text-fg`, `border-rule`, `text-accent-text`, `border-stroke-strong`), no colores crudos. Un `bg-paper-100` suelto en un componente es una señal de que la superficie no está declarada. El valor de `--border-strong` cambia por superficie; el nombre de clase no cambia.

---

## 6. Tipografía

### 6.1 Familias y funciones

- **Newsreader** — solo display. Titulares, citas, títulos de proyecto, la frase de contacto. Nunca por debajo de 20 px. Peso 300–500; la cursiva se usa para una palabra o una cita, no para párrafos.
- **Archivo** — lectura e interfaz. Párrafos, navegación, botones, formularios, tablas. Pesos 400/500/600/700. La variante `wdth` se mantiene en el eje normal (100); no se usa condensada salvo en etiquetas muy específicas.
- **IBM Plex Mono** — datos. Índices (`01`), fechas, etiquetas, estados, código, pies de figura, coordenadas, versiones. Pesos 400/500; 600 solo para énfasis de dato.

### 6.2 Escala

| Token | Tamaño | Interlineado | Tracking | Uso |
|---|---|---|---|---|
| `display` | `clamp(3rem, 2rem + 5.5vw, 7rem)` | `0.94` | `-0.035em` | Hero |
| `h1` | `clamp(2.5rem, 1.75rem + 3.8vw, 5rem)` | `0.98` | `-0.03em` | Título de página |
| `h2` | `clamp(2rem, 1.5rem + 2.4vw, 3.5rem)` | `1.04` | `-0.02em` | Sección |
| `h3` | `clamp(1.5rem, 1.25rem + 1.1vw, 2.25rem)` | `1.12` | `-0.015em` | Proyecto / subsección |
| `h4` | `1.25rem` | `1.3` | `-0.01em` | Encabezado menor |
| `lead` | `clamp(1.25rem, 1rem + 0.5vw, 1.5rem)` | `1.45` | `-0.005em` | Entradilla (Newsreader) |
| `body-lg` | `1.125rem` | `1.6` | `0` | Biografía larga |
| `body` | `1rem` | `1.6` | `0` | Texto por defecto |
| `sm` | `0.875rem` | `1.5` | `0` | UI, pies, notas |
| `xs` | `0.75rem` | `1.45` | `0.01em` | Metadatos |
| `2xs` | `0.6875rem` | `1.2` | `0.12em` | Etiquetas mono mayúsculas |

**Medida de lectura.** `max-width: 42rem` para párrafos; 52rem para entradillas; 36rem para notas. Ningún párrafo supera 72 caracteres.

**Balance.** `text-wrap: balance` en titulares de hasta 4 líneas; `text-wrap: pretty` en párrafos (progresivo, con fallback normal).

### 6.3 Reglas de composición

- Un titular no lleva más de **tres líneas** en desktop y **cuatro** en móvil. Si excede, se reduce la escala o se edita el texto.
- La cursiva de Newsreader se reserva para **una palabra** del titular o para citas. Nunca para énfasis dentro de párrafos largos: ahí se usa weight 500 o el color de acento.
- Los metadatos no se mezclan con el cuerpo: siempre en mono, 10–12 px, mayúsculas, tracking amplio.
- Los números de índice y las fechas usan `font-variant-numeric: tabular-nums`.
- No se usan versalitas sintéticas ni mayúsculas en párrafos.
- El texto sobre imágenes solo existe si hay una capa sólida que garantice contraste; por defecto, el texto va fuera de la imagen.

### 6.4 Español

- `lang="es"` en `<html>`; `lang="es-PE"` en contenido localizado si se necesita.
- Signos de apertura `¿` y `¡` siempre.
- Comillas angulares `«»` para citas largas; comillas tipográficas `“”` para UI y nombres.
- Guion largo `—` para rangos de fecha (`2023 — 2025`) y para incisos.
- Puntos suspensivos `…`, no tres puntos.
- Fechas con `Intl.DateTimeFormat("es-PE", { month: "short", year: "numeric" })`; números con `Intl.NumberFormat("es-PE")`.
- No se traduce el código ni los identificadores. La interfaz es español; el código es inglés.

---

## 7. Composición y retícula

### 7.1 Shell

```
┌──────────────────────────────────────────────────────────────┐
│ NAV (64–72 px, sticky, regla inferior)                       │
├──────────────────────────────────────────────────────────────┤
│ HERO / PORTADA (tinta, altura adaptable; 100svh ref.)        │
├──────────────────────────────────────────────────────────────┤
│ PERFIL (papel)                                               │
├──────────────────────────────────────────────────────────────┤
│ PROYECTOS (papel + pliego de tinta para destacado)           │
├──────────────────────────────────────────────────────────────┤
│ EXPERIENCIA (papel)                                          │
├──────────────────────────────────────────────────────────────┤
│ FORMACIÓN (papel)                                            │
├──────────────────────────────────────────────────────────────┤
│ HABILIDADES (tinta)                                          │
├──────────────────────────────────────────────────────────────┤
│ CONTACTO + FOOTER (tinta)                                    │
└──────────────────────────────────────────────────────────────┘
```

- El `main` tiene `id="contenido"` y recibe el foco desde el skip link.
- Cada sección declara `data-surface="paper"` o `data-surface="ink"`.
- Las secciones de papel llevan una regla superior de 1 px; las de tinta, un corte duro sin regla o con una regla de tinta más clara.
- El cambio de superficie nunca se hace con degradado ni con blur.

### 7.2 Patrón de sección

```
[01]  TÍTULO DE SECCIÓN                         Entradilla / enlace
      ────────────────────────────────────────────────────────────
      contenido
```

- **Índice:** columna 1, mono 11 px, `accent-text`, con una regla vertical de 24 px.
- **Título:** columnas 2–7, Newsreader `h2`.
- **Entradilla:** columnas 8–12, `lead` o `body`, alineada a la derecha o al inicio de su columna.
- **Regla:** 1 px, de margen a margen, 24 px por debajo del encabezado.
- En móvil: índice y título en la misma línea; entradilla debajo; regla.

### 7.3 Asimetría

La asimetría no es desorden. Cada bloque usa una de estas relaciones:

- **7/5:** el contenido principal ocupa 7 columnas; el apoyo, 5.
- **8/4:** el contenido ocupa 8; los metadatos, 4.
- **4/7 + offset 1:** la lámina ocupa 4; el texto empieza en la columna 6 y ocupa 7.
- **5/6 + offset 1:** bloque editorial con aire a la izquierda.

El offset siempre es de **una columna completa**, nunca de píxeles arbitrarios. En móvil, todas las relaciones colapsan a una columna con el orden de lectura del DOM.

### 7.4 Superficies

- **Papel:** perfil, índices de proyectos, experiencia, formación. Es la superficie de lectura.
- **Tinta:** portada, pliego de proyecto destacado, habilidades, contacto, footer, dashboard, auth, preview.
- **Regla de transición:** una sección de tinta dentro de papel debe ser un objeto completo (pliego, lámina, bloque de cierre), no una tarjeta suelta.
- **Nunca** se alternan superficies cada dos secciones sin motivo. El ritmo es: tinta (portada) → papel (lectura) → tinta (habilidades/cierre).

---

## 8. Componentes

### 8.1 Navegación

**Desktop.**

- Altura 72 px; 64 px al hacer scroll (> 24 px).
- Wordmark a la izquierda: Archivo 600, 17 px, tracking `-0.02em`, `foreverlcd` + cuadrado bermellón de 5 px.
- Enlaces: IBM Plex Mono 500, 12 px, mayúsculas, tracking `0.08em`, color `fg-muted`; hover `fg`; activo con subrayado de 2 px `accent-graphic` y offset 6 px.
- Derecha: estado de disponibilidad (punto de 6 px + etiqueta mono 11 px) y enlace de contacto con subrayado.
- Fondo: sólido (`surface` al 98 %), regla inferior de 1 px. **Sin blur.**
- En la portada de tinta, la nav es transparente hasta el primer scroll; luego adopta la superficie de la sección actual.

**Móvil.**

- Wordmark + botón `Menú` (mono 12 px) con icono de dos líneas.
- Overlay a pantalla completa en tinta. Enlaces en Newsreader 40–48 px con índice mono; redes y estado al pie.
- Apertura: fondo 200 ms; enlaces con stagger de 40 ms; cierre con Escape, click fuera y botón.
- Foco atrapado mientras está abierto; al cerrar, vuelve al botón.

**Reglas.**

- No se muestran enlaces a secciones sin contenido.
- No hay selector de idioma ni toggle de tema en v1.
- El wordmark siempre vuelve al inicio (`/`).

### 8.2 Botones

| Variante | Papel | Tinta |
|---|---|---|
| Primario | Fondo `ink-950`, texto `paper-50` | Fondo `paper-100`, texto `ink-950` |
| Secundario | Borde 1 px `border-strong`, texto `fg` | Borde 1 px `border-strong`, texto `fg` |
| Silencioso | Texto + subrayado 1 px | Texto + subrayado 1 px |

- Alturas: 36 / 44 / 52 px. Área táctil mínima 44 × 44 px.
- Tipografía: Archivo 600, 14 px; no mono, no mayúsculas.
- Radio: 2 px. **Sin pills.**
- Hover primario en papel: fondo `signal-500`, texto `ink-950`; en tinta: fondo `signal-400`, texto `ink-950`.
- Hover secundario: borde `accent-graphic`, texto `accent-text`.
- Activo: `translateY(1px)`.
- Deshabilitado: `surface-raised`, texto `graphite-400`, sin hover, `cursor: not-allowed`.
- Icono a la derecha con gap de 10 px; el icono se desplaza 2 px en hover, no el botón.
- **Sin** `scale`, **sin** gradientes, **sin** sombras.

### 8.3 Enlaces

- En línea: heredan color, subrayado de 1 px con `underline-offset: 3px`, color de decoración `graphite-400`; hover: decoración `accent-graphic`, grosor 2 px.
- Enlaces externos: añaden `↗` en mono, 0.9em, con texto oculto «(se abre en una pestaña nueva)».
- Enlaces de titular: sin subrayado en reposo; al hover, una regla de 2 px crece de izquierda a derecha en 240 ms.
- Nunca se usa solo el color para indicar un enlace en texto largo.

### 8.4 Etiquetas y estados

**Etiqueta técnica.**

- Borde 1 px `rule`, radio 2 px, padding `2px 8px`.
- IBM Plex Mono 500, 10 px, mayúsculas, tracking `0.08em`.
- En papel: texto `graphite-700`, borde `paper-300`. En tinta: texto `bone-300`, borde `ink-600`.

**Stack de proyecto.**

- No se usan pills. Se muestra como lista mono separada por `·` o por reglas verticales de 1 px: `Next.js · Prisma · PostgreSQL`.
- En la ficha, el stack va en la columna de metadatos, alineado a la derecha.

**Estado.**

- Punto de 6 px + etiqueta mono 11 px.
- `PUBLICADO` (éxito), `BORRADOR` (atenuado), `DESTACADO` (señal), `ACTUAL` (señal), `ARCHIVADO` (atenuado).
- En admin, los estados de error/advertencia llevan icono.

### 8.5 Fichas de proyecto

**Fila de proyecto (índice).**

- Grid de 12 columnas; borde superior de 1 px; padding vertical de 32 px; sin tarjeta.
- Índice/fecha: columnas 1–2, mono 11 px, `fg-muted`.
- Título: columnas 3–7, Newsreader 400, 28–36 px, interlineado 1.1.
- Descripción: columnas 8–10, Archivo 15 px, `graphite-700`, máximo 2 líneas.
- Stack: columnas 11–12, mono 10 px, alineado a la derecha, máximo 2 líneas.
- Flecha `↗` de 16 px en la esquina superior derecha, 40 % de opacidad; hover: `accent-text`.
- Hover/focus-within: barra de señal de 2 px × 24 px en el borde izquierdo, título desplazado 4 px, fondo `paper-200` al 50 %. 160 ms.
- Móvil: índice/fecha, título, descripción, stack; sin flecha flotante.

**Pliego destacado.**

- Bloque de tinta a sangre dentro de la sección de proyectos.
- Imagen 16:10 en columnas 1–8, marco de 1 px `bone-300` al 15 %.
- Información en columnas 9–12, sticky a 96 px: etiqueta `DESTACADO`, título Newsreader 40–56 px, descripción, stack, enlaces a demo/repos.
- Pie de figura debajo de la imagen: `FIG. 01 — {alt}` en mono 10 px.
- Sin superposición de texto sobre la imagen.

**Lámina vacía.**

- Si no hay portada: marco de 1 px, fondo `surface-raised`, una retícula de 1 px al 8 %, el índice del proyecto en grande y la etiqueta `IMAGEN PENDIENTE`.
- No se usan capturas falsas ni imágenes de stock.

### 8.6 Formularios

- Etiqueta: mono 11 px, mayúsculas, tracking `0.08em`, margen inferior 8 px; nunca placeholder como etiqueta.
- Input/select/textarea: altura 44 px, padding 12 px, fondo transparente, borde 1 px `border-strong`, radio 2 px.
- Foco: borde `focus` + `outline: 2px solid var(--focus); outline-offset: 1px`.
- Placeholder: `fg-muted`, no `graphite-400` claro.
- Error: borde `danger`, mensaje de 13 px con icono, `aria-describedby`, `aria-live="polite"`.
- Deshabilitado: `surface-raised`, texto `graphite-400`.
- Textarea: mínimo 120 px, `resize: vertical`.
- Checkbox/radio: 18 px, borde 1 px, checked con `accent-graphic`; etiqueta de 14 px.
- Upload: zona de 1 px discontinuo, 80 px de alto, etiqueta mono; preview de imagen con marco de 1 px y botón de eliminar.
- Layout: 12 columnas, ancho máximo 720 px; dos columnas solo para campos cortos (fechas, tipo, orden).
- Los formularios del dashboard viven en tinta; el de auth es una hoja de papel sobre tinta.

### 8.7 Tablas (admin)

- Cabecera: mono 10 px, mayúsculas, `fg-muted`, borde inferior 1 px `border-strong`.
- Filas: 48–56 px, borde inferior 1 px `rule`; hover `surface-raised`.
- Números y fechas: alineados a la derecha, `tabular-nums`.
- Acciones: a la derecha, iconos de 16 px con `aria-label`.
- Selección: barra izquierda de 2 px `accent-graphic` + fondo `surface-raised`.
- Móvil: scroll horizontal con `min-width: 720px` y primera columna sticky. No se convierten filas en tarjetas.

### 8.8 Diálogos, menús y toasts

**Diálogo.**

- Overlay `rgb(7 11 15 / 0.7)`, sin blur.
- Panel `surface`, borde 1 px `border-strong`, radio 2 px, ancho máximo 480 px, sombra `overlay`.
- Título Newsreader 28 px; cuerpo 15 px; acciones a la derecha.
- Foco atrapado; Escape cierra; foco vuelve al disparador.
- Destructivo: botón de peligro + confirmación explícita.

**Menú contextual.**

- Fondo `surface`, borde 1 px, sombra overlay, radio 2 px.
- Items de 36 px, mono 12 px; hover `surface-raised`.
- Sin animación de escala.

**Toast.**

- Fondo `ink-900`, texto `paper-50`, borde 1 px `ink-600`, barra izquierda de 3 px según estado.
- Posición inferior izquierda en desktop; inferior a ancho completo en móvil.
- `role="status"`, auto-cierre 5 s, pausa al hover/focus.

### 8.9 Estados vacíos

**Público.**

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  03 / ARCHIVO
  Aún no hay proyectos publicados.
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

- Marco de 1 px discontinuo `rule`, padding 40 px.
- Índice + etiqueta en mono; frase en Newsreader 24 px.
- Sin ilustraciones, sin iconos grandes, sin botones si no hay acción pública.
- Si la sección está vacía en producción, se **omite**; este estado se usa solo cuando la sección existe pero su contenido aún no (p. ej. un destacado sin portada).

**Admin.**

- Mismo marco + frase + botón primario («Crear proyecto»).
- Texto accionable, no disculpa: «Todavía no hay proyectos. Crea el primero.»

### 8.10 Iconografía

- Set local de 20–24 iconos, SVG inline, grid de 24 px.
- Trazo de 1.5 px, `stroke-linecap="square"`, `stroke-linejoin="miter"`, `currentColor`.
- Tamaños: 16 / 20 / 24 px. No se escala un icono de 24 a 48.
- Iconos requeridos: `arrow-up-right`, `arrow-right`, `arrow-down`, `menu`, `close`, `github`, `linkedin`, `mail`, `external`, `copy`, `check`, `alert`, `plus`, `edit`, `trash`, `eye`, `image`, `chevron-down`, `search`, `logout`, `upload`.
- Solo se implementan los iconos que tengan un uso real. El set crece cuando aparece una necesidad concreta, no antes. La consistencia de trazo (1.5 px, grid de 24 px, terminales cuadrados) se mantiene aunque el set sea pequeño.
- Marcas de GitHub/LinkedIn: usar los trazos oficiales simplificados, no redibujar logotipos complejos.
- Sin emojis en la interfaz. Las flechas `↗`, `→`, `↓` se permiten como texto cuando el espaciado está controlado.

### 8.11 Imágenes y multimedia

- Portada de proyecto: 16:10, mínimo 1200 px de ancho.
- Galería: 4:3.
- Retrato: 4:5.
- OG: 1200 × 630.
- Cloudinary: `f_auto,q_auto:good,dpr_auto,c_limit,w_1600` para portadas; `w_800` para galería; `w_1200` para retrato.
- `next/image` con `sizes` explícito y `alt` proveniente de la base de datos.
- Marco de 1 px: en papel `rule`; en tinta `bone-300` al 15 %.
- Sin esquinas redondeadas, sin filtros, sin duotonos.
- Hover: escala 1.015 dentro de `overflow: hidden`, 400 ms; sin sombra.
- Pie de figura obligatorio: `FIG. 01 — descripción` en mono 10 px, `fg-muted`.
- Video: sin autoplay con sonido; controles nativos; subtítulos si hay voz.
- Si falta `alt`, el sistema usa `{título} — portada` como fallback y registra una advertencia en admin.

---

## 9. Composición del portfolio

> El contenido real se incorporará después. Las estructuras siguientes no inventan biografía ni logros; definen dónde y cómo entra el contenido.

### 9.1 Navegación

- Enlaces: `Perfil`, `Proyectos`, `Experiencia`, `Formación`, `Habilidades`, `Contacto`.
- Solo se muestran las secciones con contenido publicado.
- El índice del hero enumera las secciones disponibles: `01 PERFIL`, `02 PROYECTOS`, …
- En desktop, los enlaces no llevan índice; en el menú móvil, sí.

### 9.2 Hero (tinta)

**Intención.** Es la portada del expediente y el único momento de gran escala. Debe decir quién es, qué hace y dónde está, sin tarjetas ni badges.

**Composición desktop (12 columnas).**

- Fila superior (mono 11 px): `PORTFOLIO / 2026` a la izquierda; estado de disponibilidad y ubicación a la derecha.
- Titular: columnas 1–8, Newsreader `display`, 3–4 líneas, una palabra en cursiva. Alineado a la izquierda, no centrado.
- Lámina 3D: columnas 8–12, sangra por la derecha, 60–70 % de la altura del hero; nunca detrás del titular.
- Entradilla: columnas 1–4, `lead`, máximo 3 líneas.
- Acciones: columnas 5–7, un botón primario («Ver proyectos») y un enlace silencioso («Contacto»). Máximo dos acciones.
- Pie del hero: columnas 1–4, coordenadas/ubicación en mono; columnas 11–12, `01 — ÍNDICE` con flecha hacia abajo.

**Altura.** El hero usa una altura adaptable: `min-height` basada en el contenido y en el viewport disponible. `100svh` es una referencia compositiva, no una altura rígida; el contenido nunca se recorta ni se fuerza a ocupar exactamente una pantalla.

**Composición móvil.**

- Titular `display` en 3–4 líneas; entradilla debajo; acciones en columna; lámina 3D reemplazada por el SVG topográfico de 200–240 px o eliminada si el espacio no alcanza.
- Sin scroll horizontal; el titular no se corta.

**Movimiento.** Una sola secuencia de entrada (ver §11). Nada de ambiente.

### 9.3 Sobre mí (papel)

**Intención.** Convertir la biografía en una ficha legible, no en un muro de texto.

- Índice `02`, título «Perfil» o «Sobre mí».
- Retrato en columnas 1–4 (sticky en desktop, 4:5). Si no hay foto: lámina tipográfica con iniciales, `RETRATO PENDIENTE` y la ubicación; no se inventa una imagen.
- Texto en columnas 6–11: entradilla en Newsreader 24–28 px; biografía en Archivo 17–18 px, 2–3 párrafos, 62–68 caracteres por línea.
- Ficha al pie: `Ubicación`, `Enfoque`, `Disponibilidad`, `Idiomas` solo si existen en el perfil. Lista de definición con reglas de 1 px.
- Firma: regla de señal de 48 px + `foreverlcd` en mono.
- Sin botones de «descargar CV» si el archivo no existe; se añadirá cuando esté disponible.

### 9.4 Proyectos (papel + pliego de tinta)

**Intención.** Es la sección más importante. Debe permitir escanear y profundizar.

- Índice `03`, título «Proyectos», entradilla con el criterio de selección (cuando exista).
- **Destacado:** pliego de tinta con imagen 16:10 y ficha sticky (ver §8.5). Solo uno.
- **Índice:** filas de proyecto en papel, ordenadas por `isFeatured` y `displayOrder`.
- Cada fila enlaza a `/proyectos/[slug]`.
- Si no hay proyectos: estado vacío (o sección omitida en producción).
- No se muestran métricas inventadas ni logos de clientes sin permiso.

**Detalle de proyecto (ruta futura `/proyectos/[slug]`).**

- Hero de tinta: índice, título, descripción corta, metadatos (fechas, estado, stack), enlaces a demo/repos.
- Portada a sangre o en columnas 1–9.
- Cuerpo en papel, 68 caracteres, con subtítulos `h2` y párrafos; imágenes de galería con pie de figura.
- Barra lateral sticky con stack, repositorios y enlaces.
- Navegación «Proyecto anterior / siguiente» al final.
- 404 propio si el slug no está publicado.

### 9.5 Experiencia (papel)

**Intención.** Un libro mayor, no una línea de tiempo con bolitas.

- Índice `04`, título «Experiencia».
- Filas: fechas en columnas 1–2 (mono, `2023 — 2025` o `2024 — actualidad`); cargo y empresa en 3–7 (Newsreader 24–28 px); descripción en 8–11 (Archivo 15 px, máximo 3 líneas); tipo de empleo en 12 (etiqueta).
- Regla de 1 px entre filas.
- Puesto actual: punto de señal + etiqueta `ACTUAL`; sin animación.
- Móvil: fechas, cargo, empresa, descripción, etiqueta.
- Sin línea vertical, sin iconos de empresa, sin tarjetas.

### 9.6 Formación (papel)

**Intención.** Demostrar rigor y aprendizaje continuo sin competir con experiencia.

- Índice `05`, título «Formación».
- Dos bloques: **Formal** (título, institución, fechas, credencial) y **Cursos y certificaciones** (nombre, institución, año, credencial).
- Cada bloque es un ledger con reglas; no tarjetas.
- Enlace de credencial con `↗` y texto accesible.
- Si solo hay un tipo, se muestra un solo bloque; no se deja el otro vacío.

### 9.7 Habilidades (tinta)

**Intención.** Una lámina de especímenes tipográfica, no una nube de logos ni barras de porcentaje.

- Índice `06`, título «Habilidades».
- Categorías en mono mayúsculas, columnas 1–2; habilidades en columnas 3–12, Archivo 18–22 px, separadas por reglas de 1 px o por `·`.
- Si existe `icon`, se muestra un glifo de 16 px antes del nombre; si no, solo texto.
- Hover/focus: subrayado de 2 px de señal y, si hay descripción, una línea de 13 px debajo.
- Sin porcentajes, sin estrellas, sin medidores.
- En móvil, una categoría por bloque, habilidades en lista.

### 9.8 Contacto (tinta)

**Intención.** Cerrar el expediente con una invitación clara y sin formularios falsos.

- Índice `07`, título «Contacto».
- Frase en Newsreader 32–56 px, máximo 2 líneas, sin superlativos.
- Email como enlace gigante (`mailto:`) en columnas 1–8, con subrayado de 2 px que se dibuja al hover.
- Enlaces sociales en columnas 9–12, ledger mono con `↗`.
- Estado de disponibilidad si existe.
- Si no hay email: se muestran solo los enlaces sociales; si tampoco hay, una frase de estado y ningún CTA.
- **Sin formulario en v1.** No hay modelo de mensajes; añadirlo requiere migración, moderación y antispam (ver §17).

### 9.9 Footer (tinta)

**Intención.** Colofón, no segundo hero.

- Regla superior de 1 px.
- Todos los datos del colofón —nombre, ubicación, enlaces, fecha de actualización y cualquier dato personal— provienen del perfil administrable. No se fijan datos personales directamente en componentes ni en el layout.
- Columnas: wordmark + frase corta; índice de secciones; sociales; ubicación y hora de Cusco; `Última actualización: {fecha}` si existe.
- Enlace «Volver arriba» con `↑`.
- Línea final en mono 10 px: `foreverlcd.dev — Diseñado y construido con Next.js, Prisma y PostgreSQL.` (solo cuando sea cierto; no se atribuye tecnología no usada).
- Sin newsletter, sin logos gigantes, sin CTA repetido.

### 9.10 Página de espera

Si no hay perfil publicado:

- Superficie de tinta, 100svh.
- Wordmark arriba.
- Titular Newsreader 48–64 px: «Este archivo se está preparando.»
- Una línea en `fg-muted` y, si existe, el email de contacto.
- Sin navegación, sin secciones vacías, sin cuenta regresiva.
- `noindex` hasta que haya contenido.

---

## 10. Dashboard

**Concepto.** El panel de control del instrumento. No es una réplica del portfolio: es su taller.

### 10.1 Shell

- Superficie de tinta (`ink-950`).
- Sidebar fija de 240 px en desktop; drawer en móvil.
- Contenido máximo 1200 px, padding 32–48 px.
- Barra superior de 56 px con breadcrumb mono, estado de sesión y acción principal.
- Sidebar: wordmark, navegación mono 12 px con contadores, separador, «Ver portfolio», «Cerrar sesión».
- Sección activa: barra izquierda de 2 px `accent-graphic` + texto `fg`.

### 10.2 Páginas

| Ruta | Contenido |
|---|---|
| `/admin` | Resumen: counts, últimos cambios, accesos rápidos |
| `/admin/proyectos` | Tabla de proyectos, filtros por estado, acción crear |
| `/admin/proyectos/[id]` | Formulario de proyecto, repositorios, imágenes, skills |
| `/admin/habilidades` | Categorías y skills |
| `/admin/experiencia` | Ledger editable |
| `/admin/formacion` | Ledger editable |
| `/admin/perfil` | Perfil, enlaces sociales, publicación |
| `/admin/imagenes` | Biblioteca Cloudinary (si se implementa) |
| `/login` | Acceso único |

### 10.3 Patrones

- **Encabezado de página:** `h1` Newsreader 36–44 px + descripción corta + acciones a la derecha.
- **Métricas:** máximo 3–4 tarjetas de 1 px de borde, sin sombra; número en Newsreader 40 px, etiqueta mono.
- **Tablas:** ver §8.7.
- **Formularios:** ver §8.6; secciones con título `h2` y regla.
- **Publicación:** estado visible (`PUBLICADO` / `BORRADOR`) y acción primaria clara.
- **Preview:** abre el portfolio en una ruta de preview con banner de señal `VISTA PREVIA · BORRADOR`; el contenido no se indexa.
- **Peligro:** eliminar exige diálogo de confirmación; el borrado de imágenes Cloudinary se confirma aparte.
- **Vacíos:** accionables, con botón de creación.

### 10.4 Auth

- Pantalla de tinta completa; wordmark arriba a la izquierda.
- Hoja de papel de 420 px centrada (o ligeramente desplazada) con el formulario: email, contraseña, botón primario.
- Sin registro, sin «crear cuenta», sin login social.
- Mensajes de error genéricos; no se revela si el email existe.
- Enlace «Volver al portfolio».

---

## 11. Movimiento

### 11.1 Principios

1. **Confirma estructura.** El movimiento muestra qué apareció, qué cambió o qué está activo; no rellena silencios.
2. **Rápido y sobrio.** 160–400 ms para interacción; 700 ms máximo para una revelación.
3. **Una secuencia por vista.** El hero tiene la suya; el resto son micro-transiciones.
4. **Sin ambiente continuo.** Nada de partículas, tickers, glows pulsantes ni marquesinas de contenido.
5. **El fallback es el estado normal.** Con `prefers-reduced-motion`, todo es visible y estático.

### 11.2 Qué se anima y con qué

| Elemento | Técnica | Duración | Easing | Nota |
|---|---|---|---|---|
| Hover de enlaces/subrayados | CSS | 160 ms | standard | Grosor y color |
| Botones | CSS | 160 ms | standard | Fondo, borde, icono |
| Nav al scroll | CSS/clase | 200 ms | standard | Altura y superficie |
| Menú móvil | Anime.js | 240 ms | enter | Fondo + stagger de enlaces |
| Entrada del hero | Anime.js | 700 ms | enter | Una vez por carga |
| Encabezado de sección | Anime.js `onScroll` | 400 ms | enter | Una vez; 16 px |
| Filas de proyecto | CSS | 160 ms | standard | Barra de señal |
| Imagen al hover | CSS | 400 ms | standard | Escala 1.015 |
| Diálogo | CSS | 200 ms | enter | Opacidad + 8 px |
| Toast | CSS | 240 ms | enter | 8 px |
| 3D | Three.js | continua | lineal | Rotación lenta; pausa fuera de vista |
| Transición de página | View Transitions (opcional) | 240 ms | standard | Solo si no rompe scroll |

### 11.3 Secuencia del hero

1. `0 ms` — nav y regla superior.
2. `80 ms` — fila de metadatos.
3. `140 ms` — línea 1 del titular.
4. `200 ms` — línea 2.
5. `260 ms` — línea 3.
6. `340 ms` — entradilla.
7. `420 ms` — acciones.
8. `520 ms` — pie del hero.
9. `600 ms` — lámina 3D/SVG (fade 300 ms).

Cada línea entra con `opacity 0→1` y `translateY(12px)`; sin recorte de letras, sin typewriter, sin stagger por carácter.

### 11.4 Anime.js v4

- Solo en componentes cliente.
- API: `animate`, `createTimeline`, `stagger`, `onScroll`, `svg.createDrawable`.
- Usos: timeline del hero, reveal de encabezados, menú móvil, dibujo de la regla de señal en SVG, transición de la lámina 3D.
- No se usa para: hover, foco, cambios de color, layouts, scroll hijacking, ni animaciones de párrafos.
- Respeto de `prefers-reduced-motion` con `matchMedia` antes de crear timelines; si está activo, se aplican los estados finales.
- Limpieza: cancelar timelines y observers en `useEffect` cleanup.

### 11.5 Reglas de rendimiento

- Animar solo `transform` y `opacity`.
- No animar `height`, `width`, `top`, `left`, `box-shadow` ni `filter`.
- `will-change` solo durante la animación; retirarlo al terminar.
- Un máximo de 2 timelines activos a la vez.
- `content-visibility: auto` en secciones largas fuera del viewport, con cuidado de no romper anclas.
- Sin librerías de scroll adicionales.

---

## 12. Dirección 3D

### 12.1 Concepto: «Levantamiento»

La escena es un **levantamiento topográfico en línea**: un terreno abstracto hecho de curvas de nivel, como el plano que un ingeniero levanta antes de construir. Sobre la tinta, las líneas son hueso; un único punto bermellón marca la estación de medición.

No es un adorno genérico: es la metáfora del portfolio —terreno, medición, estructura— y conecta con Cusco sin caer en motivos folclóricos.

### 12.2 Papel en la página

- **Hero únicamente.** No hay 3D en secciones internas ni en el dashboard.
- **Secundario y compositivo:** ocupa las columnas 8–12, sangra por la derecha y nunca se superpone al titular.
- **No interactivo por obligación:** el puntero produce un parallax de ±3°; no hay orbit controls, zoom ni clic.
- **Decorativo:** `aria-hidden="true"`; el contenido se entiende sin la escena.

### 12.3 Especificación técnica

- `WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })`.
- `PerspectiveCamera(28, aspect, 0.1, 100)`, posición `(0, 6, 10)`, mira al origen.
- Geometría: terreno paramétrico de 32 × 48 puntos; curvas de nivel como `Line`/`LineSegments`; 24–32 curvas; < 5 000 vértices.
- Material: `LineBasicMaterial` con `bone-300` a 0.55; rejilla base `ink-700` a 0.35; marcador `signal-400`.
- Sin luces, sin sombras, sin texturas, sin postprocesado, sin niebla.
- Rotación continua de 0.02 rad/s; parallax con lerp 0.05; scroll añade 0.08 rad como máximo.
- DPR: `Math.min(devicePixelRatio, 2)` en desktop; `1.5` en móvil.
- Pausa con `IntersectionObserver` (fuera de vista) y `visibilitychange`.
- `ResizeObserver` para cámara y renderer.
- Limpieza: `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, remover listeners, `setAnimationLoop(null)`.

### 12.4 Carga y fallback

- **Poster inicial:** SVG topográfico estático inline, con las mismas curvas y composición. Se renderiza en el servidor; es también el fallback.
- **Carga diferida:** el chunk de Three.js se importa después del primer render, con `requestIdleCallback` o al entrar el hero en viewport.
- **Crossfade:** cuando la escena está lista, el canvas aparece con opacidad 0→1 en 300 ms; el SVG se mantiene debajo.
- **Fallback obligatorio** si:
  - no hay WebGL,
  - `prefers-reduced-motion: reduce`,
  - `navigator.connection.saveData` es `true`,
  - viewport < 768 px,
  - el dispositivo reporta `deviceMemory <= 4`.
- `navigator.deviceMemory` y `navigator.connection.saveData` son capacidades opcionales. Si no existen, el sitio continúa con el render normal (WebGL o SVG según las demás condiciones); su ausencia nunca debe impedir el funcionamiento ni lanzar errores.
- El SVG debe verse intencional, no como un error: mismas líneas, mismo punto bermellón.

### 12.5 Presupuesto

- Chunk 3D ≤ 180 KB gzip, cargado fuera del critical path.
- Escena ≤ 5 000 vértices; ≤ 40 draw calls; sin texturas.
- 60 fps objetivo en desktop; 30 fps aceptable en móvil; si no se sostiene, se usa SVG.
- Sin bloqueo del LCP: el titular y el SVG son el LCP, no el canvas.

### 12.6 Evaluación visual obligatoria

Antes de declarar la escena definitiva:

- Capturas a 1440×900, 1024×768 y 390×844.
- Titular corto y titular largo: comprobar que no hay solapamiento ni recorte.
- Contraste del texto sobre la tinta con la escena detrás.
- Prueba con `prefers-reduced-motion`, sin WebGL y con red lenta.
- Revisión de fps y memoria en desktop y móvil.
- Aprobación explícita del usuario; sin ella, la escena queda como prototipo.

---

## 13. Accesibilidad

### 13.1 Contraste

| Combinación | Ratio | Uso |
|---|---:|---|
| `graphite-900` / `paper-100` | 13.58:1 | Texto principal |
| `graphite-700` / `paper-100` | 8.17:1 | Texto secundario |
| `graphite-600` / `paper-100` | 5.26:1 | Texto atenuado |
| `signal-700` / `paper-100` | 5.68:1 | Enlaces y acentos de texto |
| `signal-600` / `paper-100` | 4.33:1 | Gráficos y texto grande |
| `paper-100` / `ink-950` | 16.49:1 | Texto principal sobre tinta |
| `bone-300` / `ink-950` | 11.45:1 | Texto atenuado sobre tinta |
| `signal-400` / `ink-950` | 6.98:1 | Enlaces y foco sobre tinta |
| `ink-950` / `signal-500` | 4.96:1 | Texto sobre botón de señal |
| `#596168` / `paper-100` | 5.26:1 | Bordes de control en papel |
| `#5F6E79` / `ink-950` | 3.75:1 | Bordes de control en tinta |

Todos los textos normales cumplen AA (≥ 4.5:1). Los elementos no textuales (bordes, foco) cumplen ≥ 3:1. Las reglas decorativas pueden ser de bajo contraste porque no comunican información.

### 13.2 Reglas

- **Foco visible:** `outline: 2px solid var(--focus); outline-offset: 2px;` en todo elemento interactivo. Nunca `outline: none` sin reemplazo.
- **Skip link:** primero en el DOM, visible al foco, salta a `#contenido`.
- **Landmarks:** `header`, `nav`, `main`, `footer`; un solo `h1` por página.
- **Jerarquía:** headings en orden; no se usan `div` con apariencia de título.
- **Teclado:** toda acción disponible con teclado; menú y diálogos con foco atrapado y retorno.
- **Objetivos táctiles:** mínimo 44 × 44 px, aunque el visual sea menor.
- **Zoom:** 200 % sin pérdida de contenido ni scroll horizontal.
- **Texto:** no se justifica; no se usa texto en imágenes para información esencial.
- **Formularios:** etiqueta visible, error asociado, `aria-invalid`, resumen de errores.
- **Estados:** color + icono + texto.
- **Medios:** `alt` obligatorio; decorativos con `alt=""`; video con subtítulos.
- **Movimiento:** `prefers-reduced-motion` desactiva transformaciones, parallax, 3D y stagger; el contenido aparece completo.
- **Contraste del sistema:** soportar `prefers-contrast: more` aumentando reglas y bordes; soportar `forced-colors`.
- **Idioma:** `lang="es"`; cambios de idioma marcados con `lang`.
- **3D:** decorativo, `aria-hidden`, sin foco; nunca es la única vía de información.

### 13.3 Rendimiento como accesibilidad

- LCP < 2.5 s en 4G; CLS < 0.1; INP < 200 ms.
- Fuentes con `display: swap` y preload de las dos principales; subsets `latin`.
- Imágenes con dimensiones explícitas y `sizes`.
- 3D fuera del critical path.
- Sin animaciones que bloqueen el hilo principal.

---

## 14. Responsive

| Rango | Retícula | Comportamiento |
|---|---|---|
| `< 480 px` | 4 columnas | Una columna; titular 44–56 px; nav móvil; 3D en SVG o ausente |
| `480–639 px` | 4 columnas | Igual, con más aire; botones a ancho completo si hay dos |
| `640–1023 px` | 8 columnas | Perfil y proyectos en una columna; pliego destacado apilado |
| `1024–1279 px` | 12 columnas | Asimetría completa; retrato sticky; hero con 3D |
| `1280–1535 px` | 12 columnas | Contenedor `wide`; márgenes mayores |
| `≥ 1536 px` | 12 columnas | Contenedor `page` (1440 px); el fondo respira |

**Reglas.**

- Sin scroll horizontal en ningún breakpoint.
- Los hijos de grid llevan `min-width: 0`.
- Palabras largas: `overflow-wrap: anywhere` solo en metadatos y URLs.
- Las tablas de admin pueden hacer scroll horizontal; el contenido público, no.
- El menú móvil se activa por debajo de `lg` (1024 px), no por debajo de `md`.
- La nav no se convierte en hamburguesa si caben los enlaces; se prueba con el contenido real.

---

## 15. Contenido y microcopy

### 15.1 Voz

- Primera persona, precisa, tranquila.
- Verbos concretos: «construyo», «diseño», «mantengo», «migro».
- Sin superlativos vacíos: «apasionado», «rockstar», «ninja», «experto mundial».
- Sin métricas no verificadas.
- El español es la voz; el código y los identificadores van en inglés.

### 15.2 Reglas de copy

- Títulos de sección en sentence case: «Sobre mí», «Proyectos», «Formación».
- Etiquetas mono en mayúsculas: `PUBLICADO`, `DESTACADO`, `ACTUAL`.
- Botones: verbo + objeto («Ver proyectos», «Guardar cambios»).
- Fechas: `2023 — 2025`; actual: `2024 — actualidad`.
- Enlaces externos: texto descriptivo, no «click aquí».
- Errores: qué pasó y cómo resolverlo, sin culpar.
- Vacíos públicos: estado, no disculpa.

### 15.3 Datos de desarrollo

- Solo en desarrollo, claramente marcados con `DEMO` en la esquina de la lámina y en el admin.
- Nunca se despliegan a producción.
- No se usan nombres de empresas reales ni logros inventados.
- El seed de desarrollo se define en la Etapa 2 y requiere aprobación.

---

## 16. Referencias

No se copia ninguna interfaz. Se extraen criterios.

### Composición y rigor

- **Massimo Vignelli, *The Vignelli Canon*.** Semántica antes que estilo; rejilla, tipografía y economía de medios. Inspira la disciplina de reglas e índices.
- **Josef Müller-Brockmann, *Grid Systems in Graphic Design*.** Asimetría con lógica; el grid como estructura de lectura, no como plantilla.
- **NASA Graphics Standards Manual (1975).** Documentación técnica, etiquetas mono, folios, sistemas de señalización. Inspira la lógica de «expediente».
- **Otl Aicher / Juegos Olímpicos de Múnich 1972.** Sistema pictográfico, contención cromática, claridad.
- **Dieter Rams / Braun.** Detalle funcional, «menos pero mejor», el color como información.

### Editorial tecnológica

- **MIT Technology Review.** Jerarquía editorial, titulares serif, convivencia de texto largo y datos.
- **Reuters Graphics / The Pudding.** Narración con datos, pies de figura, ritmo de lectura.
- **Pentagram (casos editoriales).** Sistemas de identidad que se sostienen en múltiples soportes.

### Producto digital

- **Linear.** Craft de interfaz oscura, microinteracciones, etiquetas mono; referencia de contención, no de paleta.
- **Vercel / Geist.** Referencia de sistema tipográfico y documentación; se evita su neutralidad como identidad.
- **Rauno Freiberg.** Detalle de interacción y tipografía; inspira la precisión de los estados.
- **Paco Coursey.** Portfolio de ingeniero con voz propia; inspira la confianza en el texto, no la composición.

### Portfolios de desarrollador

- **Brittany Chiang.** Referencia de lo que ya existe: dark, acentos, columnas. Se usa para **diferenciarse**, no para imitar.
- **Josh Comeau.** Referencia de motion y pedagogía; se toma la claridad, no la estética.
- **Lee Robinson.** Referencia de estructura de portfolio; se evita el aspecto de plantilla.

### Cultura material

- **Teenage Engineering.** Lenguaje de instrumento, acento funcional, fotografía de producto.
- **Andenería andina / cantería inca.** Ritmo, repetición y ajuste de piezas sin mortero. Inspira la retícula y la idea de «encaje», nunca motivos decorativos.
- **Manuales de taller y planos de obra.** Reglas, cotas, leyendas, colofón.

### Anti-referencias

- Portfolios con hero de dos columnas y tarjeta luminosa.
- Interfaces con glassmorphism, gradientes morados, glows y partículas.
- Plantillas de «AI startup» con tipografía Inter, pills y logos flotantes.
- Brutalismo web de marquesinas y sellos.
- Cualquier portfolio que use las mismas tres referencias de siempre sin criterio.

---

## 17. Decisiones pendientes

| # | Decisión | Estado | Recomendación |
|---|---|---|---|
| 1 | Aprobar la dirección B o elegir A/C | **Pendiente de aprobación** | B |
| 2 | Sustituir Geist por Archivo + Newsreader + IBM Plex Mono | Pendiente | Sí; es el núcleo de la identidad |
| 3 | Foto de perfil disponible | Pendiente | Si no hay, lámina tipográfica; no stock |
| 4 | CV en PDF | Pendiente | Añadir cuando exista; no mostrar un enlace muerto |
| 5 | Formulario de contacto | Pendiente | No en v1; requiere modelo, moderación y antispam |
| 6 | Set de iconos local vs. `lucide-react` | Pendiente | Local, 20–24 iconos; evita dependencia y mantiene el trazo |
| 7 | Ruta y diseño del detalle de proyecto | Pendiente | `/proyectos/[slug]`, hero de tinta + cuerpo de papel |
| 8 | Escena 3D definitiva | Pendiente | Prototipo + evaluación visual antes de aprobar |
| 9 | Seed de datos ficticios para desarrollo | Pendiente | Crear en Etapa 2, marcado `DEMO`, nunca en producción |
| 10 | View Transitions | Pendiente | Opcional; evaluar después de la primera versión |
| 11 | Analítica | Fuera de alcance | No definir ahora |
| 12 | Blog / escritura | Fuera de alcance | No hay modelo; no prometerlo en la UI |
| 13 | Idioma | Decidido | Español únicamente en v1; sin selector |
| 14 | Tema claro/oscuro | Decidido | No hay toggle; las superficies son composición |

---

## 18. Contrato de implementación (Etapa 2)

Este documento no implementa nada. Cuando se apruebe, la Etapa 2 debe:

1. **Tipografía:** reemplazar Geist en `src/app/layout.tsx` por Newsreader, Archivo e IBM Plex Mono con `next/font/google`; ajustar `lang="es"` y metadatos.
2. **Tokens:** sustituir el `@theme` actual de `src/app/globals.css` por el bloque de §5.8; añadir base, selección, foco, scrollbar y utilidades de superficie.
3. **Primitivos:** crear `src/components/ui/` con Button, Link, SectionHeader, Rule, Tag, StatusDot, Field, EmptyState, Plate, Dialog y Toast, usando solo tokens semánticos.
4. **Sitio:** crear `src/components/site/` con Nav, Hero, About, Projects, Experience, Education, Skills, Contact y Footer; Server Components por defecto.
5. **Admin:** crear `src/components/admin/` con Shell, Sidebar, Table, FormSection y PreviewBanner.
6. **Formato:** crear `src/lib/format.ts` para fechas y números `es-PE`.
7. **Estados:** implementar los estados vacíos y la página de espera de §9.10.
8. **Movimiento:** instalar Anime.js en Etapa 3, no antes; el hero debe funcionar sin JS.
9. **3D:** instalar Three.js en Etapa 3; el SVG topográfico debe existir primero.
10. **Skills del proyecto:** crear `.opencode/skills/portfolio-art-direction/SKILL.md` y `.opencode/skills/portfolio-motion-3d/SKILL.md` **después** de aprobar este documento, derivados de §4–§12, sin duplicar el sistema completo.

**Criterios de aceptación visual (Etapa 2).**

- Sin scroll horizontal a 320 px.
- Contraste AA en todo texto.
- Foco visible en todos los controles.
- `prefers-reduced-motion` deja todo visible.
- Capturas revisadas a 1440, 1024 y 390 px.
- Ninguna sección usa tarjetas para listar contenido.
- El bermellón no supera el 10 % de un viewport.
- Los estados vacíos se ven intencionales.
- La nav no muestra enlaces a secciones vacías.

---

## 19. Anexo: verificación de contraste

Calculado con luminancia relativa sRGB (WCAG 2.x). Los ratios se redondean a dos decimales.

| Texto | Fondo | Ratio | AA normal | AA grande |
|---|---|---:|---|---|
| `#1B2126` | `#F1EADC` | 13.58 | Sí | Sí |
| `#3C454C` | `#F1EADC` | 8.17 | Sí | Sí |
| `#596168` | `#F1EADC` | 5.26 | Sí | Sí |
| `#9F3A10` | `#F1EADC` | 5.68 | Sí | Sí |
| `#C2410C` | `#F1EADC` | 4.33 | No | Sí |
| `#F1EADC` | `#070B0F` | 16.49 | Sí | Sí |
| `#CFC4B1` | `#070B0F` | 11.45 | Sí | Sí |
| `#FF6B3D` | `#070B0F` | 6.98 | Sí | Sí |
| `#E04E1F` | `#070B0F` | 4.96 | Sí | Sí |
| `#070B0F` | `#E04E1F` | 4.96 | Sí | Sí |
| `#F1EADC` | `#1B2126` | 13.58 | Sí | Sí |
| `#596168` | `#F1EADC` | 5.26 | Sí | Sí |
| `#5F6E79` | `#070B0F` | 3.75 | No (no textual) | — |
| `#256B4D` | `#F1EADC` | 5.33 | Sí | Sí |
| `#7A4F00` | `#F1EADC` | 5.95 | Sí | Sí |
| `#B42318` | `#F1EADC` | 5.49 | Sí | Sí |
| `#1D4ED8` | `#F1EADC` | 5.60 | Sí | Sí |
| `#4ADE80` | `#070B0F` | 11.33 | Sí | Sí |
| `#FBBF24` | `#070B0F` | 11.83 | Sí | Sí |
| `#F87171` | `#070B0F` | 7.14 | Sí | Sí |
| `#60A5FA` | `#070B0F` | 7.76 | Sí | Sí |

**Nota.** `signal-600` sobre papel solo se usa en gráficos, iconos y texto ≥ 24 px. Para enlaces y texto pequeño se usa `signal-700`.

---

## 20. Registro de cambios

### 2026-11-12 — Aclaraciones de implementación (Etapa 2.1)

No cambian la dirección artística; precisan cómo debe implementarse:

1. **Colofón administrable.** La ubicación y todos los datos del colofón provienen del perfil de la base de datos. No se codifican datos personales en componentes, layout ni metadata fija.
2. **Hero de altura adaptable.** `100svh` es una referencia compositiva. La altura real se adapta al contenido y al viewport; no se fuerza una pantalla exacta ni se recorta contenido.
3. **Capacidades opcionales.** `navigator.deviceMemory` y `navigator.connection.saveData` pueden no existir. Su ausencia no impide el render ni el funcionamiento; solo se usan como señales adicionales para elegir SVG o WebGL.
4. **Iconografía mínima.** Solo se implementan los iconos con uso real, manteniendo el trazo de 1.5 px y el grid de 24 px. No se construye una biblioteca sobredimensionada.

**Correcciones técnicas.**

5. **Cursiva de IBM Plex Mono.** Se omite en la Etapa 2.1 para no descargar una variante sin uso. Se añadirá cuando exista una necesidad tipográfica concreta.
6. **Mínimo de `lead`.** Se eleva a `1.25rem` (20 px) para que la entradilla en Newsreader cumpla la regla de §6.1 («nunca por debajo de 20 px»). El máximo de `1.5rem` no cambia.
7. **Duración de transiciones.** Los tokens `--duration-*` viven en `:root`. Para que las utilidades `duration-*` de Tailwind 4 los consuman, se mapean a `--transition-duration-*` dentro de `@theme`; no se duplican valores.
8. **Token `fg-strong`.** Se añade para las etiquetas técnicas de §8.4: `graphite-700` en papel y `bone-300` en tinta. No altera la paleta; solo da nombre semántico a un uso ya previsto.
9. **Tokens de estado y control.** Se añaden `fg-disabled`, `control-strong-*` y `status-*` como variables semánticas por superficie. Sus valores provienen de §5.1, §8.2 y §8.6; no introducen colores nuevos.

---

*Fin del documento. Cualquier cambio de dirección debe registrarse aquí con fecha y justificación antes de implementarse.*
