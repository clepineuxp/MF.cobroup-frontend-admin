import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin-overview/pages/admin-overview.page').then((module) => module.AdminOverviewPage),
    title: 'Administración | COBROUP',
  },
  { path: 'login', loadComponent: () => import('./features/auth/pages/login.page').then((module) => module.LoginPage), title: 'Acceso administrativo | COBROUP' },
  { path: 'auth/callback', loadComponent: () => import('./features/auth/pages/auth-callback.page').then((module) => module.AuthCallbackPage), title: 'Validando acceso | COBROUP' },
  { path: '**', redirectTo: '' },
];
