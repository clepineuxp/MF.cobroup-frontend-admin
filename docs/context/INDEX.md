# Contexto — MF.cobroup-frontend-admin

Aplicación administrativa Angular/PWA por tenant. Consume el backend admin y futuras consultas operativas versionadas. El servidor conserva la autoridad.

- `/usuarios`: listado del equipo y creación de supervisores y colaboradores (`Collector`) del tenant activo. Alta de organización/dueño privada por script del backend admin; [contrato](../../../MS.Cobroup.BackendAdmin/docs/contracts/organization-provisioning-users-v1.md).

- Fase 3: shell responsive, configuración organizacional y gestión tenant-safe de rutas/asignaciones/cupos sobre contratos reales. La identidad JWT está reabierta para revalidación.
- Rol administrativo: `ADMIN`; supervisores y cobradores no reciben autoridad administrativa.
- Offline: solo shell estático, sin respuestas autenticadas ni escrituras.
- Contratos: [fronteras v1](../contracts/platform-boundaries-v1.md).
- Decisiones: [fundación](../decisions/0001-phase-1-foundation.md) y [sesión JWT](../decisions/0002-jwt-session.md).
- Roadmap: [propuesta](../roadmap/phase-proposal.md).

## Registro de intervenciones

- 2026-10-23: corregido el comando de pruebas de GitHub Actions para usar Vitest/jsdom sin `--browsers=ChromeHeadless`; 39/39 pruebas aprobadas mediante el CLI local. Detalle y limitaciones en `AGENTS.md`.

## Plantillas por rangos y cobro mensual — 2026-10-23

Decisión vigente: [rangos, rutas y mensual](../../../cobroup.md/DECISION_PLANTILLAS_RANGOS_RUTAS.md). Monto/porcentaje mínimo y máximo inclusivos; plantillas publicadas asignadas explícitamente a la ruta del cliente, con validación del servidor. Mensual conserva el día de inicio por meses calendario. Migración administrativa preparada y pendiente de aplicación; no modifica condiciones de préstamos existentes.
