import { TestBed } from '@angular/core/testing';
import { RoutesService } from '../../routes/data/routes.service';
import { LoansService } from '../data/loans.service';
import { LoansPage } from './loans.page';

describe('Admin LoansPage', () => {
  const loansService = {
    search: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'loan-1',
          customerId: 'cust-1',
          customerName: 'Santiago Morales',
          routeId: 'route-1',
          principalAmount: 200000,
          interestRate: 20,
          totalAmount: 240000,
          balanceAmount: 240000,
          paymentFrequency: 'Daily',
          installmentCount: 24,
          status: 'Active',
          createdAtUtc: new Date().toISOString(),
          dueAtUtc: new Date().toISOString(),
        },
      ],
      page: 1,
      pageSize: 25,
      totalCount: 1,
    }),
    get: vi.fn().mockResolvedValue({
      id: 'loan-1',
      customerId: 'cust-1',
      customerName: 'Santiago Morales',
      routeId: 'route-1',
      routeName: 'Ruta Norte',
      principalAmount: 200000,
      interestRate: 20,
      totalAmount: 240000,
      balanceAmount: 240000,
      paymentFrequency: 'Daily',
      installmentCount: 2,
      status: 'Active',
      createdByRole: 'Collector',
      createdAtUtc: new Date().toISOString(),
      dueAtUtc: new Date().toISOString(),
      installments: [
        {
          id: 'inst-1',
          number: 1,
          dueDate: '2026-11-01',
          expectedAmount: 120000,
          paidAmount: 0,
          status: 'Pending',
        },
        {
          id: 'inst-2',
          number: 2,
          dueDate: '2026-11-02',
          expectedAmount: 120000,
          paidAmount: 0,
          status: 'Pending',
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

    expect(loansService.search).toHaveBeenCalledWith(undefined, undefined, 'Active');
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
});
