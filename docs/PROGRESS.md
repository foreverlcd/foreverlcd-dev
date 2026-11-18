# Progreso

## Estado (2026-11-18)
- Rama de trabajo: `feat/adding-admin-user` con TODO sin commit (Etapa 3.1 + dirección Runtime + backend en curso). Pendiente de autorización del dueño para commits y push.
- Web pública: datos reales, portada estática con traza; **dirección de arte rechazada** → prototipos SPECTRA / SIGNAL / MEGASTRUCTURE en evaluación (fuera del repo).
- Backend/dashboard: delegado a codex (`docs/exec-plans/active/` → brief de dashboard); pendiente de verificación del planificador.
- Arnés: documentos y roles creados; scripts delegados a sonnet (`docs/exec-plans/active/2026-11-18-harness-scripts.md`).

## Siguiente paso
1. Verificar scripts del arnés y el dashboard (gate + capturas + revisión cruzada).
2. Presentar prototipos al dueño; reescribir `ART-DIRECTION.md` con el elegido.
3. Implementar la dirección elegida en `src/` reutilizando traza, modo lectura y bus.
4. Commits por etapa y push (con autorización).

## Decisiones recientes
- 2026-11-18: el planificador (Opus) diseña y revisa; la ejecución va a motores baratos (`docs/HARNESS.md`).
- 2026-11-18: portada estática con `revalidate = 86400` por el plan gratuito (Vercel Hobby + Postgres con suspensión).
- 2026-11-18: Three.js r187 sin React Three Fiber; WebGLRenderer + GLSL propio.
