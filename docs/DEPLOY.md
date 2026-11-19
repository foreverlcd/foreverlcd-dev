# Despliegue (gratis): Vercel Hobby + Neon Postgres + Cloudinary

## Estado actual (2026-11-19)
- **Producción:** https://foreverlcd.vercel.app (proyecto Vercel `foreverlcd`, equipo `foreverlcds-projects`). Rama de producción `main`, con el repositorio de GitHub conectado: cada push a `main` despliega.
- **Ajustes:** preset Next.js y Node 24.x (fijados por API; el proyecto se creó como "Other" y Node 26).
- **Neon:** proyecto `foreverlcd` (`snowy-water-03510300`), `aws-us-east-1`, Postgres 18, base `neondb` y rol `neondb_owner`. Migraciones aplicadas.
- **Variables de producción:**
  - `DATABASE_URL`: pooled y marcada como sensitive.
  - `BETTER_AUTH_SECRET`: generada y marcada como sensitive.
  - `BETTER_AUTH_URL`.
  - **Faltan** `CLOUDINARY_*`, que el dueño introduce en su terminal.
- **Regla:** las cadenas de conexión nunca se guardan en archivos ni se imprimen. Se piden en el momento con `neonctl connection-string --project-id snowy-water-03510300 [--pooled]`.

### Por CLI (lo que se hizo)
```bash
neonctl projects create --name foreverlcd --region-id aws-us-east-1 --pg-version 18
DATABASE_URL="$(neonctl connection-string --project-id <id>)" pnpm exec prisma migrate deploy   # directa
vercel project create foreverlcd && vercel link --yes --project foreverlcd && vercel git connect --yes
vercel api /v9/projects/foreverlcd -X PATCH -F framework=nextjs -F nodeVersion=24.x
vercel env add <NOMBRE> --environment production --sensitive --yes < archivo_temporal_600   # stdin desde archivo; con pipe directo llega vacío
```
- **Despliegue desde GitHub, no desde la carpeta local** (así nunca sube `.env.local`): `POST /v13/deployments` con `gitSource {type: github, ref: main, repoId}` (`vercel api ... --input -`).
- **Las variables nuevas solo aplican en el siguiente despliegue.**

Todo sin tarjeta ni dominio propio. La URL final queda como `https://<proyecto>.vercel.app`.

## Una sola vez (requiere tus cuentas)

### 1. Proyecto en Vercel
1. Entra en https://vercel.com con tu cuenta de GitHub, haz clic en **Add New → Project** e importa `foreverlcd/foreverlcd-dev`.
2. Elige como **Production Branch** `main`. Framework: Next.js (se detecta solo). No cambies los comandos.
3. Todavía no despliegues: primero ve al paso 2.

### 2. Base de datos Neon (desde Vercel)
1. En el proyecto de Vercel, abre **Storage → Create Database → Neon (Postgres)** con el plan Free, en una región cercana a la de Vercel (`iad1` por defecto).
2. Vercel crea y conecta `DATABASE_URL` (y otras variables `POSTGRES_*`) en los entornos que elijas.
3. Copia la cadena de conexión **directa (no pooled)** para aplicar las migraciones desde tu equipo (paso 4).

### 3. Variables de entorno (Vercel → Settings → Environment Variables)
| Variable | Valor |
|---|---|
| `DATABASE_URL` | La pone Neon. Usa la **pooled** en runtime. |
| `BETTER_AUTH_SECRET` | Genera una con `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | `https://<proyecto>.vercel.app` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | De tu cuenta gratuita de Cloudinary (Dashboard → API Keys). |
| `NEXT_PUBLIC_SITE_URL` (opcional) | Solo si quieres otra URL canónica. Sin ella se usa `VERCEL_PROJECT_PRODUCTION_URL`. |

No existe `PORTFOLIO_DEMO` en producción: el modo DEMO está desactivado allí por código.

### 4. Migraciones y administrador (desde tu equipo)
Las variables escritas en la misma línea tienen prioridad sobre `.env`, así que tu `.env` local no se toca:
```bash
DATABASE_URL='<cadena directa de Neon>' pnpm exec prisma migrate deploy
DATABASE_URL='<cadena directa de Neon>' ADMIN_EMAIL='tu@correo' ADMIN_PASSWORD='<fuerte>' ADMIN_NAME='Tu nombre' pnpm admin:create
```

### 5. Desplegar
1. Fusiona la rama de trabajo en `main` (PR) o despliega desde Vercel.
2. Entra en `https://<proyecto>.vercel.app/admin/login` y completa tu contenido.
3. Sube tu foto: la base exige foto para publicar el perfil.
4. Publica el perfil. La portada se regenera al guardar (`revalidatePath`) y, como mucho, una vez al día.

## Comprobaciones tras desplegar
- `/api/health` devuelve `{"database":"ok"}`.
- `/robots.txt` y `/sitemap.xml` usan la URL `*.vercel.app`.
- Comparte el enlace en LinkedIn (Post Inspector) y comprueba que salen la imagen y el titular.

## Límites del plan gratuito a tener en cuenta
- Neon se suspende tras 5 minutos sin uso. La portada es estática, así que el visitante no lo nota; el primer acceso al admin tarda 1–2 s más.
- Vercel Hobby es para uso personal y no comercial, y eso cubre un portfolio.
