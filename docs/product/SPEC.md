# Especificación de producto: el esquema manda

> **Regla del dueño (2026-11-18):** `prisma/schema.prisma` describe exactamente lo que el portfolio debe dar a conocer. El frontend se adapta al esquema, nunca al revés. Si un dato del esquema no tiene dónde mostrarse, se crea la sección o la página que haga falta.
> Correspondencia campo por campo: `docs/product/schema-map.json`. La valida `scripts/check-schema-coverage.mjs` dentro de `scripts/gate.sh`.

## Rutas públicas

| Ruta | Propósito | Datos |
|---|---|---|
| `/` | Portada: quién es, qué ha hecho lo más destacado, cómo contactar | Profile completo, SocialLink, proyectos **destacados**, Experience, Education, SkillCategory/Skill, contacto, traza |
| `/proyectos` | **Nueva.** Índice de todos los proyectos publicados | Project (portada, título, descripción corta, fechas, destacado, skills), con filtro por skill en el cliente |
| `/proyectos/[slug]` | Ficha completa del proyecto | Project completo: portada, galería, descripción, fechas, skills, repositorios por tipo, demo y navegación anterior/siguiente |
| `/stack/[slug]` | **Nueva.** Página de cada skill: qué es y en qué proyectos se usó | Skill (nombre, icono, descripción, categoría) y los Project publicados que la usan |

Todas son estáticas (SSG/ISR, `revalidate = 86400`) y las mutaciones del dashboard las revalidan con `revalidatePath`. Comparten la misma cabecera, navegación y lenguaje SIGNAL (`docs/ART-DIRECTION.md`). La escena WebGL completa solo existe en `/`; las demás páginas usan, como mucho, una versión ligera (HUD, reglas, una figura de partículas pequeña) y deben verse perfectamente sin WebGL.

## Secciones de `/`, en orden
1. **Hero:** `fullName` (en partículas y en texto real), `headline`, `shortBio`, `location`, CTA a proyectos y a contacto. El nombre se presenta completo, con el número de palabras que tenga: de 3 o más palabras se reparten en 2 líneas equilibradas, sin deformar la tipografía.
2. **`#sobre-mi` (nueva):** `photoUrl` (obligatoria para publicar, así que siempre existe), `biography` completa, `location`, `email` y las `socialLinks` activas con su `platform`/`label`. En SIGNAL, las partículas pueden formar el retrato a partir de `photoUrl`. La imagen real siempre está en el DOM (`next/image`, `alt` = `fullName`).
3. **`#proyectos`:** proyectos `isFeatured` con portada (`ProjectImage` tipo COVER: `secureUrl`, `alt`, `width`, `height`), título, `shortDescription`, fechas, skills (enlazan a `/stack/[slug]`), repositorios y demo. Insignia `DESTACADO`. Enlace "Ver todos los proyectos (N)" a `/proyectos`. Si no hay destacados, los primeros por `displayOrder`. La figura de partículas de cada proyecto sale de su portada; sin portada, de las siglas del título.
4. **`#trayectoria`:**
   - Experience: `jobTitle`, `company`, `employmentType` (etiqueta; `OTHER` no se muestra), `location`, fechas, `isCurrent` ("actual") y `description`.
   - Education: `degree`, `institution`, `fieldOfStudy` (solo si difiere de `degree`), `type` (etiqueta), `location`, fechas, `isCurrent`, `description` y `credentialUrl` ("Ver credencial ↗").
5. **`#stack`:** SkillCategory (`name` y `description`) y sus Skill (`name` e `icon`); cada skill enlaza a `/stack/[slug]`. La `description` de la skill se ve en su página.
6. **`#contacto`:** `email` y `socialLinks`.
7. **`#traza`:** se conserva (diferenciador técnico; no viene del esquema).

## Reglas de presentación
- **`Skill.icon`** (texto ≤ 150): si es una URL `https://res.cloudinary.com/...` se muestra como imagen de 20 px con `alt=""` (decorativa, porque el nombre va al lado). Si es otro texto corto (≤ 4 caracteres, p. ej. un emoji), se muestra como glifo. Cualquier otro valor se ignora.
- **Fechas:** solo años en listas; en la ficha de proyecto, "mes año" (`Intl.DateTimeFormat('es-PE')`).
- **Repositorios:** etiqueta según `type`: `BACKEND` → "Backend", `FRONTEND` → "Frontend", `OTHER` → "Código".
- **Imágenes:** siempre `next/image` con `width`/`height` reales del registro (sin CLS) y `alt` del registro.
- **Vacíos:** un campo opcional vacío no deja etiquetas ni separadores huérfanos.
- **Campos internos:** no se muestran nunca. Son `id`, FKs, `publicId`, `photoPublicId`, `format`, `createdAt`, `isActive`, `isPublished`, `status` y `displayOrder`. Los cuatro últimos filtran u ordenan. `updatedAt` alimenta `lastModified` del sitemap.

## Datos para probar
| Modo | Para qué | Cómo |
|---|---|---|
| **Fixture completa** | Cobertura: rellena **todos** los campos, incluidos portada, galería, repos, iconos, credenciales y destacados. Usa un nombre ficticio de 4 palabras. | `pnpm seed:fixture` (solo contra una base local; aborta si `DATABASE_URL` no es localhost) |
| **Datos reales del dueño** | Realismo: textos y longitudes reales del CV | `.harness/seed-cv.ts` (ignorado por git; nunca entra al repo) |
| **DEMO** | Desarrollo rápido sin base | `PORTFOLIO_DEMO=1` |

Una funcionalidad pública solo pasa (`passes: true`) cuando la verifican la fixture completa (aserciones de contenido en `scripts/ui-plans/coverage.json`) y los datos reales (revisión visual).
