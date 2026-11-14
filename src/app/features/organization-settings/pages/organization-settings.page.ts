import { DatePipe } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppIconComponent } from '../../../shared/ui/app-icon/app-icon.component';
import { OrganizationSettingsService } from '../data/organization-settings.service';

export interface CurrencyPreset {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
}

export interface TimezonePreset {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'app-organization-settings-page',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, AppIconComponent],
  templateUrl: './organization-settings.page.html',
  styleUrl: './organization-settings.page.scss',
})
export class OrganizationSettingsPage implements OnDestroy {
  private readonly settingsService = inject(OrganizationSettingsService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly configured = signal(false);
  readonly lastUpdatedAt = signal<string | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly currentTimeInTz = signal<string>('');

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  readonly currencyPresets: readonly CurrencyPreset[] = [
    { code: 'COP', name: 'Peso colombiano', symbol: '$' },
    { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
    { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
    { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
    { code: 'BRL', name: 'Real brasileño', symbol: 'R$' },
    { code: 'ARS', name: 'Peso argentino', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
  ];

  readonly timezonePresets: readonly TimezonePreset[] = [
    { id: 'America/Bogota', label: 'Bogotá, Lima, Quito (UTC−5)' },
    { id: 'America/Mexico_City', label: 'Ciudad de México (UTC−6)' },
    { id: 'America/Sao_Paulo', label: 'São Paulo, Brasilia (UTC−3)' },
    { id: 'America/Santiago', label: 'Santiago de Chile (UTC−4/−3)' },
    { id: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC−3)' },
    { id: 'America/Caracas', label: 'Caracas (UTC−4)' },
    { id: 'America/La_Paz', label: 'La Paz (UTC−4)' },
    { id: 'America/Guayaquil', label: 'Guayaquil (UTC−5)' },
    { id: 'America/Panama', label: 'Panamá (UTC−5)' },
    { id: 'America/Costa_Rica', label: 'Centroamérica / San José (UTC−6)' },
    { id: 'America/Santo_Domingo', label: 'Santo Domingo (UTC−4)' },
    { id: 'America/New_York', label: 'Nueva York, Miami (UTC−5/−4)' },
    { id: 'UTC', label: 'UTC (Tiempo Universal Coordinado)' },
  ];

  readonly form = new FormGroup({
    timeZoneId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    currencyCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)],
    }),
    maxActiveCustomersPerRoute: new FormControl<number | null>(null, {
      validators: [Validators.min(1)],
    }),
    maxActiveLoansPerRoute: new FormControl<number | null>(null, {
      validators: [Validators.min(1)],
    }),
    dailyClosingTimeLocal: new FormControl<string>('', { nonNullable: true }),
    enforceDailyClosingSchedule: new FormControl<boolean>(false, { nonNullable: true }),
  });

  constructor() {
    void this.load();
    this.startClock();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

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

  selectCurrency(code: string): void {
    this.form.controls.currencyCode.setValue(code);
    this.form.controls.currencyCode.markAsDirty();
  }

  selectTimezone(id: string): void {
    this.form.controls.timeZoneId.setValue(id);
    this.form.controls.timeZoneId.markAsDirty();
    this.updateClock();
  }

  setCustomersUnlimited(unlimited: boolean): void {
    if (unlimited) {
      this.form.controls.maxActiveCustomersPerRoute.setValue(null);
    } else if (!this.form.controls.maxActiveCustomersPerRoute.value) {
      this.form.controls.maxActiveCustomersPerRoute.setValue(200);
    }
    this.form.controls.maxActiveCustomersPerRoute.markAsDirty();
  }

  setLoansUnlimited(unlimited: boolean): void {
    if (unlimited) {
      this.form.controls.maxActiveLoansPerRoute.setValue(null);
    } else if (!this.form.controls.maxActiveLoansPerRoute.value) {
      this.form.controls.maxActiveLoansPerRoute.setValue(150);
    }
    this.form.controls.maxActiveLoansPerRoute.markAsDirty();
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    const value = this.form.getRawValue();

    try {
      const dailyClosingTimeUtc = value.dailyClosingTimeLocal
        ? this.convertLocalTimeToUtc(value.dailyClosingTimeLocal, value.timeZoneId)
        : null;

      const saved = await this.settingsService.update({
        timeZoneId: value.timeZoneId.trim(),
        currencyCode: value.currencyCode.toUpperCase().trim(),
        maxActiveCustomersPerRoute: value.maxActiveCustomersPerRoute,
        maxActiveLoansPerRoute: value.maxActiveLoansPerRoute,
        dailyClosingTimeUtc,
        enforceDailyClosingSchedule: value.enforceDailyClosingSchedule,
      });

      this.configured.set(true);
      this.lastUpdatedAt.set(saved.updatedAtUtc);

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

      this.success.set(
        'Configuración de la organización guardada exitosamente. Todas las rutas que heredan estos parámetros adoptarán los nuevos valores automáticamente.'
      );
      this.updateClock();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible guardar la configuración.');
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await this.settingsService.get();
      this.configured.set(response.configured);
      this.lastUpdatedAt.set(response.settings?.updatedAtUtc ?? null);

      const tz = response.settings?.timeZoneId || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
      const localTime = response.settings?.dailyClosingTimeUtc
        ? this.convertUtcTimeToLocal(response.settings.dailyClosingTimeUtc, tz)
        : '';

      this.form.patchValue({
        timeZoneId: tz,
        currencyCode: response.settings?.currencyCode ?? 'COP',
        maxActiveCustomersPerRoute: response.settings?.maxActiveCustomersPerRoute ?? null,
        maxActiveLoansPerRoute: response.settings?.maxActiveLoansPerRoute ?? null,
        dailyClosingTimeLocal: localTime,
        enforceDailyClosingSchedule: response.settings?.enforceDailyClosingSchedule ?? false,
      });

      this.updateClock();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible cargar la configuración.');
    } finally {
      this.loading.set(false);
    }
  }

  private startClock(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  private updateClock(): void {
    const tz = this.form.controls.timeZoneId.value || 'America/Bogota';
    try {
      const formatted = new Intl.DateTimeFormat('es-CO', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date());
      this.currentTimeInTz.set(formatted);
    } catch {
      this.currentTimeInTz.set('');
    }
  }

  private getTimeZoneOffsetMinutes(timeZoneId: string, date: Date = new Date()): number {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
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
