import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ManagedUserRole, OrganizationUser } from '../data/users.models';
import { UsersService } from '../data/users.service';

@Component({
  selector: 'app-users-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
})
export class UsersPage {
  private readonly service = inject(UsersService);
  readonly context = inject(AuthService).context;
  readonly users = signal<readonly OrganizationUser[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  private loadVersion = 0;
  private loadAbort: AbortController | null = null;
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80), Validators.pattern(/\S/)] }),
    displayName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(160), Validators.pattern(/\S/)] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(7), Validators.maxLength(24), Validators.pattern(/^(?=(?:\D*\d){7})[+\d ()-]+$/)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(12), Validators.maxLength(128), Validators.pattern(/\S/)] }),
    role: new FormControl<ManagedUserRole>('Collector', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.loadVersion++;
      this.loadAbort?.abort();
      this.form.controls.password.reset();
    });
    effect(() => {
      const context = this.context();
      this.form.reset();
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
    this.busy.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const user = await this.service.create({ ...input, username: input.username.trim(),
        displayName: input.displayName.trim(), phoneNumber: input.phoneNumber.trim() });
      if (this.destroyRef.destroyed || this.context()?.organizationId !== organizationId) return;
      this.form.reset();
      this.success.set(`Usuario ${user.username} creado. Ya puede ingresar a COBROUP con sus credenciales.`);
      await this.load(organizationId);
    } catch (error) {
      if (this.context()?.organizationId === organizationId)
        this.error.set(error instanceof Error ? error.message : 'No fue posible crear el usuario.');
    } finally {
      this.form.controls.password.reset();
      this.busy.set(false);
    }
  }

  roleLabel(user: OrganizationUser): string {
    return user.isOwner ? 'Administrador dueño' : user.role === 'Admin' ? 'Administrador'
      : user.role === 'Supervisor' ? 'Supervisor' : 'Colaborador (cobrador)';
  }
}
