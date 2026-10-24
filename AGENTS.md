# AGENTS — MF.cobroup-frontend-admin

## Identidad y restricciones

- Producto: COBROUP; rol: frontend administrativo por organización.
- Maestro: `../cobroup.md/COBROUP.md` 1.11.0 y `../cobroup.md/DECISION_AUTENTICACION_JWT.md`.
- Estándar: `../cobroup.md/FRAMEWORK_DESARROLLO_FRONTEND.md` 1.0.
- Rama activa: `feature/organizaciones-usuarios`, creada desde `origin/dev` por instrucción del usuario.
- Sin push, merge, tag ni PR sin autorización.

## Estado actual

- Fase: identidad reabierta; resultado: JWT_PENDIENTE_DE_ADECUACION_Y_AUDITORIA.
- Angular 21.2.25 LTS, CLI/build 21.2.27, TypeScript 5.9.3, RxJS 7.8.2.
- Node 22.15.1 LTS; npm 11.6.2.
- PWA: activada; tema: light/dark implementado; servicios PWA en core/pwa.
- Auditoría independiente: realizada el 2026-10-22; resultado técnico NO APROBADO.
- Línea base funcional versionada; integración JWT aún sin commit y sin aceptación auditora. Informe de avance: `../cobroup.md/informe/avance.md` 2.1.0; adenda: `../cobroup.md/informe/linea-base-auditoria-jwt-2026-10-22.html`.
- Corte actual: existen cambios de autenticación y layout sin commit; la suite actual presenta una prueba fallida y no cumple el gate de cierre.

## Decisión vigente de autenticación

- Se usan exclusivamente access y refresh JWT según `../cobroup.md/DECISION_AUTENTICACION_JWT.md`.
- El access JWT se conserva solo en memoria; jamás en `localStorage`, `sessionStorage`, IndexedDB, URL o logs.
- El refresh JWT se recibe exclusivamente como cookie HttpOnly/Secure/SameSite y nunca es accesible desde JavaScript.
- Login, refresh, logout y cambio de organización usan los endpoints `/api/v1/auth/*`; refresh/logout/cambio llevan protección CSRF cuando dependen de cookie.
- El cambio de organización invalida la familia anterior antes de aceptar la sesión nueva.
- Las referencias de identidad anteriores dentro del historial append-only están supersedidas y no son criterio vigente.

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

### 2026-10-21 — Cierre versionado de fase 7 en Git

- Prompt: correcto, hacer commits de fase 7 e iniciar fase 8.
- Resultado: fase 7 validada; commit autorizado: SÍ, commit local `e80f442` (`feat(payment-methods): implement payment methods administration and status toggle`).
- Rama de trabajo creada y activa: `feature/fase-8-mapas-analitica`.
- Operaciones no autorizadas: push, merge, tag y PR.

### 2026-10-21 — Implementación de fase 8: mapas, georreferenciación y analítica

- Componente UI reutilizable:
  - `src/app/shared/ui/map-view/map-view.component.ts`, `.html`, `.scss`: componente standalone con visualización cartográfica OpenStreetMap, marcadores semánticos y popups con información de cuota y mora.
- Modelos y servicios:
  - `analytics.models.ts`: contratos tipados `AgingBucket`, `RoutePerformanceItem`, `PortfolioOverview`.
  - `analytics.service.ts`: integración de `getOverview`, `getRoutesPerformance`, `getAging` consumiendo `/identity/api/v1/analytics`.
  - `map-supervision.service.ts`: integración de `getRouteLocations` consumiendo `/identity/api/v1/map/route-locations`.
- Páginas y experiencia de usuario:
  - `/mapa` (`map-supervision.page.ts`): supervisión cartográfica multi-ruta con selector de ruta, selector de fecha, filtros dinámicos por estado (Todos, Mora, Vencen hoy, Cobrados), conteos reactivos y panel flotante de cliente.
  - `/analitica` (`analytics.page.ts`): panel ejecutivo con 6 KPI cards, tabla de Aging Report con distribución porcentual de cartera y barras gráficas de progreso, y ranking comparativo de rutas por riesgo PAR%.
  - Navegación: enlaces en la barra principal de `main-layout.component.html` y rutas en `app.routes.ts`.
