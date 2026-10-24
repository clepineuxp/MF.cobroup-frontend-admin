import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollectionRoute } from '../../routes/data/route.models';
import { RoutesService } from '../../routes/data/routes.service';
import { CustomerDetails, CustomerStatus, CustomerSummary, CustomerWriteRequest } from '../data/customer.models';
import { CustomersService } from '../data/customers.service';

@Component({ selector: 'app-customers-page', imports: [FormsModule], templateUrl: './customers.page.html', styleUrl: './customers.page.scss' })
export class CustomersPage {
  private readonly customersService = inject(CustomersService);
  private readonly routesService = inject(RoutesService);
  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly customers = signal<readonly CustomerSummary[]>([]);
  readonly selected = signal<CustomerDetails | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly totalCount = signal(0);
  filterRouteId = '';
  searchTerm = '';
  editRouteId = '';
  editIdentification = '';
  editStatus: CustomerStatus = 'Active';

  constructor() { void this.initialize(); }

  async search(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try { const page = await this.customersService.search(this.filterRouteId, this.searchTerm); this.customers.set(page.items); this.totalCount.set(page.totalCount); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'No fue posible consultar los clientes.'); }
    finally { this.loading.set(false); }
  }

  async inspect(customerId: string): Promise<void> {
    this.error.set(''); this.success.set('');
    try { const customer = await this.customersService.get(customerId); this.selected.set(customer); this.editRouteId = customer.routeId; this.editIdentification = customer.identification; this.editStatus = customer.status; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'No fue posible consultar el cliente.'); }
  }

  close(): void { this.selected.set(null); }

  async saveAssignment(): Promise<void> {
    const customer = this.selected();
    if (!customer || !this.editRouteId || this.saving()) return;
    const identification = this.editIdentification.trim();
    if (!identification || identification.length > 64 || (identification === '0' && customer.identification !== '0')) {
      this.error.set('Ingresa una identificación válida. El valor 0 solo se conserva en clientes antiguos.');
      return;
    }
    this.saving.set(true); this.error.set(''); this.success.set('');
    const request: CustomerWriteRequest = { identification, routeId: this.editRouteId, firstNames: customer.firstNames, lastNames: customer.lastNames,
      businessOrWorkName: customer.businessOrWorkName, observations: customer.observations, status: this.editStatus,
      phones: customer.phones, locations: customer.locations };
    try { const updated = await this.customersService.update(customer.id, request); this.selected.set(updated); this.success.set('Asignación y estado actualizados.'); await this.search(); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'No fue posible actualizar el cliente.'); }
    finally { this.saving.set(false); }
  }

  routeName(routeId: string): string { return this.routes().find((route) => route.id === routeId)?.name ?? 'Ruta no disponible'; }

  private async initialize(): Promise<void> {
    try { this.routes.set((await this.routesService.list()).filter((route) => route.status === 'Active')); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'No fue posible consultar las rutas.'); }
    await this.search();
  }
}
