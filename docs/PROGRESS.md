# Progreso

## Estado (2026-11-18)
- **Ramas:**
  - `main` tiene Next 16.4.6, el parche de seguridad.
  - `feat/adding-admin-user` contiene el backend y el dashboard.
  - `feat/signal-experience` contiene el arnés, la dirección SIGNAL y la portada nueva, e incorpora `main`.
  - Todas están subidas a GitHub.
- **Web pública:**
  - Portada SIGNAL / ESTRUCTURA implementada (`src/components/signal/`), estática con revalidación diaria.
  - JS inicial: 196,6 kB gzip; Three.js va diferido.
  - Verificada con GPU real (RTX 3050 Ti) en 7 viewports, de 360 a 2560 px, más el modo reducido: 60 fps y 0 errores en contenido DEMO.
  - Niveles T2/T1/T0 con degradación adaptativa.
- **Dashboard:**
  - CRUD completo de perfil, redes, skills, proyectos (repos, skills, imágenes), experiencia y formación.
  - E2E con la base real: login y creación de red; sin perfil devuelve un mensaje claro (antes daba 500 por la FK).
  - Revisión cruzada de codex aplicada.
- **Arnés:**
  - `gate.sh` (GATE_STRICT con base de datos).
  - `ui-shots.mjs` con `GPU=1`.
  - `delegate.sh` con `REVIEW_PATHS` y el prompt en archivo para agy y opencode.
  - Lecciones en `docs/harness/LOG.md`.

## Actualización (2026-11-18, tarde)
- Datos reales del CV del dueño cargados en la base LOCAL con `.harness/seed-cv.ts` (ignorado por git). La foto provisional es el avatar de GitHub, solo en local.
- Los datos reales revelaron fallos que el DEMO ocultaba, y ya están corregidos:
  - nombre de 4 palabras en móvil y tableta;
  - iniciales (J.Q);
  - correo largo partido a mitad de palabra;
  - tipo de empleo "Otro" visible;
  - publicar sin foto daba 500.
- SEO: metadatos, OG, canónica, `sitemap.xml`, `robots.txt` y `/opengraph-image`, todo estático.
- Dashboard con lenguaje SIGNAL (regla HUD y línea de estado).
- Guía de despliegue: `docs/DEPLOY.md`.

## Siguiente paso
1. Revisión de arte (`art-reviewer`) de `.shots/signal-devices/` y decidir `passes` de pub-hero, pub-projects, pub-path, pub-stack, pub-contact y pub-webgl-fallback.
2. Rediseñar el dashboard con la paleta y las tipografías SIGNAL. Hoy hereda las fuentes nuevas, pero conserva el layout antiguo.
3. SEO: metadatos, OG, sitemap y robots (pub-seo).
4. Despliegue en Vercel Hobby con Postgres gratuito (Neon); variables en el panel, nunca en el repo.
5. Contenido real del dueño desde el dashboard. No inventar datos.

## Datos de prueba locales
En la base local quedan datos de prueba E2E: el admin `e2e-admin@example.test`, el perfil "E2E Perfil" sin publicar y la red "E2E enlace". No usan datos reales; se sobrescriben desde el dashboard.

## Decisiones recientes
- 2026-11-18: dirección de arte SIGNAL (base) + MEGASTRUCTURE (acentos), elegida por el dueño; debe verse en todos los dispositivos (`ART-DIRECTION.md`).
- 2026-11-18: Next 16.4.3 → 16.4.6 por aviso de seguridad, parche manual (no `--agent=security`), fusionado a `main` con autorización del dueño.
- 2026-11-18: el planificador (Opus) diseña y revisa; la ejecución va a motores baratos (`docs/HARNESS.md`).
- 2026-11-18: portada estática con `revalidate = 86400` por el plan gratuito (Vercel Hobby + Postgres con suspensión).
- 2026-11-18: Three.js r187 sin React Three Fiber; WebGLRenderer + GLSL propio.
