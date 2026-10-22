# AGENTS — MF.cobroup-frontend-admin

## Identidad y restricciones

- Producto: COBROUP; rol: frontend administrativo por organización.
- Maestro: `../cobroup.md/COBROUP.md` 1.3.0.
- Estándar: `../cobroup.md/FRAMEWORK_DESARROLLO_FRONTEND.md` 1.0.
- Rama activa: `feature/fase-7-pagos-conciliacion`.
- Sin push, merge, tag ni PR sin autorización.

## Estado actual

- Fase: 7; resultado: COMPLETADA_FUNCIONALMENTE.
- Angular 21.2.25 LTS, CLI/build 21.2.27, TypeScript 5.9.3, RxJS 7.8.2.
- Node 22.15.1 LTS; npm 11.6.2.
- PWA: activada; tema: light/dark implementado.
- Auditoría independiente: no realizada.
- Línea base: 9 fases totales; 7 completas funcionalmente, 2 posteriores pendientes. Informe: `../cobroup.md/informe/avance.md`.
- Corte actual: catálogo y autorización de medios de pago (`/medios-pago`); creación, edición reactiva, ordenamiento y toggle de activación exclusivo para rol Admin (AC-13); build productivo limpio con 0 warnings y 0 errores; 24/24 pruebas Vitest pasando; budget SCSS < 4.00 kB.

## Historial cronológico (append-only)

### 2026-10-21 — Inicialización fase 1

- Prompt: crear PWA administrativa independiente sin módulos posteriores ficticios.
- Git: usuario autorizó `feature/fase-1-inicializacion`; commit autorizado: NO.
- Decisiones: PWA ahora; shell sin caché de negocio; API `/api/admin/v1`.
- Archivos: Angular base, layout, admin overview, core/auth/config, shared, themes, manifest, documentación y pruebas.
- Comandos: Angular CLI 21.2.27; instalación inicial con npm 10 falló por `edgesOut`; completada con npm 11.6.2; `ng add @angular/pwa@21.2.27` exitoso.
- Riesgos: `npm audit` reportó 4 vulnerabilidades altas solo en herramientas de desarrollo (`@angular/cli`/MCP SDK y `@angular/build`/Vite); `npm audit --omit=dev` reportó 0. No se aplicó `--force` por incompatibilidad. Iconos de plantilla pendientes de identidad COBROUP aprobada.
- Verificación final: `npm run build` exitoso (201.28 kB inicial; `ngsw.json` y manifest generados); `npm test -- --watch=false` 4/4; `ng serve` respondió HTTP 200 en `127.0.0.1:4201`; escaneo de residuos/secretos conocidos sin coincidencias.
- Próxima acción: cerrar fase 1; no implementar configuración/identidad sin aprobación.

### 2026-10-21 — Sincronización de nombres backend

- Prompt: alinear nombres locales y remotos de backend con GitHub.
- Cambio: contratos documentales actualizados a `MS.Cobroup.Backend` y `MS.Cobroup.BackendAdmin`.
- Rama: `feature/fase-1-inicializacion`; commit autorizado: NO; sin cambios funcionales.

### 2026-10-21 — Cierre versionado de fase 1

- Prompt: realizar commits de fase 1 y pasar a fase 2.
- Resultado: fase 1 validada; commit autorizado: SÍ, únicamente para el alcance acumulado de fase 1.
- Operaciones no autorizadas: push, merge, tag y PR.
- Siguiente rama prevista: `feature/fase-2-identidad-tenant`.

### 2026-10-21 — Acceso administrativo por organización, fase 2

- Implementación: formulario organización/usuario/contraseña; sesión antiforgery; OIDC Code + PKCE; callback; tokens solo en memoria; refresh y revocación; guard de ruta y proxy local `/identity`.
- Validación: build exitoso y pruebas 4/4.
- Integración: autoridad real inicializada con una organización y usuarios `Admin`, `Supervisor` y `Collector`; el flujo OIDC completo se validó por rol.
- Git: commit de cierre de fase 2 autorizado por el usuario; sin push, merge, tag ni PR.

### 2026-10-21 — Inicio de fase 3

