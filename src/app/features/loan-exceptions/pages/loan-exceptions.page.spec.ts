import { TestBed } from '@angular/core/testing';
import { LoanExceptionsService } from '../data/loan-exceptions.service';
import { LoanExceptionsPage } from './loan-exceptions.page';

describe('LoanExceptionsPage', () => {
  const service = {
    search: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'exc-1',
          customerId: 'cust-1',
          customerName: 'Carlos Gómez',
          routeId: 'route-1',
          proposedAmount: 50000,
          proposedDays: 20,
          proposedPercentage: 15,
          reason: 'Cliente VIP',
          status: 'Pending',
          createdByUserId: 'user-1',
          createdByRole: 'Collector',
          createdAtUtc: new Date().toISOString(),
        },
      ],
      page: 1,
      pageSize: 25,
      totalCount: 1,
    }),
    applyDecision: vi.fn().mockResolvedValue({
      id: 'exc-1',
      status: 'Approved',
    }),
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoanExceptionsPage],
      providers: [{ provide: LoanExceptionsService, useValue: service }],
    }).compileComponents();
  });

  it('renders pending loan exceptions with customer name and proposed terms', async () => {
    const fixture = TestBed.createComponent(LoanExceptionsPage);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carlos Gómez');
    expect(fixture.nativeElement.textContent).toContain('Cliente VIP');
    expect(fixture.nativeElement.textContent).toContain('Pendiente');
  });

  it('allows admin to approve a pending loan exception', async () => {
    const fixture = TestBed.createComponent(LoanExceptionsPage);
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    const item = page.items()[0];

    page.openDecisionModal(item, 'Approved');
    page.decisionNotes.set('Aprobado por buen historial');

    await page.confirmDecision();

    expect(service.applyDecision).toHaveBeenCalledWith('exc-1', {
      decision: 'Approved',
      decisionNotes: 'Aprobado por buen historial',
    });
  });
});
