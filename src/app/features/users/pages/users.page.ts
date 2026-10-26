import { EditorDialogComponent } from '../../../shared/ui/editor-dialog/editor-dialog.component';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ManagedUserRole, OrganizationUser } from '../data/users.models';
import { UsersService } from '../data/users.service';

@Component({
  selector: 'app-users-page',
  imports: [EditorDialogComponent, ReactiveFormsModule, DatePipe],
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
})
export class UsersPage {
  readonly editorOpen = signal(false);
  openCreate(): void {
    if (this.busy()) return;
    this.resetForm(); this.error.set(''); this.success.set(''); this.editorOpen.set(true);
  }
  closeEditor(): void {
    if (this.busy()) return;
    this.resetForm(); this.error.set('');
  }
  private readonly service = inject(UsersService);
  readonly context = inject(AuthService).context;
  readonly users = signal<readonly OrganizationUser[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly editing = signal<OrganizationUser | null>(null);
  readonly editIsActive = signal(true);
  private loadVersion = 0;
  private activeScope: string | null = null;
  private loadAbort: AbortController | null = null;
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80), Validators.pattern(/\S/)] }),
    displayName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(160), Validators.pattern(/\S/)] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(7), Validators.maxLength(24), Validators.pattern(/^(?=(?:\D*\d){7})[+\d ()-]+$/)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    role: new FormControl<'Admin' | ManagedUserRole>('Collector', { nonNullable: true, validators: [Validators.required] }),
    canReopenDay: new FormControl<boolean>(false, { nonNullable: true }),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.loadVersion++;
      this.loadAbort?.abort();
      this.form.controls.password.reset();
    });
    effect(() => {
      const context = this.context();
      const scope = context ? `${context.userId}:${context.organizationId}:${context.role}` : '';
      if (scope === this.activeScope) return;
      this.activeScope = scope;
      this.resetForm();
      this.success.set('');
      this.error.set('');
      this.users.set([]);
      this.loadVersion++;
      this.loadAbort?.abort();
      if (context?.role === 'Admin') void this.load(context.organizationId);
    });
  }

  async load(organizationId = this.context()?.organizationId): Promise<void> {
    if (!organizationId) return;
    const version = ++this.loadVersion;
    this.loadAbort?.abort();
    this.loadAbort = new AbortController();
    this.loading.set(true);
    this.error.set('');
    try {
      const users = await this.service.list(this.loadAbort.signal);
      if (version === this.loadVersion && this.context()?.organizationId === organizationId) this.users.set(users);
    } catch (error) {
      if (version === this.loadVersion) this.error.set(error instanceof Error ? error.message : 'No fue posible cargar los usuarios.');
    } finally {
      if (version === this.loadVersion) this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.busy() || this.form.invalid || this.context()?.role !== 'Admin') {
      this.form.markAllAsTouched();
      return;
    }
    const context = this.context();
    if (!context) return;
    const organizationId = context.organizationId;
    const input = this.form.getRawValue();
    const editing = this.editing();
    this.busy.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const trimmed = { ...input, username: input.username.trim(), displayName: input.displayName.trim(), phoneNumber: input.phoneNumber.trim() };
      let user: OrganizationUser;
      if (editing) user = await this.service.update(editing.id, { ...trimmed, isActive: this.editIsActive(), password: input.password || null, canReopenDay: input.role === 'Supervisor' ? input.canReopenDay : undefined });
      else {
        if (input.role !== 'Supervisor' && input.role !== 'Collector') return;
        user = await this.service.create({ ...trimmed, role: input.role, canReopenDay: input.role === 'Supervisor' ? input.canReopenDay : undefined });
      }
      if (this.destroyRef.destroyed || this.context()?.organizationId !== organizationId) return;
      this.resetForm();
      this.success.set(editing ? `Usuario ${user.username} actualizado correctamente.` : `Usuario ${user.username} creado. Ya puede ingresar a COBROUP con sus credenciales.`);
      await this.load(organizationId);
    } catch (error) {
      if (this.context()?.organizationId === organizationId)
        this.error.set(error instanceof Error ? error.message : 'No fue posible crear el usuario.');
    } finally {
      this.form.controls.password.reset();
      this.busy.set(false);
    }
  }

  canEdit(user: OrganizationUser): boolean { return user.role !== 'Admin' || user.id === this.context()?.userId; }

  edit(user: OrganizationUser): void {
    if (this.busy() || !this.canEdit(user)) return;
    this.editing.set(user); this.editIsActive.set(user.isActive);
    this.form.controls.role.enable();
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.form.reset({ username: user.username, displayName: user.displayName, phoneNumber: user.phoneNumber ?? '', role: user.role, password: '', canReopenDay: user.canReopenDay ?? false });
    if (user.role === 'Admin') this.form.controls.role.disable();
    this.error.set(''); this.success.set('');
    this.editorOpen.set(true);
  }

  cancelEdit(): void { if (!this.busy()) { this.resetForm(); this.error.set(''); } }

  private resetForm(): void {
    this.editorOpen.set(false);
    this.editing.set(null); this.editIsActive.set(true);
    this.form.controls.role.enable();
    this.form.controls.password.setValidators([Validators.required]);
    this.form.controls.password.updateValueAndValidity();
    this.form.reset();
  }

  setEditStatus(event: Event): void { this.editIsActive.set((event.target as HTMLSelectElement).value === 'true'); }

  roleLabel(user: OrganizationUser): string {
    return user.isOwner ? 'Administrador dueño' : user.role === 'Admin' ? 'Administrador'
      : user.role === 'Supervisor' ? 'Supervisor' : 'Colaborador (cobrador)';
  }
}
