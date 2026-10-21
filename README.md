# MF.cobroup-frontend-admin

PWA administrativa de COBROUP. El acceso usa usuario y contraseña, abre la última organización utilizada y permite cambiar entre membresías activas. Conserva Authorization Code + PKCE, refresh rotatorio en memoria y logout con revocación. No simula configuración, aprobaciones ni reportes.

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
