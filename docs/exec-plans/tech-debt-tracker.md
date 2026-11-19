# Deuda técnica

## Abierta

| Fecha | Área | Deuda | Impacto | Plan |
|---|---|---|---|---|
| 2026-11-18 | calidad | No hay tests unitarios (sin runner) | Regresiones en actions y validación | Proponer Vitest para `src/server/**` (requiere autorizar la dependencia) |
| 2026-11-19 | arnés | `check-schema-coverage.mjs` empareja por nombre de campo, sin modelo: `name`, `title`, `url` o `description` pueden darse por cubiertos por coincidencia ajena | Falsos verdes de cobertura; la red real son las aserciones de `coverage.json` con la fixture | Emparejar por tipo (AST o tipos de Prisma) si aparecen falsos positivos |
| 2026-11-19 | web | `formatMonthRange` en `src/components/public/dates.ts` ya no se usa (la ficha usa `formatMonthRangeShort`) | Código muerto menor | Borrarlo en el próximo cambio de esa zona |
| 2026-11-19 | arnés | `coverage.json` exige la fixture y un servidor sobre esa base; no corre en el gate | Las aserciones dependen de que el planificador las ejecute | Base efímera en CI (Neon branch o Postgres en Docker) |

## Resuelta

| Fecha | Área | Deuda | Cómo se resolvió |
|---|---|---|---|
| 2026-11-18 | web | `src/components/site/` (Etapa 3.1) sin uso | Borrado al integrar SIGNAL |
| 2026-11-18 | web | `src/components/runtime/` de la dirección rechazada | Sustituido por `src/components/signal/` |
| 2026-11-18 | infra | Next 16.4.3 con aviso de vulnerabilidad | Next 16.4.6, fusionado en `main` |
| 2026-11-18 | harness | `ui-shots` solo con SwiftShader (fps irreales) | `GPU=1` (Vulkan, RTX 3050 Ti) y `GPU=egl` |
