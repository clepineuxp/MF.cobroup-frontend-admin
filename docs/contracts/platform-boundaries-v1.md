# Contratos preliminares v1

| Área | Servicio | Propietario lógico |
|---|---|---|
| Configuración, rutas, asignaciones, plantillas, medios, etiquetas, aprobaciones | `MS.Cobroup.BackendAdmin` | Backend admin |
| Clientes, préstamos, cuotas, pagos y evidencias | Consulta versionada a operativo | Backend operativo |
| Mapas, mora y recaudo | Consulta/proyección coherente | Backend operativo |

Claims mínimos futuros: `sub`, `tenant_id`, `ADMIN` y expiración. Errores: código estable, mensaje seguro y `traceId`. Ninguna vista administrativa escribirá directamente recursos propiedad del servicio operativo.

Fase 3 consume configuración en `/api/v1/organization-settings`, rutas en `/api/v1/routes` y usuarios asignables en `/api/v1/users/assignable`; nunca envía el tenant como dato de negocio.
