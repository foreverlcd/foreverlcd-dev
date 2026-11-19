# foreverlcd.dev

Portfolio profesional con dashboard privado para administrar su contenido.

- **Producción:** https://foreverlcd.vercel.app
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Prisma 7 + PostgreSQL, Better Auth, Three.js, Anime.js y Cloudinary.
- **Hosting:** gratuito, con Vercel Hobby y Neon.

## Desarrollo local

Requiere Node 24, pnpm y Docker.

```bash
cp .env.example .env     # rellena los valores
bash scripts/init.sh     # Postgres (Docker, puerto 5434) + migraciones + servidor en :3000
```

- `PORTFOLIO_DEMO=1 pnpm dev`: contenido DEMO sin base de datos.
- `pnpm admin:create`: crea el administrador (variables `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NAME`).
- `pnpm seed:fixture --yes`: carga datos ficticios completos. Solo funciona con una base local y reemplaza el contenido del portfolio.

## Calidad

```bash
bash scripts/gate.sh                                         # boundaries, cobertura del esquema, tipos, lint, build, presupuestos, secretos
GPU=1 node scripts/ui-shots.mjs scripts/ui-plans/signal-devices.json   # capturas con la GPU real
```

## Documentación

- Para agentes: empezar por `AGENTS.md`. El índice está en `docs/00-INDEX.md`.
- Qué muestra la web: `docs/product/SPEC.md`. El esquema de Prisma es el contrato.
- Arquitectura: `docs/ARCHITECTURE.md`.
- Dirección de arte: `docs/ART-DIRECTION.md`.
- Despliegue: `docs/DEPLOY.md`.
- Estado actual: `docs/PROGRESS.md`.
