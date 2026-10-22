import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MapPoint, MapViewComponent } from '../../../shared/ui/map-view/map-view.component';
import { CollectionRoute } from '../../routes/data/route.models';
import { RoutesService } from '../../routes/data/routes.service';
import { AdminMapLocation, MapSupervisionService } from '../data/map-supervision.service';

@Component({
  selector: 'app-map-supervision-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapViewComponent, CurrencyPipe],
  templateUrl: './map-supervision.page.html',
  styleUrl: './map-supervision.page.scss',
})
export class MapSupervisionPage implements OnInit {
  private readonly mapService = inject(MapSupervisionService);
  private readonly routesService = inject(RoutesService);

  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly rawLocations = signal<readonly AdminMapLocation[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly selectedPoint = signal<MapPoint | null>(null);
  readonly statusFilter = signal<'ALL' | 'OVERDUE' | 'DUE' | 'COLLECTED'>('ALL');

  readonly filterForm = new FormGroup({
    routeId: new FormControl<string>('', { nonNullable: true }),
    date: new FormControl<string>(new Date().toISOString().substring(0, 10), { nonNullable: true }),
  });

  readonly mapPoints = computed<MapPoint[]>(() => {
    const list = this.rawLocations();
    const filter = this.statusFilter();

    return list
      .filter((loc) => {
        if (filter === 'OVERDUE') return loc.status === 'Overdue';
        if (filter === 'DUE') return loc.status === 'DueToday';
        if (filter === 'COLLECTED') return loc.status === 'Collected';
        return true;
      })
      .map((loc) => ({
        customerId: loc.customerId,
        customerName: loc.customerName,
        businessOrWorkName: loc.businessOrWorkName,
        address: loc.address,
        latitude: loc.latitude,
        longitude: loc.longitude,
        status: loc.status,
        markerColor: loc.markerColor,
        dueTodayAmount: loc.dueTodayAmount,
        overdueAmount: loc.overdueAmount,
        loanBalance: loc.loanBalance,
      }));
  });

  readonly moraCount = computed(() => this.rawLocations().filter((l) => l.status === 'Overdue').length);
  readonly dueCount = computed(() => this.rawLocations().filter((l) => l.status === 'DueToday').length);
  readonly collectedCount = computed(() => this.rawLocations().filter((l) => l.status === 'Collected').length);

  async ngOnInit(): Promise<void> {
    await this.loadRoutes();
    await this.loadMapLocations();
  }

  async loadRoutes(): Promise<void> {
    try {
      const list = await this.routesService.list();
      this.routes.set(list);
    } catch {
      // Non-blocking
    }
  }

  async loadMapLocations(): Promise<void> {
    const routeId = this.filterForm.controls.routeId.value;
    const date = this.filterForm.controls.date.value;

    try {
      this.loading.set(true);
      this.error.set('');
      const data = await this.mapService.getRouteLocations(routeId || undefined, date);
      this.rawLocations.set(data);
      this.selectedPoint.set(null);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al consultar las ubicaciones de supervisión.');
    } finally {
      this.loading.set(false);
    }
  }

  onPointSelected(point: MapPoint): void {
    this.selectedPoint.set(point);
  }

  setFilter(filter: 'ALL' | 'OVERDUE' | 'DUE' | 'COLLECTED'): void {
    this.statusFilter.set(filter);
  }
}
