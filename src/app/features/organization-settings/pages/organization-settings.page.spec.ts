import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationSettingsService } from '../data/organization-settings.service';
import { OrganizationSettingsPage } from './organization-settings.page';

describe('OrganizationSettingsPage', () => {
  const current = {
    timeZoneId: 'America/Bogota', currencyCode: 'COP',
    maxActiveCustomersPerRoute: 100, maxActiveLoansPerRoute: null,
    dailyClosingTimeUtc: '09:00:00',
    enforceDailyClosingSchedule: true,
    updatedAtUtc: new Date().toISOString(),
  };
  const service = {
    get: vi.fn().mockResolvedValue({ configured: true, settings: current }),
    update: vi.fn().mockResolvedValue(current),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OrganizationSettingsPage],
      providers: [{ provide: OrganizationSettingsService, useValue: service }],
    }).compileComponents();
  });

  it('loads configured values', async () => {
    const fixture = TestBed.createComponent(OrganizationSettingsPage);
    await fixture.whenStable();

    expect(fixture.componentInstance.form.controls.currencyCode.value).toBe('COP');
    expect(fixture.componentInstance.configured()).toBe(true);
    expect(fixture.componentInstance.form.controls.enforceDailyClosingSchedule.value).toBe(true);
    expect(fixture.componentInstance.form.controls.dailyClosingTimeLocal.value).toBe('04:00');
  });

  it('saves nullable organization limits and closing schedule', async () => {
    const fixture = TestBed.createComponent(OrganizationSettingsPage);
    await fixture.whenStable();

    await fixture.componentInstance.submit();

    expect(service.update).toHaveBeenCalledWith(expect.objectContaining({
      timeZoneId: 'America/Bogota',
      currencyCode: 'COP',
      maxActiveLoansPerRoute: null,
      dailyClosingTimeUtc: '09:00:00',
      enforceDailyClosingSchedule: true,
    }));
  });

  it('converts local time to UTC and back accurately for America/Bogota', () => {
    const fixture = TestBed.createComponent(OrganizationSettingsPage);
    const page = fixture.componentInstance;
    // America/Bogota is UTC-5
    const utc = page.convertLocalTimeToUtc('04:00', 'America/Bogota');
    expect(utc).toBe('09:00:00');
    const local = page.convertUtcTimeToLocal('09:00:00', 'America/Bogota');
    expect(local).toBe('04:00');
  });
});
