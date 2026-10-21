# MF.cobroup-frontend-admin

PWA administrativa de COBROUP. El acceso usa usuario y contraseña, abre la última organización utilizada y permite cambiar entre membresías activas. Conserva Authorization Code + PKCE, refresh rotatorio en memoria y logout con revocación. Fase 4 incorpora consulta global de clientes, detalle, traslado de ruta y cambio de estado mediante el backend operativo; aprobaciones financieras y reportes pertenecen a fases posteriores.

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

`npm start` escucha en todas las interfaces mediante `0.0.0.0:5300`; el origen local para navegador y OIDC es `http://localhost:5300`. El build de producción habilita el service worker. En desarrollo, `proxy.conf.json` dirige `/identity` a la autoridad HTTPS. En despliegue, el gateway debe conservar esa ruta bajo el mismo origen. Los tokens no se guardan en `localStorage` ni `sessionStorage`; solo el estado y verifier PKCE de un uso sobreviven la redirección.

La pantalla `/configuracion` mantiene zona horaria, moneda y cupos generales. `/rutas` consume listado, alta y actualización, permite heredar/sobrescribir cupos y desactivar o reasignar rutas. Las llamadas reutilizan el access token en memoria y hacen un único refresh ante `401` antes de devolver el error.
