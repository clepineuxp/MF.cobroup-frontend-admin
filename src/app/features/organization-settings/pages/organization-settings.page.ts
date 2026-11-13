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
    dailyClosingTimeLocal: new FormControl<string>('', { nonNullable: true }),
    enforceDailyClosingSchedule: new FormControl<boolean>(false, { nonNullable: true }),
  });

  constructor() { void this.load(); }

  get calculatedUtcPreview(): string {
    const localTime = this.form.controls.dailyClosingTimeLocal.value;
    const timeZoneId = this.form.controls.timeZoneId.value;
    if (!localTime || !timeZoneId) return '';
    try {
      return this.convertLocalTimeToUtc(localTime, timeZoneId);
    } catch {
      return '';
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.error.set(''); this.success.set('');
    const value = this.form.getRawValue();
    try {
      const dailyClosingTimeUtc = value.dailyClosingTimeLocal
        ? this.convertLocalTimeToUtc(value.dailyClosingTimeLocal, value.timeZoneId)
        : null;

      const saved = await this.settingsService.update({
        timeZoneId: value.timeZoneId,
        currencyCode: value.currencyCode.toUpperCase(),
        maxActiveCustomersPerRoute: value.maxActiveCustomersPerRoute,
        maxActiveLoansPerRoute: value.maxActiveLoansPerRoute,
        dailyClosingTimeUtc,
        enforceDailyClosingSchedule: value.enforceDailyClosingSchedule,
      });
      this.configured.set(true);
      this.form.patchValue({
        timeZoneId: saved.timeZoneId,
        currencyCode: saved.currencyCode,
        maxActiveCustomersPerRoute: saved.maxActiveCustomersPerRoute,
        maxActiveLoansPerRoute: saved.maxActiveLoansPerRoute,
        dailyClosingTimeLocal: saved.dailyClosingTimeUtc
          ? this.convertUtcTimeToLocal(saved.dailyClosingTimeUtc, saved.timeZoneId)
          : '',
        enforceDailyClosingSchedule: saved.enforceDailyClosingSchedule ?? false,
      });
      this.success.set('Configuración guardada. Los cupos y parámetros heredados ya usan estos valores.');
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
      const tz = response.settings?.timeZoneId || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localTime = response.settings?.dailyClosingTimeUtc
        ? this.convertUtcTimeToLocal(response.settings.dailyClosingTimeUtc, tz)
        : '';

      this.form.patchValue({
        timeZoneId: tz,
        currencyCode: response.settings?.currencyCode ?? '',
        maxActiveCustomersPerRoute: response.settings?.maxActiveCustomersPerRoute ?? null,
        maxActiveLoansPerRoute: response.settings?.maxActiveLoansPerRoute ?? null,
        dailyClosingTimeLocal: localTime,
        enforceDailyClosingSchedule: response.settings?.enforceDailyClosingSchedule ?? false,
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible cargar la configuración.');
    } finally {
      this.loading.set(false);
    }
  }

  private getTimeZoneOffsetMinutes(timeZoneId: string, date: Date = new Date()): number {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
      const year = getPart('year');
      const month = getPart('month');
      const day = getPart('day');
      let hour = getPart('hour');
      if (hour === 24) hour = 0;
      const minute = getPart('minute');
      const second = getPart('second');

      const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
      return Math.round((asUtc - date.getTime()) / 60000);
    } catch {
      return 0;
    }
  }

  convertLocalTimeToUtc(localTime: string, timeZoneId: string): string {
    if (!localTime) return '';
    const parts = localTime.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const offsetMinutes = this.getTimeZoneOffsetMinutes(timeZoneId);
    let totalUtcMinutes = (hours * 60 + minutes - offsetMinutes) % 1440;
    if (totalUtcMinutes < 0) totalUtcMinutes += 1440;
    const utcHours = Math.floor(totalUtcMinutes / 60);
    const utcMins = totalUtcMinutes % 60;
    return `${String(utcHours).padStart(2, '0')}:${String(utcMins).padStart(2, '0')}:00`;
  }

  convertUtcTimeToLocal(utcTime: string, timeZoneId: string): string {
    if (!utcTime) return '';
    const parts = utcTime.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const offsetMinutes = this.getTimeZoneOffsetMinutes(timeZoneId);
    let totalLocalMinutes = (hours * 60 + minutes + offsetMinutes) % 1440;
    if (totalLocalMinutes < 0) totalLocalMinutes += 1440;
    const localHours = Math.floor(totalLocalMinutes / 60);
    const localMins = totalLocalMinutes % 60;
    return `${String(localHours).padStart(2, '0')}:${String(localMins).padStart(2, '0')}`;
  }
}
