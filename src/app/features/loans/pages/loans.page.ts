import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../../shared/ui/app-icon/app-icon.component';
import { RouteSelectorComponent } from '../../../shared/ui/route-selector/route-selector.component';
import { CollectionRoute } from '../../routes/data/route.models';
import { RouteSelectionService } from '../../routes/data/route-selection.service';
import { RoutesService } from '../../routes/data/routes.service';
import { LoanDetails, LoanSearchItem, LoanStatus, PaymentFrequency } from '../data/loan.models';
import { LoansService } from '../data/loans.service';

@Component({
  selector: 'app-admin-loans-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, FormsModule, AppIconComponent, RouteSelectorComponent],
  templateUrl: './loans.page.html',
  styleUrl: './loans.page.scss',
})
export class LoansPage {
  private readonly loansService = inject(LoansService);
  private readonly routesService = inject(RoutesService);
  private readonly routeSelection = inject(RouteSelectionService);

  readonly items = signal<readonly LoanSearchItem[]>([]);
  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly selectedLoan = signal<LoanDetails | null>(null);

  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly error = signal('');
  readonly totalCount = signal(0);

  private readonly PAGE_SIZE = 12;
  private currentPage = 1;

  filterRouteId = this.routeSelection.selectedRouteId();
  readonly statusFilter = signal<string>('');
  readonly routeFilter = signal<string>(this.routeSelection.selectedRouteId());
  readonly searchFilter = signal<string>('');

  get searchTerm(): string {
    return this.searchFilter();
  }

  set searchTerm(value: string) {
    this.searchFilter.set(value);
  }

  readonly routeMap = computed(() => {
    const map = new Map<string, string>();
    for (const r of this.routes()) {
      map.set(r.id, r.name);
    }
    return map;
  });

  readonly filteredLoans = computed(() => {
    const all = this.items();
    const routeId = this.filterRouteId || this.routeFilter();
    const status = this.statusFilter();
    const term = this.searchFilter().trim().toLowerCase();
    const routeMap = this.routeMap();

    return all.filter((loan) => {
      if (routeId && loan.routeId !== routeId) {
        return false;
      }

      if (status && loan.status !== status) {
        return false;
      }

      if (term) {
        return this.matchesSearch(loan, term, routeMap.get(loan.routeId) ?? '');
      }

      return true;
    });
  });

  readonly visibleLoans = computed(() => {
    return this.filteredLoans();
  });

  readonly hasMoreCards = computed(() => {
    return this.items().length < this.totalCount();
  });

  readonly remainingCount = computed(() => {
    return Math.max(0, this.totalCount() - this.items().length);
  });

  constructor() {
    void this.init();
  }

  async init(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.currentPage = 1;
    try {
      const initialRoute = this.filterRouteId || undefined;
      const [loansRes, routesRes] = await Promise.all([
        this.loansService.search(initialRoute, undefined, undefined, 1, this.PAGE_SIZE),
        this.routesService.list().catch(() => []),
      ]);

      this.routes.set(routesRes);
      const validRoute = this.routeSelection.ensureValidRoute(routesRes);
      if (validRoute !== this.filterRouteId) {
        this.filterRouteId = validRoute;
        this.routeFilter.set(validRoute);
        const refreshed = await this.loansService.search(validRoute || undefined, undefined, undefined, 1, this.PAGE_SIZE);
        this.items.set(refreshed.items);
        this.totalCount.set(refreshed.totalCount);
      } else {
        this.items.set(loansRes.items);
        this.totalCount.set(loansRes.totalCount);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al cargar préstamos.');
    } finally {
      this.loading.set(false);
    }
  }

  async filterLoans(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.currentPage = 1;

    const effectiveRouteId = this.filterRouteId || this.routeFilter() || undefined;
    const effectiveStatus = this.statusFilter() || undefined;
    const search = this.searchTerm.trim() || undefined;

    try {
      const res = await this.loansService.search(
        effectiveRouteId,
        undefined,
        effectiveStatus,
        1,
        this.PAGE_SIZE,
        search
      );
      this.items.set(res.items);
      this.totalCount.set(res.totalCount);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al filtrar préstamos.');
    } finally {
      this.loading.set(false);
    }
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    void this.filterLoans();
  }

  setRouteFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterRouteId = value;
    this.routeFilter.set(value);
    this.routeSelection.setSelectedRoute(value);
    void this.filterLoans();
  }

