import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoansService } from '../../loans/data/loans.service';
import { RoutesService } from '../../routes/data/routes.service';
import { RouteFinancesService } from '../data/route-finances.service';
import { RouteFinancePage } from './route-finance.page';

describe('RouteFinancePage', () => {
  const routesServiceMock = {
    list: vi.fn(),
  };

  const financesServiceMock = {
    getBalance: vi.fn(),
    listEntries: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    reopenBox: vi.fn(),
    getAuditTrace: vi.fn(),
  };

  const loansServiceMock = {
    search: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    routesServiceMock.list.mockResolvedValue([
      { id: 'route-1', name: 'Ruta Centro' },
      { id: 'route-2', name: 'Ruta Norte' },
    ]);

    financesServiceMock.getBalance.mockImplementation(async (id: string) => ({
      routeId: id,
      routeName: id === 'route-1' ? 'Ruta Centro' : 'Ruta Norte',
      initialBalance: 100000,
      loanDisbursements: 50000,
      paymentCollections: 80000,
      incomeInvestments: 20000,
      expenses: 10000,
      netBalance: 140000,
    }));

    financesServiceMock.listEntries.mockImplementation(async (id: string, section: string) => {
      if (section === 'income-investments') {
        return [
          {
            id: `income-${id}`,
            routeId: id,
            type: 'Income',
            concept: 'Ingreso caja base',
            description: 'Apertura',
            amount: 20000,
            createdByUserId: 'u1',
            createdByDisplayName: 'Admin',
            createdAtUtc: new Date().toISOString(),
            updatedByUserId: 'u1',
            updatedByDisplayName: 'Admin',
            updatedAtUtc: new Date().toISOString(),
            canEdit: true,
          },
        ];
      }
      return [
        {
          id: `expense-${id}`,
          routeId: id,
          type: 'Expense',
          concept: 'Gasolina',
          description: 'Ruta moto',
          amount: 10000,
          createdByUserId: 'u1',
          createdByDisplayName: 'Admin',
          createdAtUtc: new Date().toISOString(),
          updatedByUserId: 'u1',
          updatedByDisplayName: 'Admin',
          updatedAtUtc: new Date().toISOString(),
          canEdit: true,
        },
      ];
    });

    loansServiceMock.search.mockResolvedValue({
      items: [
        {
          id: 'loan-1',
          customerId: 'c1',
          customerName: 'Juan Perez',
          routeId: 'route-1',
          principalAmount: 50000,
          interestRate: 20,
          totalAmount: 60000,
          balanceAmount: 60000,
          paymentFrequency: 'Daily',
          installmentCount: 20,
          status: 'Active',
          startsAtUtc: new Date().toISOString(),
          dueAtUtc: new Date().toISOString(),
          createdAtUtc: new Date().toISOString(),
        },
      ],
      page: 1,
    });

    financesServiceMock.getAuditTrace.mockResolvedValue([
      {
        id: 'trace-1',
        routeId: 'route-1',
        entityType: 'Payment',
        entityId: 'pay-1',
        action: 'Created',
        concept: 'Cobro cuota 1 - Juan Perez',
        details: 'Pago efectivo',
        amount: 3000,
        localTimestamp: new Date().toISOString(),
        performedByUserId: 'u1',
        performedByDisplayName: 'Cobrador 1',
        performedByRole: 'Collector',
      },
    ]);

    await TestBed.configureTestingModule({
      imports: [RouteFinancePage],
      providers: [
        provideRouter([]),
        { provide: RoutesService, useValue: routesServiceMock },
        { provide: RouteFinancesService, useValue: financesServiceMock },
        { provide: LoansService, useValue: loansServiceMock },
      ],
    }).compileComponents();
  });

  it('creates the component and loads consolidated routes balance by default', async () => {
    const fixture = TestBed.createComponent(RouteFinancePage);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(component.routes()).toHaveLength(2);
    expect(component.selectedRouteId()).toBe('all');
    expect(component.balance()?.netBalance).toBe(280000); // 140000 * 2
  });

  it('allows selecting a single route and aggregates its specific balance', async () => {
    const fixture = TestBed.createComponent(RouteFinancePage);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    await component.selectRoute('route-1');
    expect(component.selectedRouteId()).toBe('route-1');
    expect(component.isSingleRouteSelected()).toBe(true);
    expect(component.balance()?.netBalance).toBe(140000);
    expect(component.currentSingleRoute()?.name).toBe('Ruta Centro');
  });

  it('supports multi-select route mode', async () => {
    const fixture = TestBed.createComponent(RouteFinancePage);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.toggleMultiSelect();
    expect(component.isMultiSelectActive()).toBe(true);

    component.toggleRouteInMulti('route-2'); // unselect route-2
    expect(component.isRouteInMulti('route-2')).toBe(false);
    expect(component.activeSelectedRoutes()).toHaveLength(1);
    await component.reload();
    expect(component.balance()?.netBalance).toBe(140000);
  });

  it('filters movements by tabs (income vs expense vs all)', async () => {
    const fixture = TestBed.createComponent(RouteFinancePage);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.setPeriod('all');
    component.setTab('income');
    expect(component.tabMovements().every((m) => m.section === 'income')).toBe(true);

    component.setTab('expense');
    expect(component.tabMovements().every((m) => m.section === 'expense')).toBe(true);

    component.setTab('all');
    expect(component.tabMovements().length).toBeGreaterThan(0);
  });

  it('paginates table results correctly', async () => {
    const fixture = TestBed.createComponent(RouteFinancePage);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.setPeriod('all');
    component.setTab('all');
    component.setPageSize(1);
    expect(component.pageSize()).toBe(1);
    expect(component.totalPages()).toBeGreaterThan(1);
    expect(component.paginatedMovements()).toHaveLength(1);

    component.nextPage();
    expect(component.currentPage()).toBe(2);

    component.prevPage();
    expect(component.currentPage()).toBe(1);
  });

  it('opens modal, creates a new entry and reloads', async () => {
    const fixture = TestBed.createComponent(RouteFinancePage);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    financesServiceMock.create.mockResolvedValue({ id: 'new-1' });

    component.openCreateModal('Income');
    expect(component.isModalOpen()).toBe(true);

    component.modalForm.patchValue({
      routeId: 'route-1',
      type: 'Income',
      concept: 'Nuevo capital',
      description: 'Aporte socios',
      amount: 15000,
    });

    await component.submitModal();
    expect(financesServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        routeId: 'route-1',
        concept: 'Nuevo capital',
        amount: 15000,
      })
    );
    expect(component.isModalOpen()).toBe(false);
  });
});
