import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuditAction, AuditEntityType, FinancialMovementAuditLog } from '../data/route-finance.models';
import { RouteFinancesService } from '../data/route-finances.service';
import { RoutesService } from '../../routes/data/routes.service';
import { CollectionRoute } from '../../routes/data/route.models';

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  Loan: 'Préstamo',
  Payment: 'Cobro',
  RouteFinancialEntry: 'Ingreso / Gasto',
};

const ACTION_LABELS: Record<AuditAction, string> = {
  Created: 'Creado',
  Updated: 'Modificado',
  Deleted: 'Eliminado',
};

const ACTION_CSS: Record<AuditAction, string> = {
  Created: 'action-created',
  Updated: 'action-updated',
  Deleted: 'action-deleted',
};

@Component({
  selector: 'app-audit-trace-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './audit-trace.page.html',
  styleUrl: './audit-trace.page.scss',
})
export class AuditTracePage {
  private readonly service = inject(RouteFinancesService);
  private readonly routesService = inject(RoutesService);

  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly logs = signal<readonly FinancialMovementAuditLog[]>([]);
  readonly loading = signal(false);
  readonly loadingRoutes = signal(false);
  readonly error = signal('');

  readonly filters = new FormGroup({
    routeId: new FormControl<string>('', { nonNullable: true }),
    fromDate: new FormControl<string>('', { nonNullable: true }),
    toDate: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() { void this.loadRoutes(); }

  private async loadRoutes(): Promise<void> {
    this.loadingRoutes.set(true);
    try {
      this.routes.set(await this.routesService.list());
    } catch {
      this.error.set('No fue posible cargar las rutas.');
    } finally {
      this.loadingRoutes.set(false);
    }
  }

  async search(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.logs.set([]);
    const { routeId, fromDate, toDate } = this.filters.getRawValue();
    try {
      const result = await this.service.getAuditTrace(
        routeId || undefined,
        fromDate || undefined,
        toDate || undefined,
      );
      this.logs.set(result);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al consultar la traza.');
    } finally {
      this.loading.set(false);
    }
  }

  entityLabel(type: AuditEntityType): string { return ENTITY_LABELS[type] ?? type; }
  actionLabel(action: AuditAction): string { return ACTION_LABELS[action] ?? action; }
  actionCss(action: AuditAction): string { return ACTION_CSS[action] ?? ''; }
}
