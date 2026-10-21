# MF.cobroup-frontend-admin

PWA administrativa de COBROUP por organización. Fase 1 ofrece shell, ruta base, temas y contratos técnicos; no simula configuración, aprobaciones ni reportes.

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

El build de producción habilita el service worker. La API administrativa se configurará detrás de `/api/admin/v1`.
