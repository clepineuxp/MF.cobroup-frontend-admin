# Contexto — MF.cobroup-frontend-admin

Aplicación administrativa Angular/PWA por tenant. Consume el backend admin y futuras consultas operativas versionadas. El servidor conserva la autoridad.

- Fase 3: shell responsive, configuración organizacional y gestión tenant-safe de rutas/asignaciones/cupos sobre contratos reales. La identidad JWT está reabierta para revalidación.
- Rol administrativo: `ADMIN`; supervisores y cobradores no reciben autoridad administrativa.
- Offline: solo shell estático, sin respuestas autenticadas ni escrituras.
- Contratos: [fronteras v1](../contracts/platform-boundaries-v1.md).
- Decisiones: [fundación](../decisions/0001-phase-1-foundation.md) y [sesión JWT](../decisions/0002-jwt-session.md).
- Roadmap: [propuesta](../roadmap/phase-proposal.md).
