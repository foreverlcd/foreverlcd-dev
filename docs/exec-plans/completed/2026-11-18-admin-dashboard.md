# Brief — Etapa B: dashboard de administración (backend completo)

Repositorio: `/home/foreverlcd/Projects/Personal/foreverlcd-dev` (Next.js 16.4.3 App Router, React 19.3, TS, Tailwind 4, Prisma 7 + `@prisma/adapter-pg`, PostgreSQL, Better Auth 1.7 con plugin `admin`, zod 4 ya instalado).

## Reglas duras
- **Lee primero `AGENTS.md`.** Next 16 tiene cambios incompatibles con lo que sabes. Antes de escribir código lee en `node_modules/next/dist/docs/01-app/`: `01-getting-started/07-mutating-data.md`, `09-revalidating.md`, `02-guides/forms.md`, `02-guides/authentication.md`, `02-guides/data-security.md`, `02-guides/server-actions.md`, `01-getting-started/16-proxy.md`. Sigue esas guías, no tu memoria.
- Better Auth: lee los tipos en `node_modules/better-auth` antes de usar cualquier API (`auth.api.getSession`, plugin admin, cliente `better-auth/react`, `adminClient`). No inventes APIs.
- **No** hagas commits, push, `git add`, ni toques `.env`. Puedes añadir variables a `.env.example`.
- **No** instales dependencias. Si crees que falta una, detente y explícalo en tu informe final.
- **No** modifiques: `src/components/runtime/**`, `src/app/page.tsx`, `src/server/portfolio/**`, `prisma/schema.prisma`, `prisma/migrations/**`. Si el esquema necesita un cambio, descríbelo en el informe, no lo apliques.
- Comentarios en español, breves y solo donde aporten. Código en inglés.
- Todo acceso a datos vive en `src/server/` con `import "server-only"`.

## Contexto existente que debes reutilizar
- `src/lib/auth.ts` (registro público deshabilitado, plugin admin), `src/app/api/auth/[...all]/route.ts`.
- `src/lib/prisma.ts`, DAL público en `src/server/dal/**` (no lo rompas; la portada lo usa).
- Esquema en `prisma/schema.prisma`: Profile (singleton id "main"), SocialLink, SkillCategory, Skill, Project (+ProjectImage COVER/GALLERY, ProjectRepository, ProjectSkill), Experience, Education.
- La portada pública `/` es estática con `revalidate = 86400`. **Toda mutación debe llamar a `revalidatePath("/")`** (y a la ruta de detalle del proyecto si aplica: `/proyectos/[slug]`).

## Entregables

### 1. Autorización
- `src/server/auth/require-admin.ts`: `requireAdmin()` obtiene la sesión con `auth.api.getSession({ headers: await headers() })`, exige `user.role === "admin"` y si no, `redirect("/admin/login")`. También `getAdminSession()` que devuelve null sin redirigir.
- Cada Server Action vuelve a verificar con `requireAdmin()` (no confíes solo en el layout). Sigue `data-security.md`.
- Protección optimista de `/admin/**` (excepto `/admin/login`) según la guía de `proxy.md` de Next 16 (no `middleware.ts` si la guía dice que se renombró).
- `src/lib/auth-client.ts` con `createAuthClient` + `adminClient()`.
- Script `scripts/create-admin.ts` (+ script `"admin:create"` en package.json usando `node --env-file=.env --experimental-strip-types` o lo que funcione con Node 24 y el cliente Prisma generado en `src/generated/prisma`): crea o promueve el usuario administrador leyendo `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` de variables de entorno. Usa la API de servidor de Better Auth para crear el usuario con contraseña hasheada correctamente (respetando `disableSignUp`; investiga en los tipos cómo crear usuarios desde el servidor, p. ej. `auth.api.createUser` del plugin admin o el contexto interno de hash). Documenta en `.env.example`.