- Estilos, temas y presupuestos:
  - SCSS desacoplado con tokens semánticos (`var(--color-...)`); presupuesto estricto de Angular (< 4.00 kB) cumplido con 0 advertencias.
- Validación de arquitectura: cumplimiento estricto de FRAMEWORK_DESARROLLO_FRONTEND 1.0 (feature-based, componentes comunes en `shared/ui`, servicios HTTP dedicados).
- Validación de suites:
  - 31/31 pruebas Vitest pasando en verde (incluyendo 4 pruebas para `AnalyticsService` y 3 pruebas para `MapSupervisionService`).
  - Build de producción generado con 0 advertencias y 0 errores (`ng build`).
- Git: rama `feature/fase-8-mapas-analitica`; push, merge, tag y PR no autorizados.

### 2026-10-21 — Cierre versionado de fase 8 en Git

- Prompt: correcto, hacer commits de fase 7 e iniciar fase 8 / proceder con la fase final.
- Resultado: fase 8 validada; commit autorizado: SÍ, commit local `db29c9a` (`feat(analytics): implement multi-route map supervision and portfolio analytics dashboard`).
- Rama de trabajo creada y activa: `feature/fase-9-endurecimiento-despliegue`.
- Operaciones no autorizadas: push, merge, tag y PR.

### 2026-10-21 — Implementación de fase 9: endurecimiento y despliegue K3s/Kubernetes

- Servicios PWA:
  - `PwaUpdateService` en `src/app/core/pwa/pwa-update.service.ts`: monitoreo de actualizaciones mediante Angular Service Worker (`SwUpdate.versionUpdates`), activación controlada con recarga segura.
  - `PwaInstallService` en `src/app/core/pwa/pwa-install.service.ts`: captura reactiva de `beforeinstallprompt`, señal `canInstall$` para botón de instalación en la UI y registro de instalación con `appinstalled`.
- Contenedorización Nginx y Docker:
  - `Dockerfile` multi-stage: compilación con Node 22-alpine -> servidor Nginx 1.27-alpine unprivileged en puerto 8080.
  - `nginx.conf`: compresión gzip, cabeceras de caché (1 año para assets estáticos con hash, `no-cache` para `index.html`), fallback SPA con `try_files` y health check en `/health`.
  - `.dockerignore` configurado.
- Orquestación K3s y CI/CD:
  - Manifiesto K3s `k8s/base/frontend-admin.yaml`: Deployment y ClusterIP Service en puerto 8080 con límites de recursos y health probe en `/health`.
  - Pipeline `.github/workflows/ci-cd.yml`: ejecución de pruebas Vitest (`npm test -- --watch=false`), build de producción (`npm run build`), build y push de imagen Docker a GHCR (`ghcr.io/clepineuxp/mf-cobroup-frontend-admin`), y despliegue automatizado por SSH a K3s para ambientes `cobroup-dev`, `cobroup-qa`, `cobroup-prod`.
- Pruebas automatizadas y build:
  - 31/31 pruebas Vitest pasando al 100%.
  - Compilación de producción (`ng build`) limpia con 0 advertencias de budget CSS.
- Git: rama `feature/fase-9-endurecimiento-despliegue`; push, merge, tag y PR no autorizados.

### 2026-10-22 — Rebaselining auditor de identidad JWT

- Prompt: formalizar en toda la planeación la decisión de usar exclusivamente JWT y retirar el mecanismo anterior, actuando solo como auditor.
- Decisión: access JWT exclusivamente en memoria; refresh JWT exclusivamente en cookie HttpOnly/Secure/SameSite con CSRF. La fase 2 queda reabierta.
- Documentación: maestro 1.7.0, decisión JWT, README, contexto, contrato, ADR JWT, roadmap, avance y adenda HTML alineados; el ADR anterior fue sustituido.
- Auditoría: el contrato queda aprobado; la implementación actual sigue NO APROBADA y debe eliminar tokens de Web Storage y superar login, refresh, logout, cambio de organización y recuperación ante `401`.
- Verificación: búsqueda transversal sin referencias normativas activas al mecanismo retirado; los informes y entradas históricas se conservaron como evidencia.
- Git: no se modificó código en esta actividad y no se creó commit, push, merge, tag ni PR.

