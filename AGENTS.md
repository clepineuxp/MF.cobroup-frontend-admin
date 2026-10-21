# AGENTS — MF.cobroup-frontend-admin

## Identidad y restricciones

- Producto: COBROUP; rol: frontend administrativo por organización.
- Maestro: `../cobroup.md/COBROUP.md` 1.0.7.
- Estándar: `../cobroup.md/FRAMEWORK_DESARROLLO_FRONTEND.md` 1.0.
- Rama activa: `feature/fase-4-clientes`.
- Sin push, merge, tag ni PR sin autorización.

## Estado actual

- Fase: 4; resultado: COMPLETADA.
- Angular 21.2.25 LTS, CLI/build 21.2.27, TypeScript 5.9.3, RxJS 7.8.2.
- Node 22.15.1 LTS; npm 11.6.2.
- PWA: activada; tema: light/dark implementado.
- Auditoría independiente: no realizada.
- Línea base: 9 fases totales; 4 completas y 5 pendientes. Informe: `../cobroup.md/informe/avance.md`.
- Corte actual: consulta, detalle, traslado y estado de clientes mediante fachada administrativa; build productivo y 10/10 pruebas.

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
