# Calidad por área

Nota de 0 a 5 (5 = verificado de punta a punta y con reglas mecánicas). Se actualiza al cerrar cada etapa.

| Área | Nota | Evidencia | Qué falta |
|---|---|---|---|
| Web pública: datos y caché | 4 | Ruta estática `○ /`, traza real medida | revalidatePath desde el dashboard |
| Web pública: dirección de arte | 1 | Dirección "Runtime" rechazada | Elegir prototipo e implementarlo |
| Web pública: accesibilidad/fallbacks | 3 | reduced motion, modo lectura, fallback CSS | Verificar sin WebGL y con lector de pantalla |
| Dashboard | 0 | En construcción (codex) | Todo |
| Auth | 2 | Better Auth + plugin admin, registro deshabilitado | Guard, login, creación de admin |
| Imágenes | 0 | — | Cloudinary firmado |
| Tests automáticos | 0 | Sin runner | Vitest para validaciones y actions |
| Arnés | 3 | Docs, roles, LOG, plan de scripts | Verificar scripts de punta a punta |
