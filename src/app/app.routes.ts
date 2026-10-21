import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/admin-overview/pages/admin-overview.page').then((module) => module.AdminOverviewPage),
    title: 'Administración | COBROUP',
  },
  { path: '**', redirectTo: '' },
];