### 2026-10-22 — Implementación de sesión en memoria, cookies seguras y remediación frontend admin (Bloque C)

- Erradicación de Web Storage para tokens: eliminadas todas las lecturas, escrituras y eliminaciones de `localStorage`, `sessionStorage` e IndexedDB de access y refresh tokens.
- Almacenamiento en memoria: el access token reside únicamente en variable privada en memoria (`AuthService.accessToken`).
- Sesión por cookies HttpOnly: peticiones de login, refresh, organizaciones y logout utilizan `credentials: 'include'` para gestionar la cookie segura `__Host-cobroup-refresh` emitida por el servidor.
- Guardia single-flight contra tormentas 401: implementado bloqueo concurrente con promesa compartida (`refreshPromise`) para evitar múltiples llamadas simultáneas de refresh.
- Resiliencia de logout: el cierre de sesión limpia el estado de memoria y redirige a `/login` en cláusula `finally`, garantizando la salida incluso ante fallas de red.
- Recuperación de sesión en recarga: `authGuard` asíncrono intenta restaurar la sesión mediante la cookie de refresh antes de redirigir a login.
- Shell y navegación: título `h1` visible en todo momento para accesibilidad y pruebas del shell; `<nav>` y selector de organización condicionados a `isAuthenticated()`.
- Retiro de legado: eliminada ruta `auth/callback` del router.
- Validación: 31/31 pruebas verdes en Vitest, compilación de producción `ng build` exitosa, 0 vulnerabilidades en `npm audit --omit=dev`.
- Git: cambios preservados en el working tree sin commit, push, merge, tag ni PR.

### 2026-10-23 — Corrección de inyección de contexto en authGuard

- Diagnóstico: en `auth.guard.ts`, `inject(Router)` se invocaba tras `await auth.refreshAccessToken()`, causando el fallo de inyección en Angular `NG0203` ante usuarios no autenticados y abortando la redirección a `/login`.
- Solución: inyección sincrónica de `Router` al inicio del guardia (`const router = inject(Router);`).
- Validación: suite `src/app/core/auth/auth.guard.spec.ts` agregada; 39/39 pruebas Vitest aprobadas (14/14 suites).
- Git: rama `feature/visuals-theme`; commit `543f2cc` (`fix(auth): fix injection context in authGuard and restore login redirection`).

### 2026-10-23 — Integración de Mapas Interactivos Leaflet y Pines con Foto/Avatar de Clientes

- Requerimiento: migración a motor cartográfico interactivo real con Leaflet / OpenStreetMap y soporte completo para imágenes de los clientes activos en pines del mapa y tarjeta de inspección de supervisión.
- Selección técnica: Leaflet (1.9.4) y `@types/leaflet` con teselas globales OpenStreetMap (100% open-source, sin cuotas ni API keys, gestos táctiles y zoom fluido).
- Implementación en `MF.cobroup-frontend-admin`:
  - `MapViewComponent` (`src/app/shared/ui/map-view/`): carga dinámica asíncrona (`await import('leaflet')`) en `ngAfterViewInit` para evitar errores `ReferenceError: window is not defined` durante pruebas unitarias (Vitest/jsdom) o SSR.
  - Pines circulares con foto (`avatarUrl`):
    - Pin circular con imagen del cliente y anillo perimetral con color semántico de estado (`Overdue` en rojo, `DueToday` en amarillo, `Collected` en verde).
    - Fallback de iniciales del nombre en caso de error o ausencia de foto.
    - Halo pulsante interactivo (`@keyframes haloPulse`) y elevación de z-index al seleccionar un punto.
  - Tarjeta de detalle de cliente (`map-supervision.page.html`): avatar circular con foto o iniciales e indicador de color del estado de cobranza.
  - Modelos: campo `avatarUrl?: string | null` en `AdminMapLocation` y mapeo en el selector reactivo `mapPoints`.
  - Configuración: `allowedCommonJsDependencies: ["leaflet"]` en `angular.json` y estilos de Leaflet en `src/styles.scss`.
