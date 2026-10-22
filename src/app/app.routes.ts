import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin-overview/pages/admin-overview.page').then((module) => module.AdminOverviewPage),
    title: 'Administración | COBROUP',
  },
  {
    path: 'rutas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/routes/pages/routes.page').then((module) => module.RoutesPage),
    title: 'Rutas | COBROUP Administración',
  },
  {
    path: 'plantillas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/loan-templates/pages/loan-templates.page').then((module) => module.LoanTemplatesPage),
    title: 'Plantillas | COBROUP Administración',
  },
  {
    path: 'excepciones',
    canActivate: [authGuard],
    loadComponent: () => import('./features/loan-exceptions/pages/loan-exceptions.page').then((module) => module.LoanExceptionsPage),
    title: 'Excepciones | COBROUP Administración',
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadComponent: () => import('./features/organization-settings/pages/organization-settings.page').then((module) => module.OrganizationSettingsPage),
    title: 'Configuración | COBROUP Administración',
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/customers/pages/customers.page').then((module) => module.CustomersPage),
    title: 'Clientes | COBROUP Administración',
  },
  { path: 'login', loadComponent: () => import('./features/auth/pages/login.page').then((module) => module.LoginPage), title: 'Acceso administrativo | COBROUP' },
  { path: 'auth/callback', loadComponent: () => import('./features/auth/pages/auth-callback.page').then((module) => module.AuthCallbackPage), title: 'Validando acceso | COBROUP' },
  { path: '**', redirectTo: '' },
];
