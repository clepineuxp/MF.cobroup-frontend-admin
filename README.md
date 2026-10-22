# MF.cobroup-frontend-admin

PWA administrativa de COBROUP. El acceso usa usuario y contraseña contra la autoridad JWT de BackendAdmin, abre la última organización utilizada y permite cambiar entre membresías activas. Fase 4 incorpora consulta global de clientes, detalle, traslado de ruta y cambio de estado mediante el backend operativo; aprobaciones financieras y reportes pertenecen a fases posteriores.

## Requisitos

- Node.js 22.15.1 LTS (`.nvmrc`)
- npm 11.6.2
- Angular 21.2.25 / CLI 21.2.27

```powershell
npm ci
npm start
npm test -- --watch=false
npm run build
```

`npm start` escucha en todas las interfaces mediante `0.0.0.0:5300`. El build de producción habilita el service worker. En desarrollo, `proxy.conf.json` dirige `/identity` a la autoridad JWT por HTTPS. En despliegue, el gateway debe conservar esa ruta bajo el mismo origen. El access token vive exclusivamente en memoria y nunca se guarda en `localStorage`, `sessionStorage`, IndexedDB, URL o logs. El refresh token solo existe en una cookie `HttpOnly`, `Secure` y `SameSite`, inaccesible para JavaScript; las solicitudes que usan la cookie incorporan protección CSRF.

La pantalla `/configuracion` mantiene zona horaria, moneda y cupos generales. `/rutas` consume listado, alta y actualización, permite heredar/sobrescribir cupos y desactivar o reasignar rutas. Las llamadas reutilizan el access token en memoria y hacen un único refresh ante `401` antes de devolver el error. Cambiar de organización revoca la familia anterior y obtiene tokens del tenant seleccionado.

El contrato normativo está en [`DECISION_AUTENTICACION_JWT.md`](../cobroup.md/DECISION_AUTENTICACION_JWT.md). La implementación actual está pendiente de conformidad y nueva auditoría.
