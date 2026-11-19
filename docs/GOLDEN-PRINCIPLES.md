# Principios de oro

Reglas concretas. Cada una nace de un error real o de una restricción del proyecto. Si se puede verificar con código, vive también en `scripts/check-boundaries.mjs`, en `scripts/check-budgets.mjs` o en un test.

1. **El contenido es HTML del servidor.** WebGL y Anime.js mejoran la página; nunca son la única forma de leer algo. Sin JavaScript, todo el texto está ahí.
2. **Nada público se renderiza por visita.** Páginas públicas con `revalidate`; mutaciones con `revalidatePath`. (R5)
3. **Autoriza dentro de cada Server Action** con `requireAdmin()`; el layout y el proxy son solo una primera barrera. (R6)
4. **Valida en el borde con zod** y devuelve errores por campo en español con el `ActionState` común.
5. **Prisma solo en el servidor**, detrás del DAL o de una action; los componentes cliente nunca importan `@/server/**`. (R1, R2, R3)
6. **Three.js fuera del bundle inicial:** solo en `scene/**` y cargado con `import()`. (R4 + presupuesto)
7. **Toda escena libera lo que crea:** geometrías, materiales, render targets, listeners, observers, animaciones de Anime.js y el renderer.
8. **Movimiento con consentimiento:** `prefers-reduced-motion` y modo lectura desactivan animación continua; nada parpadea más de 3 veces por segundo.
9. **No inventes contenido personal.** Solo datos de la base o DEMO marcado (`PORTFOLIO_DEMO=1`, nunca en producción).
10. **Sin `setState` síncrono en efectos** (lint `react-hooks/set-state-in-effect`): usa `useSyncExternalStore`, estado derivado o atributos del DOM vía ref.
11. **Nada de diálogos nativos** (`alert/confirm`): bloquean a los agentes de navegador y a la usuaria. (R7)
12. **Next 16 primero en la guía local** (`node_modules/next/dist/docs/`), luego el código. `proxy.ts`, no `middleware.ts`.
13. **El aviso de seguridad de Next interrumpe `next dev/build` una vez**: reintenta el comando; no ejecutes `next upgrade` sin autorización.
14. **Verifica lo visual en un navegador** (`scripts/ui-shots.mjs`), no solo con tipos y lint. Un cambio visual sin captura revisada no está terminado.
