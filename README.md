# MF.cobroup-frontend-admin

PWA administrativa de COBROUP por organización. Fase 2 incorpora ingreso por organización y usuario, Authorization Code + PKCE, callback, refresh rotatorio en memoria y logout con revocación. No simula configuración, aprobaciones ni reportes.

## Requisitos

- Node.js 22.15.1 LTS (`.nvmrc`)
- npm 11.6.2
- Angular 21.2.25 / CLI 21.2.27

```powershell
npm ci
npx ng serve --host=127.0.0.1 --port=4201
npm test -- --watch=false
npm run build
```

El build de producción habilita el service worker. En desarrollo, `proxy.conf.json` dirige `/identity` a la autoridad HTTPS. En despliegue, el gateway debe conservar esa ruta bajo el mismo origen. Los tokens no se guardan en `localStorage` ni `sessionStorage`; solo el estado y verifier PKCE de un uso sobreviven la redirección.
