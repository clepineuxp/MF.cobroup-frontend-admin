import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RoutesService } from '../../routes/data/routes.service';
import { CollectionRoute } from '../../routes/data/route.models';
import { LoanDetails, LoanSearchItem } from '../data/loan.models';
import { LoansService } from '../data/loans.service';

@Component({
  selector: 'app-admin-loans-page',
  imports: [CurrencyPipe, DatePipe, NgClass],
  templateUrl: './loans.page.html',
  styleUrl: './loans.page.scss',
})
export class LoansPage {
  private readonly loansService = inject(LoansService);
  private readonly routesService = inject(RoutesService);

  readonly items = signal<readonly LoanSearchItem[]>([]);
  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly selectedLoan = signal<LoanDetails | null>(null);

  readonly loading = signal(true);
  readonly error = signal('');

  readonly statusFilter = signal<string>('');
  readonly routeFilter = signal<string>('');

  constructor() {
    void this.init();
  }

  async init(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [loansRes, routesRes] = await Promise.all([
        this.loansService.search(),
        this.routesService.list().catch(() => []),
      ]);

      this.items.set(loansRes.items);
      this.routes.set(routesRes);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al cargar préstamos.');
    } finally {
      this.loading.set(false);
    }
  }

  async filterLoans(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await this.loansService.search(
        this.routeFilter() || undefined,
        undefined,
        this.statusFilter() || undefined
      );
      this.items.set(res.items);
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
    this.routeFilter.set(value);
    void this.filterLoans();
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
}
