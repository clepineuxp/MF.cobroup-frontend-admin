import { TestBed } from '@angular/core/testing';
import { OrganizationSettingsService } from '../data/organization-settings.service';
import { OrganizationSettingsPage } from './organization-settings.page';

describe('OrganizationSettingsPage', () => {
  const current = {
    timeZoneId: 'America/Bogota', currencyCode: 'COP',
    maxActiveCustomersPerRoute: 100, maxActiveLoansPerRoute: null,
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
  });

  it('saves nullable organization limits', async () => {
    const fixture = TestBed.createComponent(OrganizationSettingsPage);
    await fixture.whenStable();

    await fixture.componentInstance.submit();

    expect(service.update).toHaveBeenCalledWith(expect.objectContaining({
      timeZoneId: 'America/Bogota', currencyCode: 'COP', maxActiveLoansPerRoute: null,
    }));
  });
});
