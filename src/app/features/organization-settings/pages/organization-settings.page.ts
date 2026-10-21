import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrganizationSettingsService } from '../data/organization-settings.service';

@Component({
  selector: 'app-organization-settings-page',
  imports: [ReactiveFormsModule],
  templateUrl: './organization-settings.page.html',
  styleUrl: './organization-settings.page.scss',
})
export class OrganizationSettingsPage {
  private readonly settingsService = inject(OrganizationSettingsService);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly configured = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly form = new FormGroup({
    timeZoneId: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    currencyCode: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)] }),
    maxActiveCustomersPerRoute: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    maxActiveLoansPerRoute: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
  });

  constructor() { void this.load(); }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.error.set(''); this.success.set('');
    const value = this.form.getRawValue();
    try {
      const saved = await this.settingsService.update({
        ...value,
        currencyCode: value.currencyCode.toUpperCase(),
      });
      this.configured.set(true);
      this.form.patchValue(saved);
      this.success.set('Configuración guardada. Los cupos heredados ya usan estos valores.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible guardar la configuración.');
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    try {
      const response = await this.settingsService.get();
      this.configured.set(response.configured);
      this.form.patchValue(response.settings ?? {
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currencyCode: '',
        maxActiveCustomersPerRoute: null,
        maxActiveLoansPerRoute: null,
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible cargar la configuración.');
    } finally {
      this.loading.set(false);
    }
  }
}
