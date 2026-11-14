import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../../shared/ui/app-icon/app-icon.component';
import { RouteSelectorComponent } from '../../../shared/ui/route-selector/route-selector.component';
import { CollectionRoute } from '../../routes/data/route.models';
import { RouteSelectionService } from '../../routes/data/route-selection.service';
import { RoutesService } from '../../routes/data/routes.service';
import { CustomerDetails, CustomerStatus, CustomerSummary, CustomerWriteRequest } from '../data/customer.models';
import { CustomersService } from '../data/customers.service';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [FormsModule, AppIconComponent, RouteSelectorComponent],
  templateUrl: './customers.page.html',
  styleUrl: './customers.page.scss',
})
export class CustomersPage {
  private readonly customersService = inject(CustomersService);
  private readonly routesService = inject(RoutesService);
  private readonly routeSelection = inject(RouteSelectionService);

  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly customers = signal<readonly CustomerSummary[]>([]);
  readonly selected = signal<CustomerDetails | null>(null);

  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly totalCount = signal(0);

  private readonly PAGE_SIZE = 12;
  private currentPage = 1;

  filterRouteId = this.routeSelection.selectedRouteId();
  searchTerm = '';
  editRouteId = '';
  editIdentification = '';
  editStatus: CustomerStatus = 'Active';

  readonly visibleCustomers = computed(() => {
    return this.customers();
  });

  readonly hasMoreCards = computed(() => {
    return this.customers().length < this.totalCount();
  });

  readonly remainingCount = computed(() => {
    return Math.max(0, this.totalCount() - this.customers().length);
  });

  constructor() {
    void this.initialize();
  }

  async search(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.currentPage = 1;

    try {
      const page = await this.customersService.search(this.filterRouteId, this.searchTerm, 1, this.PAGE_SIZE);
      this.customers.set(page.items);
      this.totalCount.set(page.totalCount);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible consultar los clientes.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (this.loadingMore() || !this.hasMoreCards()) return;

    this.loadingMore.set(true);
    try {
      const nextPage = this.currentPage + 1;
      const page = await this.customersService.search(this.filterRouteId, this.searchTerm, nextPage, this.PAGE_SIZE);
      this.currentPage = nextPage;
      this.customers.update((items) => [...items, ...page.items]);
      this.totalCount.set(page.totalCount);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible cargar más clientes.');
    } finally {
      this.loadingMore.set(false);
    }
  }

  async inspect(customerId: string): Promise<void> {
    this.error.set('');
    this.success.set('');
    try {
      const customer = await this.customersService.get(customerId);
      this.selected.set(customer);
      this.editRouteId = customer.routeId;
      this.editIdentification = customer.identification;
      this.editStatus = customer.status;
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible consultar el cliente.');
    }
  }

  close(): void {
    this.selected.set(null);
  }

  async saveAssignment(): Promise<void> {
    const customer = this.selected();
    if (!customer || !this.editRouteId || this.saving()) return;

    const identification = this.editIdentification.trim();
    if (!identification || identification.length > 64 || (identification === '0' && customer.identification !== '0')) {
      this.error.set('Ingresa una identificación válida. El valor 0 solo se conserva en clientes antiguos.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const request: CustomerWriteRequest = {
      identification,
      routeId: this.editRouteId,
      firstNames: customer.firstNames,
      lastNames: customer.lastNames,
      businessOrWorkName: customer.businessOrWorkName,
      observations: customer.observations,
      status: this.editStatus,
      phones: customer.phones,
      locations: customer.locations,
    };

    try {
      const updated = await this.customersService.update(customer.id, request);
      this.selected.set(updated);
      this.success.set('Asignación y estado del cliente actualizados exitosamente.');
      await this.search();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible actualizar el cliente.');
    } finally {
      this.saving.set(false);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    void this.search();
  }

  resetFilters(): void {
    this.filterRouteId = '';
    this.routeSelection.clear();
    this.searchTerm = '';
    void this.search();
  }

  onFilterChange(routeId?: string): void {
    if (routeId !== undefined) {
      this.filterRouteId = routeId;
    }
    this.routeSelection.setSelectedRoute(this.filterRouteId);
    void this.search();
  }

  routeName(routeId: string): string {
    return this.routes().find((route) => route.id === routeId)?.name ?? 'Ruta no disponible';
  }

  private async initialize(): Promise<void> {
    try {
      const activeRoutes = (await this.routesService.list()).filter((route) => route.status === 'Active');
      this.routes.set(activeRoutes);
      this.filterRouteId = this.routeSelection.ensureValidRoute(activeRoutes);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible consultar las rutas.');
    }
    await this.search();
  }
}
