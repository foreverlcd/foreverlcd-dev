# Arnés: el esquema como contrato (cobertura, aserciones y fixture completa)

- **Área:** arnés (scripts)
- **Dificultad:** media (Sonnet implementer)
- **Rama:** feat/schema-driven-site (sin commit; integra el planificador)

## Objetivo
El gate pasaba en verde aunque la web no mostrara la foto, la biografía ni los repositorios del detalle. Hay que hacer **mecánico** que el sitio cumpla `docs/product/SPEC.md` y `docs/product/schema-map.json`, con tres piezas:
1. Una comprobación estática de cobertura del esquema, con trinquete.
2. Aserciones de contenido en `ui-shots`.
3. Una fixture que rellene **todos** los campos.

## Contexto mínimo
- `docs/product/SPEC.md`, `docs/product/schema-map.json`, `prisma/schema.prisma`.
- `scripts/gate.sh`, `scripts/check-boundaries.mjs` (estilo y mensajes con remedio), `scripts/ui-shots.mjs`, `scripts/create-admin.ts`, `scripts/register-ts-paths.mjs` y el script `admin:create` de `package.json` (cómo se ejecuta TS con Prisma desde Node).
- `.harness/seed-cv.ts` es un ejemplo de seed con transacción. **No lo copies**: contiene datos personales.

## Archivos a tocar
- NUEVO `scripts/check-schema-coverage.mjs`
- NUEVO `docs/product/coverage-baseline.json` (lo genera el script con `--write-baseline`)
- `docs/product/schema-map.json`: solo para añadir la clave `"$routes"` (ver paso 1)
- `scripts/gate.sh`: nuevo paso `coverage` después de `boundaries`
- `scripts/ui-shots.mjs`: pasos de aserción
- NUEVO `scripts/seed-fixture.ts` y script `"seed:fixture"` en `package.json` (mismo patrón que `admin:create`)
- NUEVO `scripts/ui-plans/coverage.json`

## Pasos
1. **`$routes` en `schema-map.json`:** asigna a cada ruta del mapa los archivos o carpetas que la renderizan.
   - `"/"` → `src/components/signal`, `src/app/page.tsx`.
   - `"/proyectos"` → `src/app/proyectos/page.tsx`, `src/components/public`.
   - `"/proyectos/[slug]"` → `src/app/proyectos/[slug]`, `src/components/public`.
   - `"/stack/[slug]"` → `src/app/stack/[slug]`, `src/components/public`.
   - `"meta"` → `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/opengraph-image.tsx`, `src/app/proyectos/[slug]/page.tsx`.
   - Las rutas con ancla (`/#sobre-mi`) usan la entrada de su ruta base (`/`).
2. **`check-schema-coverage.mjs`**, sin dependencias, en Node puro:
   - Parsea los bloques `model X { ... }` de `prisma/schema.prisma` para los modelos que aparecen en `schema-map.json`.
   - **Error** si un campo del esquema no está en el mapa, o si el mapa nombra un campo que no existe. Remedio: "añádelo a docs/product/schema-map.json con show/use/internal".
   - Para cada campo `show` y cada ruta, **cubierto** significa que el identificador aparece como acceso (`.campo`, `campo:` o `{ campo` en una desestructuración) en algún archivo `.ts`/`.tsx` de los archivos de esa ruta en `$routes`. Además, el campo debe aparecer seleccionado en algún archivo de `src/server/dal/` que no esté en `admin/` (`campo: true` o `campo: {`), salvo las relaciones, que pueden aparecer anidadas.
   - **Trinquete:** las parejas campo × ruta no cubiertas que estén en `coverage-baseline.json` se informan como deuda (aviso, salida 0). Una pareja nueva sin cubrir → **error**. Una pareja del baseline que ya está cubierta → **error** con el remedio "corre `node scripts/check-schema-coverage.mjs --write-baseline` para bajar el baseline". Así el baseline solo puede encoger.
   - Salida legible: resumen `cubiertos X / Y`, la lista de deuda agrupada por ruta y los errores con su remedio.
   - `--write-baseline` reescribe el baseline con las parejas actualmente no cubiertas.
