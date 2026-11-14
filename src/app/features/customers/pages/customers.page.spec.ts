import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteSelectionService } from '../../routes/data/route-selection.service';
import { RoutesService } from '../../routes/data/routes.service';
import { CustomersService } from '../data/customers.service';
import { CustomersPage } from './customers.page';

describe('CustomersPage', () => {
  const summary = {
    id: 'customer-1',
    routeId: 'route-1',
    identification: '001234567',
    firstNames: 'Ana',
    lastNames: 'Pérez',
    businessOrWorkName: null,
    primaryPhone: '3001112233',
    primaryLatitude: 4.7,
    primaryLongitude: -74.1,
    status: 'Active' as const,
    updatedAtUtc: '2026-10-21T00:00:00Z',
  };

  const detail = {
    ...summary,
    observations: null,
    createdAtUtc: '2026-10-21T00:00:00Z',
    phones: [{ id: 'phone-1', number: '3001112233', isPrimary: true }],
    locations: [{ id: 'location-1', latitude: 4.7, longitude: -74.1, alias: 'Casa', address: null, isPrimary: true, source: 'Manual' as const }],
  };

  const customers = {
    search: vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 50, totalCount: 1 }),
    get: vi.fn().mockResolvedValue(detail),
    update: vi.fn().mockResolvedValue(detail),
  };

  const routes = {
    list: vi.fn().mockResolvedValue([{ id: 'route-1', name: 'Centro', status: 'Active' }]),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [CustomersPage],
      providers: [
        { provide: CustomersService, useValue: customers },
        { provide: RoutesService, useValue: routes },
      ],
    }).compileComponents();
  });

  it('renders tenant customers returned by the administrative facade', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
    expect(fixture.nativeElement.textContent).toContain('Centro');
  });

  it('preserves contact data when an administrator changes assignment in modal', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    await fixture.componentInstance.inspect('customer-1');
    fixture.detectChanges();

    // Verify modal is open
    const modal = fixture.nativeElement.querySelector('.customer-modal-dialog');
    expect(modal).toBeTruthy();

    await fixture.componentInstance.saveAssignment();
    expect(customers.update).toHaveBeenCalledWith('customer-1', expect.objectContaining({
      identification: detail.identification,
      phones: detail.phones,
      locations: detail.locations,
    }));
  });

  it('requires identification and preserves a valid ID when changing assignment', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    await page.inspect('customer-1');
    page.editIdentification = '';
    await page.saveAssignment();
    expect(customers.update).not.toHaveBeenCalled();
    expect(page.error()).toContain('identificación');

    page.editIdentification = '0';
    await page.saveAssignment();
    expect(customers.update).not.toHaveBeenCalled();

    page.editIdentification = '  001777  ';
    await page.saveAssignment();
    expect(customers.update).toHaveBeenCalledWith('customer-1', expect.objectContaining({ identification: '001777' }));
  });

  it('allows retaining the migrated zero in an existing customer', async () => {
    customers.get.mockResolvedValueOnce({ ...detail, identification: '0' });
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    await page.inspect('customer-1');
    await page.saveAssignment();
    expect(customers.update).toHaveBeenCalledWith('customer-1', expect.objectContaining({ identification: '0' }));
  });

  it('closes the modal dialog when close() is invoked', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    await page.inspect('customer-1');
    expect(page.selected()).toBeTruthy();

    page.close();
    expect(page.selected()).toBeNull();
  });

  it('supports loadMore to fetch the next page from the backend', async () => {
    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;

    // Initial page returned 1 item out of 25 total
    page.totalCount.set(25);
    expect(page.hasMoreCards()).toBe(true);

    const secondBatch = Array.from({ length: 12 }, (_, i) => ({
      ...summary,
      id: `c-page2-${i}`,
      firstNames: `User ${i}`,
    }));
    customers.search.mockResolvedValueOnce({
      items: secondBatch,
      page: 2,
      pageSize: 12,
      totalCount: 25,
    });

    await page.loadMore();
    expect(customers.search).toHaveBeenCalledWith('', '', 2, 12);
    expect(page.customers().length).toBe(13);
    expect(page.hasMoreCards()).toBe(true);
  });

  it('shares selected route state via RouteSelectionService across menus', async () => {
    const routeSelection = TestBed.inject(RouteSelectionService);
    routeSelection.setSelectedRoute('route-1');

    const fixture = TestBed.createComponent(CustomersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;

    expect(page.filterRouteId).toBe('route-1');
    expect(customers.search).toHaveBeenCalledWith('route-1', '', 1, 12);

    page.onFilterChange('');
    expect(routeSelection.selectedRouteId()).toBe('');
  });
});
