# Contratos preliminares v1

| Área | Servicio | Propietario lógico |
|---|---|---|
| Configuración, rutas, asignaciones, plantillas, medios, etiquetas, aprobaciones | `MS.Cobroup.BackendAdmin` | Backend admin |
| Clientes, préstamos, cuotas, pagos y evidencias | Consulta versionada a operativo | Backend operativo |
| Mapas, mora y recaudo | Consulta/proyección coherente | Backend operativo |

El access token JWT aporta `typ=access`, `sub`, `organization_id`, `ADMIN` y vigencia; permanece solo en memoria. El refresh token es inaccesible a JavaScript y viaja únicamente en cookie segura. Errores: código estable, mensaje seguro y `traceId`, sin tokens. Ninguna vista administrativa escribe directamente recursos propiedad del servicio operativo. Ver `../../../cobroup.md/DECISION_AUTENTICACION_JWT.md`.

Fase 3 consume configuración en `/api/v1/organization-settings`, rutas en `/api/v1/routes` y usuarios asignables en `/api/v1/users/assignable`; nunca envía el tenant como dato de negocio.
