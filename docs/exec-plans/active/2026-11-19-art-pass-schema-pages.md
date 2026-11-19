# Pase de arte: páginas nuevas con lenguaje SIGNAL y estados parciales dignos

- **Área:** web pública
- **Dificultad:** media (Sonnet implementer; revisan art-reviewer y el planificador)
- **Rama:** feat/schema-driven-site (sin commit)

## Objetivo
La revisión de arte con datos reales (`.harness/runs/`, 2026-11-19) encontró dos problemas.
- **Ruptura de estilo:** la portada es inmersiva, pero `/proyectos`, la ficha y `/stack/[slug]` parecen una plantilla oscura genérica.
- **Estados vacíos o parciales:** sin portada, sin skills o sin proyectos, las páginas parecen rotas.

Los datos reales del dueño todavía no tienen portadas ni skills por proyecto, y así se verán hasta que los suba. Hay que corregir ambas cosas sin escena WebGL en esas páginas.

## Contexto mínimo
- `docs/ART-DIRECTION.md`
- `docs/product/SPEC.md`
- `src/components/signal/signal.css`: tokens, `SIGNAL_CYCLE`, `sg-*` y el marco HUD de `.sg-about`.
- `src/components/public/*`, `src/app/proyectos/**`, `src/app/stack/[slug]/page.tsx`.
- `src/components/signal/sections/projects-section.tsx` y `signal-page.tsx`: solo las secciones de proyectos y contacto, más el hero móvil.

## Pasos
1. **Placa de proyecto sin portada:** componente `ProjectPlate` en `src/components/public`, usado en la tarjeta, la ficha y la portada.
   - **Siglas:** iniciales de las palabras significativas.
     - Se ignoran los guiones sueltos, "—" y palabras vacías como de, la, del o y.
     - Los romanos se convierten en dígito (III → 3) y un número se conserva con hasta 2 cifras.
     - Mínimo 2 y máximo 4 caracteres. Ejemplos: "NeuroKup III — Categoría Alpha" → "NK3"; "Auto-Menu" → "AM"; "Datathon SUNASS 2026" → "DS26".
     - Sácalo a una función pura `projectInitials`, con un test de ejemplos en `node --test` si hay infraestructura; si no, tabla en el informe.
   - **Color:** el de señal del proyecto, rotando signal → uv → coral según el orden del índice.
   - **Fondo:** halo `radial-gradient` de esa señal al 14 % más una textura de puntos al 8 %.
   - **Marco:** esquinas de retícula de 12 px y pie mono `RET · P<n>`.
   - **Proporción:** 16/10 en la rejilla, 16/6 en móvil y 16/6 de ancho completo en la ficha.
2. **Coherencia entre páginas:**
   - `SiteHeader` usa la misma marca que el HUD de la portada: las iniciales con el cuadrado `--signal` y el nombre en mono.
   - Cabecera y contenido comparten contenedor y gutter.
   - Fondo con atmósfera estática en CSS: un gradiente radial `--uv` tenue más la regla de ticks bajo la cabecera, como en la portada.
3. **Ficha:**
   - La placa o la portada va arriba.
   - Debajo, una tira de metadatos mono "Fechas / Stack / Repositorio / Demo", con `—` en `--ash` para lo que falte. Los bloques vacíos no se pintan.
   - **Fechas:** si coinciden los años, "ene — dic 2026"; si coincide todo, solo el mes y el año.
   - **Anterior/Siguiente:** dos cajas de 1 px, ≥ 56 px de alto, anterior a la izquierda y siguiente a la derecha.
4. **`/stack/[slug]`:**
   - Si no hay proyectos, una caja de borde discontinuo con "Aún sin proyectos publicados con {skill}".
   - Siempre se muestran las skills hermanas de su categoría como chips y un enlace "Ver todos los proyectos →".
   - Para las hermanas, amplía el DAL de la skill y selecciona solo campos públicos.
5. **Índice `/proyectos`:**
   - En desktop, la primera tarjeta destacada ocupa 2 columnas si así se cierra la rejilla.
   - En móvil, la placa es 16/6.
6. **Portada:**
   - **Proyectos en desktop:** títulos con `clamp(22px, 2.4vw, 36px)` y la flecha en la línea del título. Que quepan ~3 filas por pantalla cuando no hay portada.
   - **Contacto:** el correo no se parte a mitad (mono 500 o `clamp` más pequeño, con `overflow-wrap: anywhere` solo como último recurso).
   - **CTA de contacto:** un `mailto:` relleno (`--signal` con texto `--bg`, ≥ 48 px) y un botón "Copiar correo" con un island cliente mínimo, `aria-live` "Copiado".
   - **Redes:** enlaces sociales ≥ 44 px.
   - **Hero móvil:** cierra el hueco de ~230 px entre el nombre y el texto. No toques los textos.
   - **`#sobre-mi` en ≤ 760 px:** foto de 96×120 junto a los datos y la biografía debajo a ancho completo.

## Criterio de terminado
- [ ] `bash scripts/gate.sh` en verde. JS inicial de `/` ≤ 230 kB. Cobertura 85/85.
- [ ] Sin cambios en los textos del contenido ni en Prisma, dependencias o git.
- [ ] **No ejecutes** ui-shots, la fixture ni el seed. No mates el servidor de `:3000`.

## Fuera de alcance
- Escena WebGL en las páginas nuevas.
- Retrato en partículas.
- La línea temporal de la trayectoria (BAJA; plan posterior).

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-19 | planificador | Creado desde la revisión de arte con datos reales (veredicto CAMBIOS) |