### 2. Server Actions (`src/server/actions/<dominio>.ts`)
- Validación con zod 4 en cada action. Mensajes de error en español.
- Patrón de retorno uniforme para `useActionState`: `{ ok: true, message } | { ok: false, message, fieldErrors }` en `src/server/actions/action-state.ts`.
- Dominios:
  - **profile**: actualizar perfil (fullName, headline, shortBio ≤280, biography, location, email, photoUrl/photoPublicId), publicar/despublicar.
  - **social links**: crear, editar, borrar, reordenar, activar/desactivar.
  - **skill categories / skills**: CRUD, reordenar, activar; slug autogenerado y único (normaliza acentos); impedir borrar categoría con skills (Restrict en el esquema) con mensaje claro.
  - **projects**: CRUD, estado DRAFT/PUBLISHED, destacado, orden, fechas; skills asociadas (reemplazo atómico en `$transaction`); repositorios (lista editable); slug único.
  - **project images**: registrar imagen subida (publicId, secureUrl, width, height, format, alt obligatorio, tipo COVER/GALLERY — como mucho un COVER por proyecto), editar alt, reordenar, borrar (también en Cloudinary).
  - **experience / education**: CRUD, reordenar, activar.
- Reordenar: acción que recibe lista de ids y reescribe `displayOrder` en transacción.

### 3. Cloudinary sin SDK
- `src/server/cloudinary.ts`: firma SHA-1 de parámetros según la documentación de "signed uploads" de Cloudinary (parámetros ordenados alfabéticamente, `api_secret` concatenado). `destroyImage(publicId)` vía `POST https://api.cloudinary.com/v1_1/<cloud>/image/destroy` firmado.
- Route handler `src/app/api/admin/cloudinary/signature/route.ts` (solo admin) que devuelve `{ timestamp, signature, apiKey, cloudName, folder }` con carpeta fija `foreverlcd/projects` o `foreverlcd/profile`.
- Variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` en `.env.example`. Si faltan, la UI de subida muestra un aviso y el resto del dashboard funciona.
- `next.config.ts`: añade `images.remotePatterns` para `res.cloudinary.com` (lee la guía de imágenes de Next 16 antes).

### 4. UI del dashboard (`src/app/admin/**`)
- Funcional, accesible y sobria; se re-estilizará después. Usa clases de Tailwind y los tokens existentes de `src/app/globals.css` con `data-surface="ink"` en el layout. Puedes reutilizar `src/components/ui/*`.
- Páginas: `/admin/login` (email + contraseña con el cliente de Better Auth, errores visibles), `/admin` (resumen: conteos, estado publicado, enlace a la web), `/admin/perfil`, `/admin/proyectos` (+ `/nuevo`, `/[id]`), `/admin/skills`, `/admin/experiencia`, `/admin/formacion`. Navegación lateral, botón de cerrar sesión.
- Formularios con `useActionState`, estados pendientes, errores por campo, confirmación antes de borrar (sin `window.confirm`: usa un segundo clic o `<dialog>`).
- Subida de imágenes: componente cliente que pide firma, sube directo a Cloudinary con `fetch` + `FormData`, y luego llama a la action que registra la imagen.
- `export const dynamic`/caché: el dashboard no se cachea (lee la guía; usa lo que corresponda en Next 16).

### 5. Ruta pública de detalle
- `src/server/dal/projects/get-published-project-by-slug.ts` ya existe. Crea `src/app/proyectos/[slug]/page.tsx` con `generateStaticParams` desde proyectos publicados, `revalidate = 86400`, `notFound()` si no existe, metadata. Maquetación mínima y limpia (se rediseñará); NO uses los componentes de `src/components/runtime`.

## Verificación obligatoria antes de terminar
1. `pnpm exec tsc --noEmit` sin errores.
2. `pnpm lint` sin errores.
3. Si tienes acceso a la base local (`DATABASE_URL` en `.env`, Postgres en Docker en localhost:5434), ejecuta un script de humo en `scripts/` que cree un perfil, una categoría, una skill, un proyecto con skill y repositorio, y luego lo borre todo. Si no hay red en tu sandbox, dilo explícitamente.
4. No ejecutes `next build` si no hay acceso a la base de datos; dilo.

## Informe final (en español)
- Lista de archivos creados/modificados.
- Qué verificaste de verdad y qué no.
- Decisiones tomadas y cualquier cambio de esquema que recomiendes.
- Riesgos o dudas.
