import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutesService } from '../../routes/data/routes.service';
import { LoansService } from '../data/loans.service';
import { LoansPage } from './loans.page';

describe('Admin LoansPage', () => {
  const sampleLoan1 = {
    id: 'loan-1',
    customerId: 'cust-1',
    customerName: 'Santiago Morales',
    routeId: 'route-1',
    principalAmount: 200000,
    interestRate: 20,
    totalAmount: 240000,
    balanceAmount: 240000,
    paymentFrequency: 'Daily' as const,
    installmentCount: 24,
    status: 'Active' as const,
    createdAtUtc: '2026-11-01T10:00:00Z',
    startsAtUtc: '2026-11-01T10:00:00Z',
    dueAtUtc: '2026-11-25T10:00:00Z',
  };

  const sampleLoan2 = {
    id: 'loan-2',
    customerId: 'cust-2',
    customerName: 'Carolina Restrepo',
    routeId: 'route-1',
    principalAmount: 500000,
    interestRate: 15,
    totalAmount: 575000,
    balanceAmount: 0,
    paymentFrequency: 'Monthly' as const,
    installmentCount: 3,
    status: 'PaidOff' as const,
    createdAtUtc: '2026-10-15T08:00:00Z',
    startsAtUtc: '2026-10-15T08:00:00Z',
    dueAtUtc: '2027-01-15T08:00:00Z',
  };

  const loansService = {
    search: vi.fn().mockResolvedValue({
      items: [sampleLoan1, sampleLoan2],
      page: 1,
      pageSize: 50,
      totalCount: 2,
    }),
    get: vi.fn().mockResolvedValue({
      id: 'loan-1',
      customerId: 'cust-1',
      customerName: 'Santiago Morales',
      routeId: 'route-1',
      routeName: 'Ruta Norte',
      principalAmount: 200000,
      interestRate: 20,
      interestAmount: 40000,
      totalAmount: 240000,
      paidAmount: 0,
      balanceAmount: 240000,
      paymentFrequency: 'Daily' as const,
      installmentCount: 2,
      status: 'Active' as const,
      createdByUserId: 'user-1',
      createdByRole: 'Collector',
      createdAtUtc: '2026-11-01T10:00:00Z',
      startsAtUtc: '2026-11-01T10:00:00Z',
      dueAtUtc: '2026-11-25T10:00:00Z',
      installments: [
        {
          id: 'inst-1',
          number: 1,
          dueDate: '2026-11-01',
          expectedAmount: 120000,
          paidAmount: 0,
          status: 'Pending' as const,
        },
        {
          id: 'inst-2',
          number: 2,
          dueDate: '2026-11-02',
          expectedAmount: 120000,
          paidAmount: 0,
          status: 'Pending' as const,
        },
      ],
    }),
  };

  const routesService = {
    list: vi.fn().mockResolvedValue([
      { id: 'route-1', name: 'Ruta Norte', activeLoanLimit: 50, activeLoansCount: 10 },
    ]),
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoansPage],
      providers: [
        { provide: LoansService, useValue: loansService },
        { provide: RoutesService, useValue: routesService },
      ],
    }).compileComponents();
  });

  it('renders loans list with customer name and financial metrics', async () => {
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Santiago Morales');
    expect(fixture.nativeElement.textContent).toContain('Carolina Restrepo');
    expect(fixture.nativeElement.textContent).toContain('Activo');
    expect(loansService.search).toHaveBeenCalled();
  });

  it('filters loans when status pill is selected', async () => {
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    page.setStatusFilter('Active');
    await fixture.whenStable();

    expect(loansService.search).toHaveBeenCalledWith(undefined, undefined, 'Active', 1, 12, undefined);
  });

  it('inspects loan details and shows installment schedule modal', async () => {
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    await page.viewLoan('loan-1');
    fixture.detectChanges();

    expect(loansService.get).toHaveBeenCalledWith('loan-1');
    expect(page.selectedLoan()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Amortización y Cronograma (2 cuotas)');
    expect(fixture.nativeElement.textContent).toContain('Ruta Norte');

    page.closeDetail();
    fixture.detectChanges();
    expect(page.selectedLoan()).toBeNull();
  });

  it('filters loans in real-time by customer name search', async () => {
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#loan-search-input') as HTMLInputElement;
    input.value = 'Carolina';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    expect(page.filteredLoans().length).toBe(1);
    expect(page.filteredLoans()[0].customerName).toBe('Carolina Restrepo');
    expect(page.visibleLoans().length).toBe(1);
  });

  it('filters loans by date (e.g. 2026-11)', async () => {
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#loan-search-input') as HTMLInputElement;
    input.value = '2026-11';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    expect(page.filteredLoans().length).toBe(1);
    expect(page.filteredLoans()[0].customerName).toBe('Santiago Morales');
  });

  it('clears search and resets filters properly', async () => {
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    page.searchTerm = 'test';
    page.clearSearch();
    expect(page.searchTerm).toBe('');

    page.filterRouteId = 'route-1';
    page.searchTerm = 'algo';
    page.resetFilters();
    expect(page.filterRouteId).toBe('');
    expect(page.statusFilter()).toBe('');
    expect(page.searchTerm).toBe('');
  });

  it('supports pagination with loadMore when there are more than 12 loans', async () => {
    const firstBatch = Array.from({ length: 12 }, (_, i) => ({
      ...sampleLoan1,
      id: `loan-${i + 1}`,
      customerName: `Cliente ${i + 1}`,
    }));
    loansService.search.mockResolvedValueOnce({
      items: firstBatch,
      page: 1,
      pageSize: 12,
      totalCount: 25,
    });

    const fixture = TestBed.createComponent(LoansPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    expect(page.items().length).toBe(12);
    expect(page.hasMoreCards()).toBe(true);
    expect(page.remainingCount()).toBe(13);

    const secondBatch = Array.from({ length: 12 }, (_, i) => ({
      ...sampleLoan1,
      id: `loan-${i + 13}`,
      customerName: `Cliente ${i + 13}`,
    }));
    loansService.search.mockResolvedValueOnce({
      items: secondBatch,
      page: 2,
      pageSize: 12,
      totalCount: 25,
    });

    await page.loadMore();
    fixture.detectChanges();
    expect(loansService.search).toHaveBeenCalledWith(undefined, undefined, undefined, 2, 12, undefined);
    expect(page.items().length).toBe(24);
    expect(page.remainingCount()).toBe(1);
  });
});
