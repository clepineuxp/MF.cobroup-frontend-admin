import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppIconComponent } from '../../../shared/ui/app-icon/app-icon.component';
import { RouteSelectorComponent } from '../../../shared/ui/route-selector/route-selector.component';
import { LoansService } from '../../loans/data/loans.service';
import { CollectionRoute } from '../../routes/data/route.models';
import { RouteSelectionService } from '../../routes/data/route-selection.service';
import { RoutesService } from '../../routes/data/routes.service';
import {
  FilterPeriod,
  FinancialMovementItem,
  MovementBadgeClass,
  MovementSection,
  RouteBalance,
  RouteFinancialEntry,
  RouteFinancialEntryType,
  SaveRouteFinancialEntryRequest,
} from '../data/route-finance.models';
import { RouteFinancesService } from '../data/route-finances.service';

@Component({
  selector: 'app-route-finance-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, AppIconComponent, RouteSelectorComponent],
  templateUrl: './route-finance.page.html',
  styleUrl: './route-finance.page.scss',
})
export class RouteFinancePage {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly routesService = inject(RoutesService);
  private readonly routeSelection = inject(RouteSelectionService);
  private readonly finances = inject(RouteFinancesService);
  private readonly loansService = inject(LoansService);

  // Routes
  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');

  // Route Selection:
  // 'all' = Todas las rutas
  // string (routeId) = Ruta única
  readonly selectedRouteId = signal<string>(this.routeSelection.selectedRouteId() || 'all');
  // For multi-selection mode:
  readonly selectedMultiRouteIds = signal<Set<string>>(new Set());
  readonly isMultiSelectActive = signal(false);
  readonly multiRouteSearchQuery = signal<string>('');

  // Balance
  readonly balance = signal<RouteBalance | null>(null);

  // Tab: 'income' (Ingresos y Cobros) | 'expense' (Gastos y Préstamos) | 'all' (Todos)
  readonly activeTab = signal<'income' | 'expense' | 'all'>('income');

  // Period / Date filter
  readonly periodType = signal<FilterPeriod>('daily');
  readonly selectedDate = signal<Date>(new Date());
  readonly rangeStartDate = signal<string>('');
  readonly rangeEndDate = signal<string>('');

  // Movements
  readonly movements = signal<readonly FinancialMovementItem[]>([]);
  readonly loadingMovements = signal(false);

  // Search & Category Filter
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(25);
  readonly pageSizeOptions = [10, 25, 50, 100];

  // Reopening
  readonly reopening = signal(false);

