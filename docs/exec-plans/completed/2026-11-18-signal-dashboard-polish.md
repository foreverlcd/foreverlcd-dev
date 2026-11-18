# Dashboard con estilo SIGNAL + nombre en móvil

- **Área:** dashboard (UI) + un ajuste del hero público
- **Dificultad:** media (Sonnet implementer)
- **Rama:** feat/signal-experience (sin commit; integra el planificador)

## Objetivo
1. El dashboard aún conserva el layout de la dirección rechazada: serif, crema y bermellón. Hay que llevarlo al lenguaje SIGNAL de `docs/ART-DIRECTION.md`. Es una herramienta, así que es sobria, densa y rápida: **sin WebGL** y sin animaciones decorativas.
2. En móvil, el nombre del hero ocupa solo el 14 % del alto. Debe ganar presencia.

## Contexto mínimo
- `docs/ART-DIRECTION.md`: paleta (`--bg --fog --ink --ash --signal --uv --coral`), Unbounded / Geist / Geist Mono y foco visible en `--signal`.
- `src/components/signal/signal.css` y `hud.tsx`: lenguaje visual de referencia (reglas, etiquetas mono en mayúsculas, bordes 1 px, numeración `01`).
- `src/app/globals.css`: tokens actuales. `data-surface="ink"` lo usa el admin.
- Código: `src/app/admin/**` y `src/components/admin/**`. `styles.ts` centraliza las clases.

## Archivos a tocar
- `src/components/admin/**`, `src/app/admin/**`: solo presentación (className, estructura JSX, textos de UI). **No cambies props de datos, actions ni lógica.**
- `src/app/globals.css`: tokens de `data-surface="ink"` mapeados a la paleta SIGNAL. Elimina los tokens `paper`, `bone`, `graphite` y `signal-*` naranja solo si nadie más los usa (compruébalo con grep).
- `src/components/signal/signal.css` y `src/components/signal/signal-page.tsx`: solo para el punto 2.

## Pasos
1. **Tokens:** `data-surface="ink"` = fondo `--bg`, superficies `#0B0A14`/`#12111C`, reglas `rgba(232,240,242,.10)`, texto `--ink`, secundario `--ash`, acento `--signal`, peligro `--coral`, foco de 2 px `--signal`.
2. **Layout del admin (`layout.tsx`):**
   - Barra lateral con la marca `■ N.A / ADMIN` en mono y navegación numerada en mono mayúsculas (`01 RESUMEN`…), activa en `--signal` con una regla a la izquierda.
   - Enlace "Ver web ↗" y botón "Cerrar sesión".
   - En móvil, barra superior con la navegación en scroll horizontal (objetivos ≥ 44 px).
3. **Componentes:**
   - Títulos H1 en Unbounded, con la etiqueta mono encima (`02 — REDES`).
   - Tarjetas y listas con borde 1 px, sin sombras ni redondeos grandes (radio ≤ 2 px).
   - Inputs oscuros con borde y foco en `--signal`.
   - Botón primario: fondo `--signal`, texto `#050507`.
   - Botón secundario: borde.
   - Peligro: `--coral`.
   - Estado de `ActionState`: éxito en `--signal` y error en `--coral`, con `role="status"` o `role="alert"`.
   - Insignias de estado mono: `PUBLICADO`, `BORRADOR`, `ACTIVO`, `OCULTO`, `DESTACADO`.
4. **Login:** misma estética, con una tarjeta centrada y la etiqueta `ACCESO RESTRINGIDO`.
5. **Resumen (`/admin`):** contadores en mono grande y estado del portfolio (publicado o no) como insignia, con enlaces a las acciones siguientes (p. ej., "Completa tu perfil" si no existe).
6. **Hero móvil (≤ 760 px):**
   - Haz que el nombre gane presencia vertical: ~25–30 % del alto en 390×844.
   - Una opción válida es partir en más líneas solo en móvil, sin cortar palabras, cuando una línea tiene una palabra larga.
   - Otra opción es subir el tamaño y reducir el interletrado.
   - Ajusta en consecuencia los objetivos de partículas, que se generan desde el mismo layout. El texto del DOM debe seguir siendo legible si no hay WebGL (T0).

## Criterio de terminado
- [ ] `node scripts/check-boundaries.mjs`, `node_modules/.bin/tsc --noEmit` y `node_modules/.bin/eslint` limpios; ninguna línea > 140 caracteres.
- [ ] Capturas revisadas por ti:
  - `node scripts/ui-shots.mjs scripts/ui-plans/admin.json` (requiere las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD`, que te da el planificador).
  - `GPU=1 node scripts/ui-shots.mjs scripts/ui-plans/signal-devices.json` (servidor DEMO en `:3100`).
- [ ] Docs: ninguno.

## Fuera de alcance
Server actions, DAL, Prisma, auth, `scripts/**` (salvo leerlos), dependencias y commits. No ejecutes `pnpm build`.

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-18 | planificador | Creado tras "arréglalo" del dueño |
