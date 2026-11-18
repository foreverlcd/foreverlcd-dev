# Deuda técnica

| Fecha | Área | Deuda | Impacto | Plan |
|---|---|---|---|---|
| 2026-11-18 | web | `src/components/site/` (Etapa 3.1) ya no se usa | Código muerto | Borrar al integrar la nueva dirección |
| 2026-11-18 | web | `src/components/runtime/` pertenece a la dirección rechazada | Se reemplazará | Conservar traza, modo lectura y bus; rehacer escena y estilos |
| 2026-11-18 | infra | Next 16.4.3 con aviso de vulnerabilidad | Seguridad | Actualizar en rama propia con autorización |
| 2026-11-18 | calidad | No hay tests unitarios (sin runner) | Regresiones en actions/validación | Proponer Vitest para `src/server/**` |
| 2026-11-18 | harness | `ui-shots` usa SwiftShader (CPU): fps irreales (15–25 fps en escritorio) | Pedido del dueño: pruebas futuras con GPU | `ui-shots.mjs` con modo `GPU=1` (Chromium con ANGLE/Vulkan o con interfaz sobre la GPU real) y SwiftShader solo como respaldo en CI |