- Validación y suites:
  - 39/39 pruebas Vitest pasando en verde (14/14 suites).
- Git: rama `feature/visuals-theme`; cambios preservados en el working tree sin commit, push, merge, tag ni PR.

### 2026-10-23 — Migración a capas ESRI World, sincronización con tema de página y alternador Satelital

- Diagnóstico de teselas:
  - Servidor estándar de OpenStreetMap (`tile.openstreetmap.org`) presentaba bloqueo TCP/timeout en redes locales (`151.101.1.91`).
  - Proveedores con marcas de agua o claves obligatorias (CARTO, Wikimedia) fueron descartados para preservar la limpieza de interfaz.
- Implementación de capas cartográficas de alto rendimiento ESRI ArcGIS (sin API key, sin marcas de agua, CORS `*` habilitado globalmente):
  - Modo Calles / Claro: `ArcGIS World_Street_Map`.
  - Modo Oscuro: `ArcGIS Canvas/World_Dark_Gray_Base` + `ArcGIS Canvas/World_Dark_Gray_Reference`.
  - Modo Satelital: `ArcGIS World_Imagery` de alta resolución satelital + overlay de red vial `ArcGIS Reference/World_Transportation`.
- Sincronización automática de tema y control flotante satelital:
  - Modo base del mapa reactivo al tema general de la aplicación (`ThemeService.theme()`): cambia automáticamente entre calles (claro) y lienzo oscuro (oscuro) al conmutar el tema de la aplicación.
  - Botón flotante del mapa (`btn-layer-mode`): conmuta exclusivamente entre el tema activo de la página (estándar claro/oscuro) y la vista Satelital (`isSatelliteMode`).
  - Al activar vista satelital, el botón resalta en estado activo (`.active`) y muestra icono de mapa (`🗺️`) para retornar al tema de la página; en vista estándar muestra el icono satelital (`🛰️`).
- Validación de suites:
  - 39/39 pruebas Vitest pasando al 100% (14/14 suites).
  - Presupuesto de estilos SCSS verificado (< 4.00 kB).
- Git: rama `feature/visuals-theme`; commit autorizado por usuario: SÍ, commit local `b222cbf` (`feat(map): integrate leaflet with customer avatars, esri layers and theme satellite toggle`); push, merge, tag y PR no autorizados.


### 2026-10-23 — Corrección del comando de pruebas en GitHub Actions

- Solicitud: corregir el fallo del frontend admin mostrado en el job Run Automated Tests.
- Causa: el workflow pasaba `--browsers=ChromeHeadless` al builder Vitest, activando pruebas en navegador sin un proveedor instalado.
- Cambio: `.github/workflows/docker-ghcr.yml` ejecuta `npm test -- --watch=false`, usando el entorno jsdom ya disponible.
- Validación: `node node_modules/@angular/cli/bin/ng.js test --watch=false` terminó con código 0; 39/39 pruebas y 14/14 suites aprobadas. Se invocó directamente el CLI porque npm no está disponible en el PATH de esta sesión; Node local v24.22.1, CI configurado con Node 22. `git diff --check` sin errores.
- Git: rama `feature/visuals-theme`; cambios locales sin commit, push, merge, tag ni PR. Ejecución remota pendiente de publicar el cambio.

### 2026-10-23 — Gestión del equipo de la organización