- Rama creada para configuración y rutas.
- El backend administrativo inició el alta tenant-safe de rutas y asignaciones. La pantalla administrativa se implementará cuando el contrato de consulta y catálogo de usuarios asignables quede definido, evitando datos ficticios.
- Git: sin cambios funcionales de fase 3; push, merge, tag y PR no autorizados.

### 2026-10-21 — Puerto de desarrollo fase 3

- `ng serve` configurado por defecto en `0.0.0.0:5300`; origen local OIDC actualizado a `http://localhost:5300` en la autoridad central.
- Git: cambio sin commit; push, merge, tag y PR no autorizados.

### 2026-10-21 — Usuario global y cambio de organización

- Login reducido a usuario/contraseña; usa la última organización accedida. Si no existe membresía activa, muestra “Solicitar unirme a una organización” sin inventar todavía un flujo de aprobación.
- Selector de organización agregado al shell; al cambiar revoca el refresh token anterior y reinicia Authorization Code + PKCE para obtener claims del nuevo tenant.
- Validación: build exitoso y pruebas 4/4.
- Git: cambios sin commit; fase 3 funcional pausada; push, merge, tag y PR no autorizados.

### 2026-10-21 — Checkpoint y reanudación de fase 3

- Git: checkpoint previo confirmado en `6da67c0` (`feat: support organization session switching`); repositorio limpio tras el commit. Sin push, merge, tag ni PR.
- Interfaz: nueva navegación y pantalla `/rutas`; consulta rutas y usuarios asignables reales, crea rutas con supervisor y uno o más cobradores, y muestra estados vacío, carga, éxito y error.
- Autenticación API: `authorizedFetch` adjunta el bearer token en memoria y reintenta una vez después de rotar el refresh token ante `401`.
- Validación: build de producción exitoso; pruebas 4/4. La prueba del shell se actualizó con proveedor de router tras incorporar la navegación.
- Git: este nuevo corte de fase 3 queda sin commit; push, merge, tag y PR no autorizados.

### 2026-10-21 — Cierre funcional de fase 3

- `/configuracion`: zona horaria IANA, moneda ISO y cupos generales anulables, sin inventar valores para organizaciones existentes.
- `/rutas`: alta, listado, edición, activación/desactivación, reasignación, cupos heredados/sobrescritos y valores efectivos.
- Seguridad: contratos reales con bearer en memoria y un refresh ante `401`; tenant ausente de los comandos.
- Validación: build de producción exitoso; 8/8 pruebas de shell, tema, configuración y rutas.
- Git: cambios de fase 3 sin commit; push, merge, tag y PR no autorizados.

### 2026-10-21 — Cierre funcional de fase 4

- `/clientes`: listado, búsqueda, detalle, traslado de ruta y activación/desactivación mediante la fachada administrativa; teléfonos y ubicaciones se preservan en las actualizaciones.
- Seguridad: no envía tenant y depende del bearer vigente; las acciones administrativas se vuelven a validar en BackendAdmin y Backend operativo.
- Validación: build productivo exitoso y 10/10 pruebas.
- Git: commit de fase 4 autorizado; push, merge, tag y PR permanecen prohibidos.

### 2026-10-21 — Inicio de fase 5: administración de plantillas

- Rama: `feature/fase-5-plantillas-excepciones`; fase 4 ya comprometida al iniciar.
- Interfaz: nueva pantalla `/plantillas` para crear, editar, publicar, inactivar y consultar el historial de versiones con límites y porcentajes exactos.
- Seguridad: usa bearer en memoria; no transmite tenant y depende de la validación Admin del servidor.
- Validación: build productivo exitoso y 10/10 pruebas existentes.
- Pendiente de fase: bandeja de solicitudes excepcionales y decisión administrativa.
- Git: cambios de fase 5 sin commit; push, merge, tag y PR no autorizados.

### 2026-10-21 — Cierre funcional de fase 5: bandeja de excepciones de crédito