  // Modal State
  readonly isModalOpen = signal(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly editingEntry = signal<RouteFinancialEntry | null>(null);
  readonly saving = signal(false);
  readonly modalError = signal('');

  readonly modalForm = new FormGroup({
    routeId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<RouteFinancialEntryType>('Income', { nonNullable: true }),
    concept: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(160)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
    amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
  });

  // Computed: Selected routes list
  readonly activeSelectedRoutes = computed<readonly CollectionRoute[]>(() => {
    const all = this.routes();
    if (this.isMultiSelectActive()) {
      const ids = this.selectedMultiRouteIds();
      return all.filter((r) => ids.has(r.id));
    }
    const single = this.selectedRouteId();
    if (single === 'all') return all;
    return all.filter((r) => r.id === single);
  });

  readonly isSingleRouteSelected = computed(() => {
    return !this.isMultiSelectActive() && this.selectedRouteId() !== 'all';
  });

  readonly currentSingleRoute = computed<CollectionRoute | null>(() => {
    if (!this.isSingleRouteSelected()) return null;
    return this.routes().find((r) => r.id === this.selectedRouteId()) ?? null;
  });

  readonly filteredMultiRoutes = computed<readonly CollectionRoute[]>(() => {
    const all = this.routes();
    const q = this.multiRouteSearchQuery().trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(q);
      const supMatch = (r.supervisor?.displayName ?? '').toLowerCase().includes(q);
      return nameMatch || supMatch;
    });
  });

  // Computed: Description of period
  readonly viewingText = computed(() => {
    const target = this.selectedDate();
    const period = this.periodType();
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    if (period === 'daily') {
      const isToday = this.isSameDay(target, new Date());
      const dayName = days[target.getDay()];
      const prefix = isToday ? 'Hoy, ' : '';
      return `${prefix}${dayName} ${target.getDate()} de ${months[target.getMonth()]} de ${target.getFullYear()}`;
    }
    if (period === 'weekly') {
      const start = this.getStartOfWeek(target);
      const end = this.getEndOfWeek(target);
      return `Semana del ${start.getDate()} ${months[start.getMonth()].slice(0, 3)} al ${end.getDate()} ${months[end.getMonth()].slice(0, 3)} ${target.getFullYear()}`;
    }
    if (period === 'monthly') {
      return `Mes de ${months[target.getMonth()]} de ${target.getFullYear()}`;
    }
    if (period === 'yearly') {
      return `Año ${target.getFullYear()}`;
    }
    if (period === 'range') {
      const s = this.rangeStartDate();
      const e = this.rangeEndDate();
      if (!s && !e) return 'Rango sin fechas seleccionadas';
      if (s && !e) return `Desde ${s}`;
      if (!s && e) return `Hasta ${e}`;
      return `Del ${s} al ${e}`;
    }
    return 'Todos los periodos históricos';
  });

  // Filtered movements by date period, category and search
  readonly filteredMovements = computed(() => {
    const all = this.movements();
    const period = this.periodType();
    const target = this.selectedDate();
    const category = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return all.filter((item) => {
      // 1. Period filter
      const itemDate = item.date;
      if (period === 'daily') {
        if (!this.isSameDay(itemDate, target)) return false;
      } else if (period === 'weekly') {
        const start = this.getStartOfWeek(target);
        const end = this.getEndOfWeek(target);
        if (itemDate < start || itemDate > end) return false;
      } else if (period === 'monthly') {
        if (itemDate.getFullYear() !== target.getFullYear() || itemDate.getMonth() !== target.getMonth()) {
          return false;
        }
      } else if (period === 'yearly') {
        if (itemDate.getFullYear() !== target.getFullYear()) return false;
      } else if (period === 'range') {
        const startStr = this.rangeStartDate();
        const endStr = this.rangeEndDate();
        if (startStr) {
          const s = new Date(startStr + 'T00:00:00');
          if (itemDate < s) return false;
        }
        if (endStr) {
          const e = new Date(endStr + 'T23:59:59.999');
          if (itemDate > e) return false;
        }
      }

      // 2. Category filter
      if (category !== 'all' && item.type !== category) {
        return false;
      }

      // 3. Search query
      if (query) {
        const concept = item.concept.toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const user = item.createdBy.toLowerCase();
        const route = item.routeName.toLowerCase();
        const amountStr = item.amount.toString();
        if (
          !concept.includes(query) &&
          !desc.includes(query) &&
          !user.includes(query) &&
          !route.includes(query) &&
          !amountStr.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  });

  // Movements for active tab
  readonly tabMovements = computed(() => {
    const tab = this.activeTab();
    const filtered = this.filteredMovements();
    if (tab === 'all') return filtered;
    return filtered.filter((m) => m.section === tab);
  });

  // Counts & Subtotals
  readonly incomeCount = computed(
    () => this.filteredMovements().filter((m) => m.section === 'income').length
  );
  readonly expenseCount = computed(
    () => this.filteredMovements().filter((m) => m.section === 'expense').length
  );
  readonly allCount = computed(() => this.filteredMovements().length);

  readonly incomeSubtotal = computed(() =>
    this.filteredMovements()
      .filter((m) => m.section === 'income')
      .reduce((acc, m) => acc + m.amount, 0)
  );

  readonly expenseSubtotal = computed(() =>
    this.filteredMovements()
      .filter((m) => m.section === 'expense')
      .reduce((acc, m) => acc + m.amount, 0)
  );

  readonly netPeriod = computed(() => this.incomeSubtotal() - this.expenseSubtotal());

  // Pagination Computeds
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.tabMovements().length / this.pageSize()))
  );

  readonly paginatedMovements = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.tabMovements().slice(start, start + size);
  });

  readonly startIndex = computed(() => {
    if (this.tabMovements().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endIndex = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.tabMovements().length);
  });

  readonly pageNumbers = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    this.loading.set(true);
    try {
      const routes = await this.routesService.list();
      this.routes.set(routes);

      // Read query params if any
      const qRoute = this.activatedRoute.snapshot.queryParamMap.get('routeId');
      const qTab = (
        this.activatedRoute.snapshot.queryParamMap.get('tab') ||
        this.activatedRoute.snapshot.data['section'] ||
        ''
      ).toLowerCase();

      if (qTab === 'expense' || qTab === 'expenses' || qTab === 'ventas' || qTab === 'gastos') {
        this.activeTab.set('expense');
      } else if (qTab === 'income' || qTab === 'incomes' || qTab === 'recaudos' || qTab === 'ingresos') {
        this.activeTab.set('income');
      }

      if (qRoute && routes.some((r) => r.id === qRoute)) {
        this.selectedRouteId.set(qRoute);
        this.routeSelection.setSelectedRoute(qRoute);
      } else {
        const sharedRoute = this.routeSelection.ensureValidRoute(routes);
        this.selectedRouteId.set(sharedRoute || 'all');
      }

      await this.reload();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No fue posible cargar las rutas.');
    } finally {
      this.loading.set(false);
    }
  }

  async selectRoute(routeId: string): Promise<void> {
    const normalized = !routeId || routeId === 'all' ? 'all' : routeId;
    this.isMultiSelectActive.set(false);
    this.selectedRouteId.set(normalized);
    this.routeSelection.setSelectedRoute(normalized === 'all' ? '' : normalized);
    this.currentPage.set(1);
    this.error.set('');
    this.success.set('');
    await this.reload();
  }

  onMultiRouteSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.multiRouteSearchQuery.set(val);
  }

  selectAllMultiRoutes(): void {
    this.selectedMultiRouteIds.set(new Set(this.routes().map((r) => r.id)));
    this.currentPage.set(1);
    void this.reload();
  }

  toggleMultiSelect(): void {
    const nextState = !this.isMultiSelectActive();
    this.isMultiSelectActive.set(nextState);
    if (nextState) {
      const current = this.selectedRouteId();
      if (current && current !== 'all') {
        this.selectedMultiRouteIds.set(new Set([current]));
      } else {
        this.selectedMultiRouteIds.set(new Set(this.routes().map((r) => r.id)));
      }
    }
    this.currentPage.set(1);
    void this.reload();
  }

  toggleRouteInMulti(routeId: string): void {
    const next = new Set(this.selectedMultiRouteIds());
    if (next.has(routeId)) {
      if (next.size > 1) {
        next.delete(routeId);
      }
    } else {
      next.add(routeId);
    }
    this.selectedMultiRouteIds.set(next);
    this.currentPage.set(1);
    void this.reload();
  }

  isRouteInMulti(routeId: string): boolean {
    return this.selectedMultiRouteIds().has(routeId);
  }

  setTab(tab: 'income' | 'expense' | 'all'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  setPeriod(period: FilterPeriod): void {
    this.periodType.set(period);
    this.currentPage.set(1);
  }

  navigatePeriod(direction: -1 | 1): void {
    const curr = new Date(this.selectedDate());
    const period = this.periodType();

    if (period === 'daily') {
      curr.setDate(curr.getDate() + direction);
    } else if (period === 'weekly') {
      curr.setDate(curr.getDate() + direction * 7);
    } else if (period === 'monthly') {
      curr.setMonth(curr.getMonth() + direction);
    } else if (period === 'yearly') {
      curr.setFullYear(curr.getFullYear() + direction);
    }
    this.selectedDate.set(curr);
    this.currentPage.set(1);
  }

  selectDate(d: string): void {
    if (!d) return;
    const [year, month, day] = d.split('-').map(Number);
    this.selectedDate.set(new Date(year, month - 1, day));
    this.currentPage.set(1);
  }

  setRangeStartDate(val: string): void {
    this.rangeStartDate.set(val);
    this.currentPage.set(1);
  }

  setRangeEndDate(val: string): void {
    this.rangeEndDate.set(val);
    this.currentPage.set(1);
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  async reload(): Promise<void> {
    this.loadingMovements.set(true);
    try {
      const activeRoutes = this.activeSelectedRoutes();

      if (activeRoutes.length === 0) {
        this.balance.set(null);
        this.movements.set([]);
        return;
      }

      // 1. Fetch Balances
      const balancePromises = activeRoutes.map((r) =>
        this.finances.getBalance(r.id).catch(() => null)
      );
      const balances = (await Promise.all(balancePromises)).filter(
        (b): b is RouteBalance => b !== null
      );

      if (balances.length === 1 && !this.isMultiSelectActive() && this.selectedRouteId() !== 'all') {
        this.balance.set(balances[0]);
      } else {
        const consolidated: RouteBalance = {
          routeId: '',
          routeName: activeRoutes.length === this.routes().length
            ? 'Todas las rutas (Consolidado general)'
            : `${activeRoutes.length} rutas seleccionadas`,
          initialBalance: balances.reduce((acc, b) => acc + b.initialBalance, 0),
          loanDisbursements: balances.reduce((acc, b) => acc + b.loanDisbursements, 0),
          paymentCollections: balances.reduce((acc, b) => acc + b.paymentCollections, 0),
          incomeInvestments: balances.reduce((acc, b) => acc + b.incomeInvestments, 0),
          expenses: balances.reduce((acc, b) => acc + b.expenses, 0),
          netBalance: balances.reduce((acc, b) => acc + b.netBalance, 0),
        };
        this.balance.set(consolidated);
      }

      // 2. Fetch Movements (Entries, Loans, Audit Trace)
      const routeMap = new Map(activeRoutes.map((r) => [r.id, r.name]));

      const [incomesArrays, expensesArrays, loansArrays, auditLogs] = await Promise.all([
        Promise.all(activeRoutes.map((r) => this.finances.listEntries(r.id, 'income-investments').catch(() => []))),
        Promise.all(activeRoutes.map((r) => this.finances.listEntries(r.id, 'expenses').catch(() => []))),
        Promise.all(activeRoutes.map((r) => this.loansService.search(r.id, undefined, undefined, 1, 100).catch(() => ({ items: [] })))),
        this.finances.getAuditTrace(
          this.isSingleRouteSelected() ? this.selectedRouteId() : undefined
        ).catch(() => []),
      ]);

      const items: FinancialMovementItem[] = [];

      // A. Manual Incomes / Investments
      for (const list of incomesArrays) {
        for (const entry of list) {
          const isMicro = entry.type === 'Microinsurance';
          const isInv = entry.type === 'Investment';
          items.push({
            id: entry.id,
            routeId: entry.routeId,
            routeName: routeMap.get(entry.routeId) ?? 'Ruta',
            section: 'income',
            type: entry.type,
            badge: isMicro ? 'Microseguro' : isInv ? 'Inversión' : 'Ingreso',
            badgeClass: isMicro ? 'microinsurance' : isInv ? 'investment' : 'income',
            concept: entry.concept,
            description: entry.description,
            amount: entry.amount,
            date: new Date(entry.createdAtUtc),
            createdBy: entry.createdByDisplayName || 'Sistema',
            canEdit: entry.canEdit,
            rawEntry: entry,
          });
        }
      }

      // B. Manual Expenses
      for (const list of expensesArrays) {
        for (const entry of list) {
          items.push({
            id: entry.id,
            routeId: entry.routeId,
            routeName: routeMap.get(entry.routeId) ?? 'Ruta',
            section: 'expense',
            type: entry.type,
            badge: 'Gasto',
            badgeClass: 'expense',
            concept: entry.concept,
            description: entry.description,
            amount: entry.amount,
            date: new Date(entry.createdAtUtc),
            createdBy: entry.createdByDisplayName || 'Sistema',
            canEdit: entry.canEdit,
            rawEntry: entry,
          });
        }
      }

      // C. Disbursed Loans
      for (let i = 0; i < activeRoutes.length; i++) {
        const route = activeRoutes[i];
        const loansRes = loansArrays[i];
        for (const loan of loansRes.items) {
          items.push({
            id: `loan-${loan.id}`,
            routeId: loan.routeId,
            routeName: route.name,
            section: 'expense',
            type: 'Loan',
            badge: 'Préstamo',
            badgeClass: 'loan',
            concept: `Desembolso préstamo - ${loan.customerName}`,
            description: `Monto total: $${loan.totalAmount.toLocaleString()} · ${loan.installmentCount} cuotas`,
            amount: loan.principalAmount,
            date: new Date(loan.createdAtUtc || loan.startsAtUtc),
            createdBy: 'Operación de Ruta',
            canEdit: false,
          });
        }
      }

      // D. Payment Collections (from Audit Trace)
      const activeIds = new Set(activeRoutes.map((r) => r.id));
      for (const log of auditLogs) {
        if (log.entityType === 'Payment' && log.action === 'Created' && activeIds.has(log.routeId) && (log.amount ?? 0) > 0) {
          items.push({
            id: `pay-${log.id}`,
            routeId: log.routeId,
            routeName: routeMap.get(log.routeId) ?? 'Ruta',
            section: 'income',
            type: 'Payment',
            badge: 'Cobro',
            badgeClass: 'payment',
            concept: log.concept || 'Recaudo de cuota',
            description: log.details,
            amount: log.amount!,
            date: new Date(log.localTimestamp || Date.now()),
            createdBy: log.performedByDisplayName || 'Cobrador',
            canEdit: false,
          });
        }
      }

      // Sort newest to oldest
      items.sort((a, b) => b.date.getTime() - a.date.getTime());
      this.movements.set(items);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al recargar los movimientos.');
    } finally {
      this.loadingMovements.set(false);
    }
  }

  // Modal actions
  openCreateModal(defaultType: RouteFinancialEntryType = 'Income'): void {
    if (this.saving()) return;
    this.modalMode.set('create');
    this.editingEntry.set(null);
    this.modalError.set('');

    const targetRoute = this.isSingleRouteSelected()
      ? this.selectedRouteId()
      : this.routes().length > 0
        ? this.routes()[0].id
        : '';

    this.modalForm.reset({
      routeId: targetRoute,
      type: defaultType,
      concept: '',
      description: '',
      amount: null,
    });
    this.isModalOpen.set(true);
  }

  openEditModal(entry: RouteFinancialEntry): void {
    if (!entry.canEdit || this.saving()) return;
    this.modalMode.set('edit');
    this.editingEntry.set(entry);
    this.modalError.set('');
    this.modalForm.reset({
      routeId: entry.routeId,
      type: entry.type,
      concept: entry.concept,
      description: entry.description ?? '',
      amount: entry.amount,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    if (this.saving()) return;
    this.isModalOpen.set(false);
    this.editingEntry.set(null);
    this.modalError.set('');
  }

  async submitModal(): Promise<void> {
    if (this.modalForm.invalid || this.saving()) {
      this.modalForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.modalError.set('');
    this.error.set('');
    this.success.set('');

    try {
      const val = this.modalForm.getRawValue();
      const request: SaveRouteFinancialEntryRequest = {
        routeId: val.routeId,
        type: val.type,
        concept: (val.concept || '').trim(),
        description: (val.description || '').trim() || null,
        amount: val.amount!,
      };

      const editing = this.editingEntry();
      if (editing) {
        await this.finances.update(editing.id, request);
        this.success.set('Movimiento actualizado con éxito.');
      } else {
        await this.finances.create(request);
        this.success.set('Movimiento registrado exitosamente.');
      }

      this.isModalOpen.set(false);
      this.editingEntry.set(null);
      this.modalError.set('');
      await this.reload();
    } catch (err) {
      this.modalError.set(err instanceof Error ? err.message : 'No fue posible guardar el movimiento.');
    } finally {
      this.saving.set(false);
    }
  }

  async reopenBox(): Promise<void> {
    const route = this.currentSingleRoute();
    if (!route || this.reopening()) return;
    if (
      !confirm(
        `¿Deseas reabrir la última caja cerrada para la ruta "${route.name}"? Solo es posible si no existe otra caja abierta actualmente.`
      )
    ) {
      return;
    }

    this.reopening.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const res = await this.finances.reopenBox(route.id);
      this.success.set(res.message || 'Caja reabierta exitosamente.');
      await this.reload();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No fue posible reabrir la caja.');
    } finally {
      this.reopening.set(false);
    }
  }

  getRouteSupervisor(route: CollectionRoute): string | null {
    return route?.supervisor?.displayName ?? null;
  }

  // Helpers
  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private getStartOfWeek(d: Date): Date {
    const res = new Date(d);
    const day = res.getDay();
    const diff = res.getDate() - day + (day === 0 ? -6 : 1);
    res.setDate(diff);
    res.setHours(0, 0, 0, 0);
    return res;
  }

  private getEndOfWeek(d: Date): Date {
    const start = this.getStartOfWeek(d);
    const res = new Date(start);
    res.setDate(start.getDate() + 6);
    res.setHours(23, 59, 59, 999);
    return res;
  }
}
