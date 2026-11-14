import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppIconComponent } from '../../../shared/ui/app-icon/app-icon.component';
import { LoanTemplate } from '../../loan-templates/data/loan-template.models';
import { LoanTemplatesService } from '../../loan-templates/data/loan-templates.service';
import { OrganizationSettings } from '../../organization-settings/data/organization-settings.models';
import { OrganizationSettingsService } from '../../organization-settings/data/organization-settings.service';
import { AssignableUser, CollectionRoute, RouteSettingMode, UpdateRouteRequest } from '../data/route.models';
import { RouteSelectionService } from '../data/route-selection.service';
import { RoutesService } from '../data/routes.service';

@Component({
  selector: 'app-routes-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, AppIconComponent],
  templateUrl: './routes.page.html',
  styleUrl: './routes.page.scss',
})
export class RoutesPage {
  private readonly routesService = inject(RoutesService);
  private readonly routeSelection = inject(RouteSelectionService);
  private readonly templatesService = inject(LoanTemplatesService, { optional: true });
  private readonly orgSettingsService = inject(OrganizationSettingsService, { optional: true });
  private readonly activatedRoute = inject(ActivatedRoute, { optional: true });
  private readonly router = inject(Router, { optional: true });

  // State signals
  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly users = signal<readonly AssignableUser[]>([]);
  readonly templates = signal<readonly LoanTemplate[]>([]);
  readonly orgSettings = signal<OrganizationSettings | null>(null);

  // Search & Filter
  private readonly PAGE_SIZE = 12;
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | 'Active' | 'Inactive'>('ALL');
  readonly visibleLimit = signal(this.PAGE_SIZE);

  // Selection & Editing
  readonly selectedRouteId = signal<string | null>(null);
  readonly editingRouteId = signal<string | null>(null);
  readonly editorOpen = signal(false);
  readonly selectedCollectorIds = signal<ReadonlySet<string>>(new Set());
  readonly selectedTemplateIds = signal<ReadonlySet<string>>(new Set());

  // Inheritance toggles
  readonly inheritCustomers = signal(true);
  readonly inheritLoans = signal(true);
  readonly inheritTimeZone = signal(true);

  // Progress signals
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    supervisorUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<'Active' | 'Inactive'>('Active', { nonNullable: true }),
    timeZoneId: new FormControl<string>('', { nonNullable: true }),
    maxActiveCustomersMode: new FormControl<RouteSettingMode>('Inherited', { nonNullable: true }),
    maxActiveCustomersOverride: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    maxActiveLoansMode: new FormControl<RouteSettingMode>('Inherited', { nonNullable: true }),
    maxActiveLoansOverride: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    initialBalance: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  // Computed properties
  readonly supervisors = computed(() => this.users().filter((user) => user.role === 'Supervisor'));
  readonly collectors = computed(() => this.users().filter((user) => user.role === 'Collector'));
  readonly activeRoutesCount = computed(() => this.routes().filter((r) => r.status === 'Active').length);
  readonly inactiveRoutesCount = computed(() => this.routes().filter((r) => r.status === 'Inactive').length);

  readonly selectedRoute = computed(() =>
    this.routes().find((route) => route.id === this.selectedRouteId()) ?? null
  );

  readonly filteredRoutes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.statusFilter();
    let list = this.routes();

    if (filter !== 'ALL') {
      list = list.filter((r) => r.status === filter);
    }

    if (!term) return list;

