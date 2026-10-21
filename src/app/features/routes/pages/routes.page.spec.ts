import { TestBed } from '@angular/core/testing';
import { RoutesService } from '../data/routes.service';
import { RoutesPage } from './routes.page';

describe('RoutesPage', () => {
  const service = {
    list: vi.fn().mockResolvedValue([{
      id: 'route-1', name: 'Centro', description: 'Principal', status: 'Active',
      supervisor: { id: 'supervisor-1', username: 'supervisor', displayName: 'Supervisor' },
      collectors: [{ id: 'collector-1', username: 'collector', displayName: 'Cobrador' }],
      maxActiveCustomers: { mode: 'Inherited', overrideValue: null, effectiveValue: 100 },
      maxActiveLoans: { mode: 'Overridden', overrideValue: 50, effectiveValue: 50 },
      createdAtUtc: new Date().toISOString(), updatedAtUtc: new Date().toISOString(),
    }]),
    listAssignableUsers: vi.fn().mockResolvedValue([
      { id: 'supervisor-1', username: 'supervisor', displayName: 'Supervisor', role: 'Supervisor' },
      { id: 'collector-1', username: 'collector', displayName: 'Cobrador', role: 'Collector' },
    ]),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [RoutesPage],
      providers: [{ provide: RoutesService, useValue: service }],
    }).compileComponents();
  });

  it('renders tenant routes and effective limits', async () => {
    const fixture = TestBed.createComponent(RoutesPage);
    await fixture.whenStable(); fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Centro');
    expect(fixture.nativeElement.textContent).toContain('100');
    expect(fixture.nativeElement.textContent).toContain('50');
  });

  it('updates an existing route with selected assignments', async () => {
    const fixture = TestBed.createComponent(RoutesPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.edit(page.routes()[0]);

    await page.submit();

    expect(service.update).toHaveBeenCalledWith('route-1', expect.objectContaining({
      supervisorUserId: 'supervisor-1', collectorUserIds: ['collector-1'], status: 'Active',
    }));
  });
});
