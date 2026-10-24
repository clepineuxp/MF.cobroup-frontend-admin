import { EditorDialogComponent } from '../../../shared/ui/editor-dialog/editor-dialog.component';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignableUser, CollectionRoute, RouteSettingMode, UpdateRouteRequest } from '../data/route.models';
import { RoutesService } from '../data/routes.service';

@Component({
  selector: 'app-routes-page',
  imports: [EditorDialogComponent, ReactiveFormsModule],
  templateUrl: './routes.page.html',
  styleUrl: './routes.page.scss',
})
export class RoutesPage {
  readonly editorOpen = signal(false);
  openCreate(): void {
    if (this.saving()) return;
    this.resetForm(); this.error.set(''); this.success.set(''); this.editorOpen.set(true);
  }
  closeEditor(): void {
    if (this.saving()) return;
    this.resetForm(); this.error.set('');
  }
  private readonly routesService = inject(RoutesService);
  readonly routes = signal<readonly CollectionRoute[]>([]);
  readonly users = signal<readonly AssignableUser[]>([]);
  readonly selectedCollectorIds = signal<ReadonlySet<string>>(new Set());
  readonly editingRouteId = signal<string | null>(null);
  readonly supervisors = computed(() => this.users().filter((user) => user.role === 'Supervisor'));
  readonly collectors = computed(() => this.users().filter((user) => user.role === 'Collector'));
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    supervisorUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<'Active' | 'Inactive'>('Active', { nonNullable: true }),
    maxActiveCustomersMode: new FormControl<RouteSettingMode>('Inherited', { nonNullable: true }),
    maxActiveCustomersOverride: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    maxActiveLoansMode: new FormControl<RouteSettingMode>('Inherited', { nonNullable: true }),
    maxActiveLoansOverride: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
  });

  constructor() { void this.load(); }

  toggleCollector(userId: string, checked: boolean): void {
    const selected = new Set(this.selectedCollectorIds());
    checked ? selected.add(userId) : selected.delete(userId);
    this.selectedCollectorIds.set(selected);
  }

  edit(route: CollectionRoute): void {
    if (this.saving()) return;
    this.error.set(''); this.success.set('');
    this.editingRouteId.set(route.id);
    this.selectedCollectorIds.set(new Set(route.collectors.map((collector) => collector.id)));
    this.form.reset({
      name: route.name,
      description: route.description ?? '',
      supervisorUserId: route.supervisor.id,
      status: route.status,
      maxActiveCustomersMode: route.maxActiveCustomers.mode,
      maxActiveCustomersOverride: route.maxActiveCustomers.overrideValue,
      maxActiveLoansMode: route.maxActiveLoans.mode,
      maxActiveLoansOverride: route.maxActiveLoans.overrideValue,
    });
    this.editorOpen.set(true);
  }

  cancelEdit(): void { this.resetForm(); }

  async submit(): Promise<void> {
    if (this.form.invalid || this.selectedCollectorIds().size === 0 || this.saving()) {
      this.form.markAllAsTouched();
      if (this.selectedCollectorIds().size === 0) this.error.set('Selecciona al menos un cobrador.');
      return;
    }

    this.saving.set(true); this.error.set(''); this.success.set('');
    const value = this.form.getRawValue();
    if ((value.maxActiveCustomersMode === 'Overridden' && !value.maxActiveCustomersOverride)
      || (value.maxActiveLoansMode === 'Overridden' && !value.maxActiveLoansOverride)) {
      this.error.set('Los cupos sobrescritos deben ser mayores que cero.');
      this.saving.set(false);
      return;
    }
    try {
      const request: UpdateRouteRequest = {
        name: value.name,
        description: value.description.trim() || null,
        supervisorUserId: value.supervisorUserId,
        collectorUserIds: [...this.selectedCollectorIds()],
        status: value.status,
        maxActiveCustomersMode: value.maxActiveCustomersMode,
        maxActiveCustomersOverride: value.maxActiveCustomersMode === 'Overridden' ? value.maxActiveCustomersOverride : null,
        maxActiveLoansMode: value.maxActiveLoansMode,
        maxActiveLoansOverride: value.maxActiveLoansMode === 'Overridden' ? value.maxActiveLoansOverride : null,
      };
      const editingRouteId = this.editingRouteId();
      if (editingRouteId) await this.routesService.update(editingRouteId, request);
      else await this.routesService.create(request);
      this.success.set(editingRouteId ? 'Ruta actualizada correctamente.' : 'Ruta creada correctamente.');
      this.resetForm();
      this.routes.set(await this.routesService.list());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible crear la ruta.');
    } finally {
      this.saving.set(false);
    }
  }

  private resetForm(): void {
    this.editorOpen.set(false);
    this.form.reset({
      name: '', description: '', supervisorUserId: '', status: 'Active',
      maxActiveCustomersMode: 'Inherited', maxActiveCustomersOverride: null,
      maxActiveLoansMode: 'Inherited', maxActiveLoansOverride: null,
    });
    this.selectedCollectorIds.set(new Set());
    this.editingRouteId.set(null);
  }

  private async load(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      const [routes, users] = await Promise.all([
        this.routesService.list(),
        this.routesService.listAssignableUsers(),
      ]);
      this.routes.set(routes); this.users.set(users);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible cargar la administración de rutas.');
    } finally {
      this.loading.set(false);
    }
  }
}