  onRouteFilterChange(routeId?: string): void {
    if (routeId !== undefined) {
      this.filterRouteId = routeId;
    }
    this.routeFilter.set(this.filterRouteId);
    this.routeSelection.setSelectedRoute(this.filterRouteId);
    void this.filterLoans();
  }

  onSearchSubmit(): void {
    void this.filterLoans();
  }

  clearSearch(): void {
    this.searchTerm = '';
    void this.filterLoans();
  }

  resetFilters(): void {
    this.filterRouteId = '';
    this.routeFilter.set('');
    this.routeSelection.clear();
    this.statusFilter.set('');
    this.searchTerm = '';
    void this.filterLoans();
  }

  async loadMore(): Promise<void> {
    if (this.loadingMore() || !this.hasMoreCards()) return;

    this.loadingMore.set(true);
    try {
      const nextPage = this.currentPage + 1;
      const effectiveRouteId = this.filterRouteId || this.routeFilter() || undefined;
      const effectiveStatus = this.statusFilter() || undefined;
      const search = this.searchTerm.trim() || undefined;

      const res = await this.loansService.search(
        effectiveRouteId,
        undefined,
        effectiveStatus,
        nextPage,
        this.PAGE_SIZE,
        search
      );
      this.currentPage = nextPage;
      this.items.update((curr) => [...curr, ...res.items]);
      this.totalCount.set(res.totalCount);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No fue posible cargar más préstamos.');
    } finally {
      this.loadingMore.set(false);
    }
  }

  async viewLoan(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const loan = await this.loansService.get(id);
      this.selectedLoan.set(loan);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al consultar el detalle del préstamo.');
    } finally {
      this.loading.set(false);
    }
  }

  closeDetail(): void {
    this.selectedLoan.set(null);
  }

  getRouteName(routeId: string): string {
    return this.routeMap().get(routeId) ?? 'Ruta general';
  }

  getCustomerInitials(name: string): string {
    if (!name) return 'CR';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatStatus(status: LoanStatus): string {
    switch (status) {
      case 'Active':
        return 'Activo';
      case 'PaidOff':
        return 'Liquidado';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  formatFrequency(frequency: PaymentFrequency): string {
    switch (frequency) {
      case 'Daily':
        return 'Diario';
      case 'Weekly':
        return 'Semanal';
      case 'EveryNDays':
        return 'Cada N días';
      case 'Monthly':
        return 'Mensual';
      default:
        return frequency;
    }
  }

  private matchesSearch(loan: LoanSearchItem, term: string, routeName: string): boolean {
    if (loan.customerName.toLowerCase().includes(term)) return true;
    if (loan.id.toLowerCase().includes(term)) return true;
    if (routeName.toLowerCase().includes(term)) return true;

    const statusLabel = this.formatStatus(loan.status).toLowerCase();
    if (statusLabel.includes(term) || loan.status.toLowerCase().includes(term)) return true;

    const freqLabel = this.formatFrequency(loan.paymentFrequency).toLowerCase();
    if (freqLabel.includes(term) || loan.paymentFrequency.toLowerCase().includes(term)) return true;

    const dateStrings = [loan.startsAtUtc, loan.dueAtUtc, loan.createdAtUtc].filter(Boolean);
    for (const ds of dateStrings) {
      if (ds.toLowerCase().includes(term)) return true;
      try {
        const dt = new Date(ds);
        if (!isNaN(dt.getTime())) {
          const iso = dt.toISOString().slice(0, 10);
          if (iso.includes(term)) return true;
          const formatted = dt.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
          if (formatted.includes(term)) return true;
          const monthFull = dt.toLocaleDateString('es-CO', { month: 'long' }).toLowerCase();
          if (monthFull.includes(term)) return true;
        }
      } catch {
        // ignore date error
      }
    }

    if (loan.principalAmount.toString().includes(term)) return true;
    if (loan.totalAmount.toString().includes(term)) return true;
    if (loan.balanceAmount.toString().includes(term)) return true;

    return false;
  }
}
