# Calidad por área

Nota de 0 a 5 (5 = verificado de punta a punta y con reglas mecánicas). Se actualiza al cerrar cada etapa. Última revisión: 2026-11-19.

| Área | Nota | Evidencia | Qué falta |
|---|---|---|---|
| Web pública: datos y caché | 5 | Rutas `○`/`●` con revalidación de 1 día. `revalidatePortfolio` cubre `/`, `/proyectos`, `/proyectos/[slug]` y `/stack/[slug]`. La R5 lo exige en toda página pública. 404 sin perfil publicado (probado) | — |
| Web pública: cobertura del esquema | 4 | `check-schema-coverage` 85/85 con trinquete en el gate; fixture con 50/50 aserciones | Empareja por nombre de campo, no por modelo (ver deuda) |
| Web pública: dirección de arte | 4 | SIGNAL aplicado. Dos revisiones de arte (la segunda con datos reales y su pase aplicado). 7 viewports con GPU | Revisión con el contenido real de producción; línea temporal y retrato en partículas |
| Web pública: accesibilidad/fallbacks | 3 | Movimiento reducido, modo lectura, T0 sin WebGL, objetivos táctiles ≥ 44 px, `aria-live` al copiar | Pasada con lector de pantalla; `pub-webgl-fallback` y `pub-reading-mode` sin marcar |
| Dashboard | 4 | CRUD completo, E2E con login y creación. Guardas de perfil y foto. Las URLs de imagen solo pueden ser de Cloudinary | E2E de imágenes con Cloudinary real |
| Auth | 4 | Better Auth + admin, registro deshabilitado. En producción: login falso → 401, `/admin` → login, firma sin sesión → 401 | Rotación de sesión y límite de intentos sin verificar |
| Imágenes | 3 | Subida firmada sin SDK y whitelist de carpetas. `next/image` con dimensiones reales | Primera subida real en producción |
| Despliegue | 4 | Vercel + Neon por CLI, health ok, variables sensibles, despliegue desde GitHub | Monitorizar la suspensión de Neon y los límites del plan Hobby |
| Tests automáticos | 1 | Aserciones de contenido (ui-shots) y gate | Runner unitario (Vitest) para validaciones y actions |
| Arnés | 4 | Contrato, cobertura, aserciones, fixture, GPU, revisión cruzada codex, art-reviewer; LOG al día | Cobertura por modelo; ejecutar `coverage.json` en CI |
