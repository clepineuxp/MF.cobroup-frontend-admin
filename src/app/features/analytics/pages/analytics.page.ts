import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouteSelectorComponent } from '../../../shared/ui/route-selector/route-selector.component';
import { CollectionRoute } from '../../routes/data/route.models';
import { RouteSelectionService } from '../../routes/data/route-selection.service';
import { RoutesService } from '../../routes/data/routes.service';
import { PortfolioOverview } from '../data/analytics.models';
import { AnalyticsService } from '../data/analytics.service';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DecimalPipe, RouteSelectorComponent],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.scss',
})
export class AnalyticsPage implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly routesService = inject(RoutesService);
  private readonly routeSelection = inject(RouteSelectionService);

  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly overview = signal<PortfolioOverview | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filterForm = new FormGroup({
    routeId: new FormControl<string>(this.routeSelection.selectedRouteId(), { nonNullable: true }),
    date: new FormControl<string>(new Date().toISOString().substring(0, 10), { nonNullable: true }),
  });

  async ngOnInit(): Promise<void> {
    await this.loadRoutes();
    await this.loadAnalytics();
  }

  async loadRoutes(): Promise<void> {
    try {
      const list = await this.routesService.list();
      this.routes.set(list);
      const validRoute = this.routeSelection.ensureValidRoute(list);
      this.filterForm.controls.routeId.setValue(validRoute);
    } catch {
      // Continue even if routes list fails
    }
  }

  onRouteChange(routeId: string): void {
    this.filterForm.controls.routeId.setValue(routeId);
    this.routeSelection.setSelectedRoute(routeId);
    void this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    const routeId = this.filterForm.controls.routeId.value;
    this.routeSelection.setSelectedRoute(routeId);
    const date = this.filterForm.controls.date.value;

    try {
      this.loading.set(true);
      this.error.set('');
      const data = await this.analyticsService.getOverview(routeId || undefined, date);
      this.overview.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al cargar los datos de analítica.');
    } finally {
      this.loading.set(false);
    }
  }

  getRouteName(routeId: string): string {
    const r = this.routes().find((item) => item.id === routeId);
    return r ? r.name : routeId.substring(0, 8);
  }

  getParBadgeClass(rate: number): string {
    if (rate <= 5) return 'badge-low';
    if (rate <= 15) return 'badge-mid';
    return 'badge-high';
  }
}