- Solicitud: crear supervisores y colaboradores desde la aplicación administrativa, con organizaciones/administrador dueño aprovisionados por script privado. Colaborador equivale a Collector por confirmación del usuario.
- Git: `feature/organizaciones-usuarios` creada desde origin/dev (914a227), según instrucción expresa. Sin cambios previos al iniciar este alcance. Commit autorizado: NO; sin push, merge, tag ni PR.
- Normativa: maestro COBROUP 1.11.0, framework frontend 1.0 y contrato JWT vigente; backend mantiene el framework C# 2.0 y arquitectura hexagonal.
- Cambios: feature users con servicio/modelos y pantalla lazy `/usuarios`, enlace de navegación, listado con rol/dueño/estado/teléfono/fecha, formulario Supervisor/Collector con contraseña inicial de 12–128 caracteres. Usa el tenant de sesión y header de consistencia para impedir alta en otro tenant si cambia la sesión durante el envío. Cancela consultas y limpia datos al cambiar de organización o destruir la vista; limpia contraseña tras enviar.
- Validación: 46/46 pruebas Vitest en 16 suites; build de producción correcto sin advertencias de presupuesto. Ejecutados mediante CLI local de Angular con Node v24.22.1, por ausencia de npm en PATH. Pruebas nuevas cubren creación, errores, validación, roles y cambio de tenant; no se ejecutó E2E por ingress ni verificación visual en navegador.
- Documentación: contexto enlaza el contrato de aprovisionamiento y usuarios del backend. Temas usan los tokens existentes; PWA y almacenamiento de tokens no cambiaron.
- Pendiente de publicación: migración y nueva API del backend antes de habilitar el flujo desplegado; no se desplegó ni se crearon cuentas reales. Auditoría independiente no realizada.

### 2026-10-23 — Autorización de commit de usuarios

- Solicitud expresa: aplicar migraciones y hacer commit del alcance de organizaciones/usuarios.
- BackendAdmin aplicó correctamente la migración de propiedad/contacto en la base de desarrollo `dev_cobroup_identity`; historial EF sin pendientes. No se desplegó la nueva UI ni se crearon cuentas reales.
- Se conservan como evidencia las 46 pruebas frontend y build correctos registrados en la implementación; no hubo cambios funcionales posteriores.
- Commit autorizado: SÍ, feature usuarios y documentación asociada. Sin autorización adicional de push, merge, tag ni PR.

### 2026-10-23 — Contraseñas sin requisitos de longitud ni complejidad

- Solicitud expresa: permitir contraseñas como `1` al crear usuarios.
- Cambio: contraseña obligatoria y sin recortar; eliminados mínimos, máximos y reglas de composición del alta administrativa, validación Core compartida y script privado del dueño. Hash existente conservado.
- Verificación: Core 66/66 y frontend administrativo 46/46, con casos de alta usando `1`; build productivo Angular correcto. No se probó contra servicios desplegados ni se crearon cuentas reales.
- Rama feature/organizaciones-usuarios; commit autorizado por el usuario; sin push ni despliegue.


### 2026-10-23 — Plantillas por rangos y rutas; cuotas mensuales

- Solicitud: explicar y modificar plantillas para monto/porcentaje mínimo y máximo, y listar las de la ruta al prestar. Ampliación: agregar cobros mensuales.
- Regla: rangos continuos inclusivos, asignación explícita a rutas del tenant y validación de alcance/versión en servidor. Mensual usa meses calendario anclados al día original y conserva el cargo total pactado.
- Datos: mínimo monetario y rutas versionados, migración aditiva AddLoanTemplateRangesAndRoutes y SQL idempotente preparado. Plantillas históricas sin asignación requieren edición; no se cambian préstamos existentes.
- Trabajo previo de aprovisionamiento conservado. Sin commit, push ni despliegue solicitados para esta intervención. Migración no aplicada ni pruebas sobre datos reales.
- Validación final: Core administrativo 69/69 y operativo 97/97; frontend administrativo 49/49 y operativo 53/53. Pruebas dirigidas de modelo EF 6/6 y directorio HTTP 4/4. EF sin cambios de modelo pendientes y SQL idempotente generado. No se ejecutó migración ni integración PostgreSQL desplegada.

### 2026-10-23 — Commits autorizados de plantillas, mensual y mapa

- Solicitud expresa: realizar los commits e incluir la actualización del mapa.
- Alcance: rangos de crédito, asignación a rutas, cuotas mensuales, migración y documentación; ambas interfaces incluyen la compatibilidad de importación de Leaflet del mapa.
- Validación registrada: 278 pruebas aprobadas y compilaciones correctas; sin nuevos cambios funcionales posteriores.
- Commit autorizado: SÍ. Sin push ni despliegue; migración administrativa pendiente de aplicación.
