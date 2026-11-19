# Progreso

## Estado (2026-11-19)
- **Producción:** https://foreverlcd.vercel.app
  - Vercel Hobby, conectado a GitHub: cada push a `main` despliega.
  - Neon Postgres 18 (`aws-us-east-1`), migraciones aplicadas.
  - Admin creado por el dueño. Las 6 variables están cargadas, Cloudinary incluido.
  - Comprobado:
    - `/api/health` → `database: ok`;
    - login falso → 401;
    - firma de Cloudinary sin sesión → 401;
    - `/admin` sin sesión → redirige a `/admin/login`.
  - El sitio muestra "En compilación" hasta que el dueño publique su perfil. Detalle en `docs/DEPLOY.md`.
- **Ramas:**
  - `main` contiene todo, por el PR #4 (que sustituyó al #3).
  - `chore/production-deploy`: documentación del despliegue y de esta actualización.
- **Contrato de producto:** `prisma/schema.prisma` manda (directriz del dueño, 2026-11-18). `docs/product/SPEC.md` + `schema-map.json`; la cobertura es 85/85 parejas campo × ruta y el gate la exige.
- **Web pública:**
  - `/`:
    - SIGNAL / ESTRUCTURA con escena WebGL T2/T1/T0;
    - secciones hero, `#sobre-mi`, destacados, trayectoria, stack, contacto y traza.
  - `/proyectos`: índice con filtro por skill.
  - `/proyectos/[slug]`: placa o portada, tira de metadatos, galería y anterior/siguiente.
  - `/stack/[slug]`: proyectos y skills hermanas.
  - Todo estático con revalidación diaria más `revalidatePath` desde el dashboard. Sin perfil publicado, `/` muestra la espera y el resto devuelve 404.
  - JS inicial de `/`: 202 kB gzip (presupuesto 230).
  - Verificado con GPU real (RTX 3050 Ti) en 7 viewports de portada y 3 de páginas: 60 fps y 0 errores, con datos reales y con la fixture (50/50 aserciones).
- **Dashboard:**
  - CRUD completo.
  - Las imágenes solo se aceptan de `res.cloudinary.com`, porque otro host rompía `next/image`.
  - Publicar exige foto.
- **Arnés:** `gate.sh` comprueba:
  - boundaries, incluida la R5 sobre toda página pública;
  - cobertura del esquema;
  - tipos, lint, build, presupuestos y secretos.

  Además:
  - `ui-shots.mjs`: `GPU=1`, aserciones, error por scroll horizontal y diagnóstico de 500.
  - Fixture `pnpm seed:fixture --yes`, solo contra una base local.
  - `delegate.sh`.
  - Lecciones en `docs/harness/LOG.md`.

## Siguiente paso
1. **Dueño:** cargar el contenido real en producción desde `/admin`:
   - foto;
   - `shortBio` propio (el del seed local repetía el titular);
   - redes, experiencia y formación;
   - skills con categorías;
   - por proyecto: skills, repositorios, portada y destacados.

   Después, publicar el perfil.
2. Con el contenido en producción: capturas con GPU contra `https://foreverlcd.vercel.app` (`BASE_URL=...`) y nueva revisión de arte.
3. Pendientes de arte (BAJA): línea temporal en trayectoria y retrato en partículas desde `photoUrl`.
4. Marcar tras verificarlas en el navegador: `pub-webgl-fallback`, `pub-reading-mode` y `adm-*` (credenciales malas, action sin sesión, imágenes con Cloudinary real).
5. Fusionar `chore/production-deploy` en `main`.

## Datos de prueba locales
- La base LOCAL (Docker, puerto 5434) tiene los datos reales del CV, cargados con `.harness/seed-cv.ts` (ignorado por git).
- La foto es una imagen demo de Cloudinary.
- Para la cobertura se carga la fixture ficticia con `pnpm seed:fixture --yes`. Después se restaura el CV con `node --env-file=.env --experimental-strip-types --import ./scripts/register-ts-paths.mjs .harness/seed-cv.ts`.
- Quedan también el admin E2E `e2e-admin@example.test` (solo local).

## Decisiones recientes
- 2026-11-19: despliegue en `foreverlcd.vercel.app`.
  - Neon con proyecto propio, separado de "STEAM Society".
  - Las cadenas de conexión nunca se guardan: se piden a `neonctl` en el momento.
  - Despliegues desde GitHub, no desde la carpeta local.
- 2026-11-19: PR #4 sustituye al #3 y se fusiona en `main` (autorizado por el dueño).
- 2026-11-19: las relaciones estructurales del mapa (`Profile.education`/`experiences`, `Project.images`, `ProjectSkill.skill`) son `use`; la cobertura se comprueba en sus campos hijos.
- 2026-11-19: fechas de la ficha en formato corto ("feb — set 2023"), tras la revisión de arte.
- 2026-11-18: el esquema es el contrato de producto; el frontend se adapta, nunca al revés.
- 2026-11-18: dirección de arte SIGNAL (base) + MEGASTRUCTURE (acentos), en todos los dispositivos (`ART-DIRECTION.md`).
- 2026-11-18: Next 16.4.3 → 16.4.6 por aviso de seguridad.
- 2026-11-18: el planificador (Opus) diseña y revisa; la ejecución va a motores baratos (`docs/HARNESS.md`).
- 2026-11-18: web pública estática con `revalidate = 86400` por el plan gratuito.
- 2026-11-18: Three.js r187 sin React Three Fiber; WebGLRenderer + GLSL propio.
