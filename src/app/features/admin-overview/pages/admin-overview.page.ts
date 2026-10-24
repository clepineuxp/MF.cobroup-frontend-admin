import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({ selector: 'app-admin-overview-page', imports: [RouterLink], templateUrl: './admin-overview.page.html', styleUrl: './admin-overview.page.scss' })
export class AdminOverviewPage {
  readonly context = inject(AuthService).context;
  readonly modules = [
    { path: '/usuarios', icon: '👥', title: 'Tu equipo', description: 'Administra supervisores y colaboradores.' },
    { path: '/rutas', icon: '🛣️', title: 'Rutas de cobro', description: 'Organiza recorridos y asignaciones.' },
    { path: '/clientes', icon: '◎', title: 'Clientes', description: 'Consulta y administra tu cartera de clientes.' },
    { path: '/prestamos', icon: '💰', title: 'Préstamos', description: 'Revisa créditos, saldos y cronogramas.' },
    { path: '/mapa', icon: '🗺️', title: 'Mapa de operación', description: 'Explora la ubicación y estado de tus clientes.' },
    { path: '/analitica', icon: '↗', title: 'Analítica', description: 'Consulta los resultados de tu organización.' }
  ];
}
