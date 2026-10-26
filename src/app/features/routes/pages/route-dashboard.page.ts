import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RouteBalance, RouteFinancialEntry } from '../../route-finances/data/route-finance.models';
import { RouteFinancesService } from '../../route-finances/data/route-finances.service';
import { CollectionRoute } from '../data/route.models';
import { RoutesService } from '../data/routes.service';

@Component({
  selector: 'app-route-dashboard-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './route-dashboard.page.html',
  styleUrl: './route-dashboard.page.scss',
})
export class RouteDashboardPage {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly routesService = inject(RoutesService);
  private readonly finances = inject(RouteFinancesService);
  readonly routeId = this.activatedRoute.snapshot.paramMap.get('routeId') ?? '';
  readonly route = signal<CollectionRoute | null>(null);
  readonly balance = signal<RouteBalance | null>(null);
  readonly entries = signal<readonly RouteFinancialEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() { void this.load(); }

  private async load(): Promise<void> {
    try {
      const routes = await this.routesService.list();
      const route = routes.find(item => item.id === this.routeId);
      if (!route) throw new Error('La ruta solicitada no existe en esta organización.');
      this.route.set(route);
      const [balance, entries] = await Promise.all([
        this.finances.getBalance(this.routeId), this.finances.listEntries(this.routeId, 'all')
      ]);
      this.balance.set(balance); this.entries.set(entries.slice(0, 8));
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'No fue posible cargar el dashboard de ruta.'); }
    finally { this.loading.set(false); }
  }
}
