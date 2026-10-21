import { TestBed } from '@angular/core/testing';
import { RoutesService } from '../../routes/data/routes.service';
import { CustomersService } from '../data/customers.service';
import { CustomersPage } from './customers.page';

describe('CustomersPage', () => {
  const summary = { id: 'customer-1', routeId: 'route-1', firstNames: 'Ana', lastNames: 'Pérez', businessOrWorkName: null,
    primaryPhone: '3001112233', primaryLatitude: 4.7, primaryLongitude: -74.1, status: 'Active' as const, updatedAtUtc: '2026-10-21T00:00:00Z' };
  const detail = { ...summary, observations: null, createdAtUtc: '2026-10-21T00:00:00Z',
    phones: [{ id: 'phone-1', number: '3001112233', isPrimary: true }],
    locations: [{ id: 'location-1', latitude: 4.7, longitude: -74.1, alias: 'Casa', address: null, isPrimary: true, source: 'Manual' as const }] };
  const customers = { search: vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 50, totalCount: 1 }), get: vi.fn().mockResolvedValue(detail), update: vi.fn().mockResolvedValue(detail) };
  const routes = { list: vi.fn().mockResolvedValue([{ id: 'route-1', name: 'Centro', status: 'Active' }]) };

  beforeEach(async () => {
    vi.clearAllMocks(); vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({ imports: [CustomersPage], providers: [
      { provide: CustomersService, useValue: customers }, { provide: RoutesService, useValue: routes },
    ] }).compileComponents();
  });

  it('renders tenant customers returned by the administrative facade', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
    expect(fixture.nativeElement.textContent).toContain('Centro');
  });

  it('preserves contact data when an administrator changes assignment', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    await fixture.componentInstance.inspect('customer-1');
    await fixture.componentInstance.saveAssignment();
    expect(customers.update).toHaveBeenCalledWith('customer-1', expect.objectContaining({ phones: detail.phones, locations: detail.locations }));
  });
});