    return list.filter((route) => {
      const nameMatch = route.name.toLowerCase().includes(term);
      const descMatch = (route.description ?? '').toLowerCase().includes(term);
      const supervisorMatch =
        (route.supervisor?.displayName ?? '').toLowerCase().includes(term) ||
        (route.supervisor?.username ?? '').toLowerCase().includes(term);
      const collectorsMatch = (route.collectors ?? []).some(
        (c) => c.displayName.toLowerCase().includes(term) || c.username.toLowerCase().includes(term)
      );
      return nameMatch || descMatch || supervisorMatch || collectorsMatch;
    });
  });

  readonly visibleRoutes = computed(() => {
    return this.filteredRoutes().slice(0, this.visibleLimit());
  });

  readonly hasMoreRoutes = computed(() => {
    return this.visibleRoutes().length < this.filteredRoutes().length;
  });

  readonly remainingRoutesCount = computed(() => {
    return Math.max(0, this.filteredRoutes().length - this.visibleRoutes().length);
  });

  readonly effectiveCustomersDisplay = computed(() => {
    const route = this.selectedRoute();
    if (route) {
      const val = route.maxActiveCustomers.effectiveValue ?? this.orgSettings()?.maxActiveCustomersPerRoute;
      return val !== null && val !== undefined ? String(val) : 'Sin límite';
    }
    const orgVal = this.orgSettings()?.maxActiveCustomersPerRoute;
    return orgVal !== null && orgVal !== undefined ? String(orgVal) : 'Sin límite';
  });

  readonly effectiveLoansDisplay = computed(() => {
    const route = this.selectedRoute();
    if (route) {
      const val = route.maxActiveLoans.effectiveValue ?? this.orgSettings()?.maxActiveLoansPerRoute;
      return val !== null && val !== undefined ? String(val) : 'Sin límite';
    }
    const orgVal = this.orgSettings()?.maxActiveLoansPerRoute;
    return orgVal !== null && orgVal !== undefined ? String(orgVal) : 'Sin límite';
  });

  readonly orgTimeZoneDisplay = computed(() => {
    return this.orgSettings()?.timeZoneId || 'America/Bogota';
  });

  constructor() {
    void this.load();
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.visibleLimit.set(this.PAGE_SIZE);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.visibleLimit.set(this.PAGE_SIZE);
  }

  setStatusFilter(status: 'ALL' | 'Active' | 'Inactive'): void {
    this.statusFilter.set(status);
    this.visibleLimit.set(this.PAGE_SIZE);
  }

  loadMore(): void {
    this.visibleLimit.update((current) => current + this.PAGE_SIZE);
  }

  selectRoute(route: CollectionRoute): void {
    if (this.saving()) return;
    this.selectedRouteId.set(route.id);
    this.routeSelection.setSelectedRoute(route.id);
    this.edit(route);
  }

  openCreate(): void {
    if (this.saving()) return;
    this.resetForm();
    this.error.set('');
    this.success.set('');
    this.selectedRouteId.set(null);
    this.editingRouteId.set(null);
    this.inheritCustomers.set(true);
    this.inheritLoans.set(true);
    this.inheritTimeZone.set(true);
    this.editorOpen.set(true);
    this.scrollToConfiguration();
  }

  closeEditor(): void {
    this.cancelEdit();
  }

  cancelEdit(): void {
    if (this.saving()) return;
    this.resetForm();
    this.error.set('');
  }

  edit(route: CollectionRoute): void {
    if (this.saving()) return;
    this.error.set('');
    this.success.set('');
    this.selectedRouteId.set(route.id);
    this.routeSelection.setSelectedRoute(route.id);
    this.editingRouteId.set(route.id);
    this.selectedCollectorIds.set(new Set(route.collectors.map((c) => c.id)));

    const activeIds = new Set(this.templates().filter((t) => t.routeIds.includes(route.id)).map((t) => t.id));
    this.selectedTemplateIds.set(activeIds);

    const inheritCust = route.maxActiveCustomers.mode === 'Inherited';
    this.inheritCustomers.set(inheritCust);

    const inheritLn = route.maxActiveLoans.mode === 'Inherited';
    this.inheritLoans.set(inheritLn);

    const inheritTz = !route.timeZoneId;
    this.inheritTimeZone.set(inheritTz);

    this.form.reset({
      name: route.name,
      description: route.description ?? '',
      supervisorUserId: route.supervisor?.id ?? '',
      status: route.status,
      timeZoneId: route.timeZoneId ?? '',
      maxActiveCustomersMode: route.maxActiveCustomers.mode,
      maxActiveCustomersOverride: route.maxActiveCustomers.overrideValue ?? route.maxActiveCustomers.effectiveValue,
      maxActiveLoansMode: route.maxActiveLoans.mode,
      maxActiveLoansOverride: route.maxActiveLoans.overrideValue ?? route.maxActiveLoans.effectiveValue,
      initialBalance: route.initialBalance ?? 0,
    });

    this.editorOpen.set(true);
    this.scrollToConfiguration();
  }

  toggleInheritCustomers(checked: boolean): void {
    this.inheritCustomers.set(checked);
    this.form.controls.maxActiveCustomersMode.setValue(checked ? 'Inherited' : 'Overridden');
    if (!checked && !this.form.controls.maxActiveCustomersOverride.value) {
      const fallback =
        this.selectedRoute()?.maxActiveCustomers.effectiveValue ??
        this.orgSettings()?.maxActiveCustomersPerRoute ??
        100;
      this.form.controls.maxActiveCustomersOverride.setValue(fallback);
    }
  }

  onCustomersOverrideInput(val: string): void {
    const num = val ? parseInt(val, 10) : null;
    this.form.controls.maxActiveCustomersOverride.setValue(num && !isNaN(num) ? num : null);
  }

  toggleInheritLoans(checked: boolean): void {
    this.inheritLoans.set(checked);
    this.form.controls.maxActiveLoansMode.setValue(checked ? 'Inherited' : 'Overridden');
    if (!checked && !this.form.controls.maxActiveLoansOverride.value) {
      const fallback =
        this.selectedRoute()?.maxActiveLoans.effectiveValue ??
        this.orgSettings()?.maxActiveLoansPerRoute ??
        50;
      this.form.controls.maxActiveLoansOverride.setValue(fallback);
    }
  }

  onLoansOverrideInput(val: string): void {
    const num = val ? parseInt(val, 10) : null;
    this.form.controls.maxActiveLoansOverride.setValue(num && !isNaN(num) ? num : null);
  }

  toggleInheritTimeZone(checked: boolean): void {
    this.inheritTimeZone.set(checked);
    if (checked) {
      this.form.controls.timeZoneId.setValue('');
    } else {
      const fallback =
        this.selectedRoute()?.timeZoneId || this.orgSettings()?.timeZoneId || 'America/Bogota';
      this.form.controls.timeZoneId.setValue(fallback);
    }
  }

  toggleCollector(userId: string, checked: boolean): void {
    const selected = new Set(this.selectedCollectorIds());
    checked ? selected.add(userId) : selected.delete(userId);
    this.selectedCollectorIds.set(selected);
  }

  toggleTemplate(templateId: string, checked: boolean): void {
    const set = new Set(this.selectedTemplateIds());
    checked ? set.add(templateId) : set.delete(templateId);
    this.selectedTemplateIds.set(set);
  }

  selectAllTemplates(): void {
    this.selectedTemplateIds.set(new Set(this.templates().map((t) => t.id)));
  }

  deselectAllTemplates(): void {
    this.selectedTemplateIds.set(new Set());
  }

  getActiveTemplatesCount(routeId: string): number {
    return this.templates().filter((t) => t.routeIds.includes(routeId)).length;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.selectedCollectorIds().size === 0 || this.saving()) {
      this.form.markAllAsTouched();
      if (this.selectedCollectorIds().size === 0) this.error.set('Selecciona al menos un cobrador para la ruta.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const value = this.form.getRawValue();
    const custMode: RouteSettingMode = this.inheritCustomers() ? 'Inherited' : 'Overridden';
    const loansMode: RouteSettingMode = this.inheritLoans() ? 'Inherited' : 'Overridden';
    const tzValue = this.inheritTimeZone() ? '' : value.timeZoneId.trim();

    if (custMode === 'Overridden' && (!value.maxActiveCustomersOverride || value.maxActiveCustomersOverride <= 0)) {
      this.error.set('Los cupos sobrescritos deben ser mayores que cero.');
      this.saving.set(false);
      return;
    }
    if (loansMode === 'Overridden' && (!value.maxActiveLoansOverride || value.maxActiveLoansOverride <= 0)) {
      this.error.set('Los cupos sobrescritos deben ser mayores que cero.');
      this.saving.set(false);
      return;
    }

    try {
      const request: UpdateRouteRequest = {
        name: value.name.trim(),
        description: value.description.trim() || null,
        supervisorUserId: value.supervisorUserId,
        collectorUserIds: [...this.selectedCollectorIds()],
        status: value.status,
        timeZoneId: tzValue || null,
        maxActiveCustomersMode: custMode,
        maxActiveCustomersOverride: custMode === 'Overridden' ? value.maxActiveCustomersOverride : null,
        maxActiveLoansMode: loansMode,
        maxActiveLoansOverride: loansMode === 'Overridden' ? value.maxActiveLoansOverride : null,
        initialBalance: value.initialBalance ?? 0,
        activeTemplateIds: [...this.selectedTemplateIds()],
      };

      const editingRouteId = this.editingRouteId();
      if (editingRouteId) {
        await this.routesService.update(editingRouteId, request);
      } else {
        await this.routesService.create(request);
      }

      this.success.set(editingRouteId ? 'Ruta actualizada correctamente.' : 'Ruta creada correctamente.');
      this.editorOpen.set(false);

      const [updatedRoutes, updatedTemplates] = await Promise.all([
        this.routesService.list(),
        this.templatesService ? this.templatesService.list().catch(() => []) : Promise.resolve([]),
      ]);
      this.routes.set(updatedRoutes);
      this.templates.set(updatedTemplates);

      if (editingRouteId) {
        const refreshed = updatedRoutes.find((r) => r.id === editingRouteId);
        if (refreshed) {
          this.selectedRouteId.set(refreshed.id);
        }
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible guardar la configuración de la ruta.');
    } finally {
      this.saving.set(false);
    }
  }

  private resetForm(): void {
    this.editorOpen.set(false);
    this.form.reset({
      name: '',
      description: '',
      supervisorUserId: '',
      status: 'Active',
      timeZoneId: '',
      maxActiveCustomersMode: 'Inherited',
      maxActiveCustomersOverride: null,
      maxActiveLoansMode: 'Inherited',
      maxActiveLoansOverride: null,
      initialBalance: null,
    });
    this.selectedCollectorIds.set(new Set());
    this.selectedTemplateIds.set(new Set());
    this.editingRouteId.set(null);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [routes, users, templates, orgSettingsResp] = await Promise.all([
        this.routesService.list(),
        this.routesService.listAssignableUsers(),
        this.templatesService ? this.templatesService.list().catch(() => []) : Promise.resolve([]),
        this.orgSettingsService ? this.orgSettingsService.get().catch(() => null) : Promise.resolve(null),
      ]);
      this.routes.set(routes);
      this.users.set(users);
      this.templates.set(templates);
      if (orgSettingsResp?.settings) {
        this.orgSettings.set(orgSettingsResp.settings);
      }

      const editId = this.activatedRoute?.snapshot.queryParamMap.get('edit');
      const requested = editId ? routes.find((route) => route.id === editId) : undefined;
      if (requested) {
        this.selectRoute(requested);
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible cargar la administración de rutas.');
    } finally {
      this.loading.set(false);
    }
  }

  openDashboard(route: CollectionRoute): void {
    if (this.router?.config.some((item) => item.path === 'rutas/:routeId')) {
      void this.router.navigate(['/rutas', route.id]);
    } else {
      void this.router?.navigate(['/balance'], { queryParams: { routeId: route.id } });
    }
  }

  private scrollToConfiguration(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setTimeout(() => {
        const el = document.getElementById('route-configuration-panel');
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }
}
