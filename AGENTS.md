# AGENTS — MF.cobroup-frontend-admin

## Identidad y restricciones

- Producto: COBROUP; rol: frontend administrativo por organización.
- Maestro: `../cobroup.md/COBROUP.md` 1.0.2.
- Estándar: `../cobroup.md/FRAMEWORK_DESARROLLO_FRONTEND.md` 1.0.
- Rama activa: `feature/fase-3-configuracion-rutas`.
- Sin push, merge, tag ni PR sin autorización.

## Estado actual

- Fase: 3; resultado: EN PROGRESO.
- Angular 21.2.25 LTS, CLI/build 21.2.27, TypeScript 5.9.3, RxJS 7.8.2.
- Node 22.15.1 LTS; npm 11.6.2.
- PWA: activada; tema: light/dark implementado.
- Auditoría independiente: no realizada.

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