- Interfaz: nueva pantalla `/excepciones` con selector de filtros (Pendientes, Aprobadas, Rechazadas, Todas), visualización de términos solicitados (monto, plazo, porcentaje), justificación del solicitante y trazabilidad de decisión.
- Decisiones administrativas (AC-08): modal de aprobación y rechazo con notas de auditoría, retroalimentación inmediata de éxito/error y bloqueo de acciones concurrentes.
- Navegación: incorporada la ruta protegida `/excepciones` con título de página y enlace en la barra principal.
- Validación: build de producción con 0 errores y 0 warnings respetando presupuestos de estilo; 12/12 pruebas ejecutadas y aprobadas en Vitest.
- Git: commit de fase 5 autorizado por el usuario: `b6594be` (`feat(loan-exceptions): implement administrative exception management page and decision modal`); push, merge, tag y PR permanecen prohibidos.

### 2026-10-21 — Cierre funcional de fase 6: supervisión e inspección de préstamos

- Modelos y servicios:
  - `LoanDetails`, `LoanSearchItem`, `InstallmentItem`, `LoanSearchResponse` en `loan.models.ts`.
  - `LoansService`: métodos `search`, `get` y `listByCustomer` consumiendo `/api/v1/loans` en BackendAdmin.
- Experiencia de usuario y vistas:
  - Módulo `/prestamos`: listado de créditos multi-ruta con filtros dinámicos por ruta operativa y estado (`Active`, `PaidOff`, `Cancelled`).
  - Tarjetas de crédito con indicadores de principal, tasa de interés y saldo pendiente actual.
  - Modal de inspección de crédito: visualización de datos de originación (ruta, actor, fecha UTC) y tabla detallada de cronograma con cuotas, vencimientos, monto esperado, monto pagado y badges de estado.
  - Navegación: enlace en la barra principal de `main-layout.component.html` y ruta `/prestamos` en `app.routes.ts`.
- Rendimiento y estilos:
  - `loans.page.scss` optimizado a 3.7 kB, cumpliendo el presupuesto estricto de Angular (< 4.00 kB).
- Validación:
  - 18/18 pruebas Vitest pasando en verde (incluyendo pruebas unitarias para `LoansService` y `LoansPage`).
  - Build de producción generado con 0 advertencias y 0 errores (`ng build`).
- Git: commit local `b1f7f48` (`feat(loans): implement administrative loan supervision and schedule inspection`) en rama `feature/fase-6-prestamos-cronograma`; push, merge, tag y PR no autorizados.

### 2026-10-21 — Cierre funcional de fase 7: catálogo y autorización de medios de pago

- Modelos y servicios:
  - `PaymentMethodItem`, `CreatePaymentMethodRequest`, `UpdatePaymentMethodRequest` en `payment-method.models.ts`.
  - `PaymentMethodsService`: métodos `list`, `get`, `create`, `update` y `toggleStatus` consumiendo `/identity/api/v1/payment-methods`.
- Experiencia de usuario y vistas:
  - Nueva pantalla `/medios-pago`: listado tabular de medios de pago autorizados para el tenant, mostrando orden, nombre, badge de estado (Activo/Inactivo) y fecha de actualización.
  - Gestión y auditoría (AC-13): modal para crear y editar medios de pago con validación de nombre obligatorio y orden numérico; botón de activación/desactivación reactivo con actualización instantánea de estado.
  - Navegación: enlace `/medios-pago` en la barra superior de `main-layout.component.html` y ruta protegida en `app.routes.ts`.
- Rendimiento, temas y presupuestos:
  - Estilos refactorizados con estricto uso de tokens semánticos `var(--color-...)` de `src/app/themes/`, eliminando códigos hexadecimales arbitrarios.
  - `payment-methods.page.scss` optimizado a 2.6 kB, cumpliendo el presupuesto estricto de Angular (< 4.00 kB) con 0 advertencias.
- Validación de arquitectura: cumplimiento estricto de FRAMEWORK_DESARROLLO_FRONTEND 1.0 (feature-based, contratos tipados en data-access, componentes desacoplados de HTTP, tema claro inicial con Dark toggle funcional y PWA compatible).
- Validación de suites:
  - 24/24 pruebas Vitest pasando en verde (incluyendo `PaymentMethodsService` y `PaymentMethodsPage`).
  - Build de producción generado con 0 advertencias y 0 errores (`ng build`).
- Git: rama `feature/fase-7-pagos-conciliacion`; push, merge, tag y PR no autorizados.