3. **gate.sh:** paso `coverage` con `node scripts/check-schema-coverage.mjs`.
4. **`ui-shots.mjs`: aserciones.** Cada fallo cuenta como error, con un mensaje claro que incluya el paso:
   - `{ "expect": { "selector": "css", "text"?: "subcadena", "count"?: n, "min"?: n, "attr"?: { "name": "src", "includes": "res.cloudinary.com" } } }`.
   - `{ "expectStatus": { "path": "/x", "status": 404 } }`, con `fetch` directo.
   - Por cada run imprime `aserciones ok N/M`.
5. **`seed-fixture.ts`:**
   - **Aborta** si el host de `DATABASE_URL` no es `localhost` ni `127.0.0.1`, con el mensaje "solo base local".
   - Pide `--yes` para reemplazar el contenido del portfolio (no toques las tablas de auth: User, Session, Account, Verification).
   - Rellena **todos** los campos de `schema-map.json` con datos ficticios marcados como tales:
     - Nombre de 4 palabras: "Ada Valentina Ríos Mendoza (ficticio)". Biografía larga y una ubicación.
     - Foto: `https://res.cloudinary.com/demo/image/upload/sample.jpg`, `photoPublicId: "demo/sample"`. Perfil publicado.
     - 3 redes (GITHUB, LINKEDIN, WEBSITE) con URLs `https://example.com/...`.
     - 2 categorías con `description`. 6 skills con `description`: unas con `icon` de URL de Cloudinary demo y otras con un emoji.
     - 4 proyectos publicados, 2 destacados, más 1 en borrador (no debe verse):
       - Cada uno con portada (`res.cloudinary.com/demo/image/upload/...` con `width`, `height` y `format` reales de esas imágenes públicas de demo; comprueba las dimensiones con una petición HEAD o GET, y si no hay red usa 864×576 de `sample.jpg`).
       - 2 imágenes de galería en al menos uno.
       - Repositorios de los 3 tipos, `demoUrl`, fechas y skills.
     - 2 experiencias: una `isCurrent` y una con `employmentType` distinto de OTHER.
     - 2 formaciones: una con `credentialUrl` y `description`, y otra con `fieldOfStudy` igual a `degree`.
     - 1 experiencia inactiva, que no debe verse.
   - Usa los mismos textos de marcador en las aserciones del paso 6.
6. **`scripts/ui-plans/coverage.json`:** con la fixture cargada, aserciones por ruta según `SPEC.md`. Ejemplos:
   - En `/`: `#sobre-mi img[src*=res.cloudinary.com]`, el texto de la biografía, la insignia `DESTACADO`, "Ver credencial", los enlaces a `/stack/` y a `/proyectos`, y que el texto del borrador **no** aparezca (`count: 0`).
   - En `/proyectos/<slug>`: repositorio "Backend", la galería y las fechas.
   - En `/stack/<slug>`: el proyecto que la usa.
   - `expectStatus` 404 para un slug en borrador.
   - Hoy muchas aserciones fallarán, porque las páginas aún no existen. Es lo esperado: el plan es la especificación ejecutable de los siguientes exec-plans. Deja en `"$comment"` cuáles dependen de qué plan.
7. Genera el baseline inicial con `--write-baseline` y comprueba que `bash scripts/gate.sh` sigue verde (la deuda sale como aviso).

## Criterio de terminado
- [ ] `node scripts/check-schema-coverage.mjs` imprime la deuda actual y sale con 0. Si se quita un campo del mapa, sale con 1 y un remedio claro.
- [ ] `bash scripts/gate.sh` incluye `coverage` y pasa.
- [ ] `node --check` de los scripts. `tsc` y `eslint` limpios.
- [ ] `seed-fixture.ts` aborta contra un host no local. Pruébalo con `DATABASE_URL=postgresql://x@db.example.com/x`, sin conectar: debe abortar antes.
- [ ] **No ejecutes** la fixture contra la base local: reemplazaría los datos reales que está usando el dueño. Lo hace el planificador.
- [ ] Docs: ninguno (el planificador actualiza `HARNESS.md`).

## Fuera de alcance
`src/**`, Prisma, dependencias nuevas y git. No reinicies ni mates el servidor de `:3000`.

## Bitácora
| Fecha | Quién | Qué pasó |
|---|---|---|
| 2026-11-19 | planificador | Creado tras la directriz del dueño: "el esquema es lo que quiero; adapta el frontend" |
