import { TestBed } from '@angular/core/testing';
import { RoutesService } from '../data/routes.service';
import { LoanTemplatesService } from '../../loan-templates/data/loan-templates.service';
import { RoutesPage } from './routes.page';

describe('RoutesPage', () => {
  const service = {
    list: vi.fn().mockResolvedValue([{
      id: 'route-1', name: 'Centro', description: 'Principal', status: 'Active',
      supervisor: { id: 'supervisor-1', username: 'supervisor', displayName: 'Supervisor' },
      collectors: [{ id: 'collector-1', username: 'collector', displayName: 'Cobrador' }],
      maxActiveCustomers: { mode: 'Inherited', overrideValue: null, effectiveValue: 100 },
      maxActiveLoans: { mode: 'Overridden', overrideValue: 50, effectiveValue: 50 },
      initialBalance: 5000,
      createdAtUtc: new Date().toISOString(), updatedAtUtc: new Date().toISOString(),
    }]),
    listAssignableUsers: vi.fn().mockResolvedValue([
      { id: 'supervisor-1', username: 'supervisor', displayName: 'Supervisor', role: 'Supervisor' },
      { id: 'collector-1', username: 'collector', displayName: 'Cobrador', role: 'Collector' },
    ]),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };

  const templatesMock = {
    list: vi.fn().mockResolvedValue([
      { id: 'tpl-1', name: 'Diario Base', status: 'Published', minPrincipalAmount: 1000, maxPrincipalAmount: 50000, minPercentage: 10, maxPercentage: 20, maxLoanDays: 30, routeIds: ['route-1'] },
      { id: 'tpl-2', name: 'Flexible', status: 'Draft', minPrincipalAmount: 500, maxPrincipalAmount: 20000, minPercentage: 5, maxPercentage: 15, maxLoanDays: 60, routeIds: [] },
    ]),
  };

  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function(this: HTMLDialogElement) { this.setAttribute('open', ''); } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function(this: HTMLDialogElement) { this.removeAttribute('open'); } });
  });
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [RoutesPage],
      providers: [
        { provide: RoutesService, useValue: service },
        { provide: LoanTemplatesService, useValue: templatesMock },
      ],
    }).compileComponents();
  });

  it('renders tenant routes and effective limits', async () => {
    const fixture = TestBed.createComponent(RoutesPage);
    await fixture.whenStable(); fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Centro');
    expect(fixture.nativeElement.textContent).toContain('100');
    expect(fixture.nativeElement.textContent).toContain('50');
  });

  it('updates an existing route with selected assignments and active templates', async () => {
    const fixture = TestBed.createComponent(RoutesPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.edit(page.routes()[0]);

    expect(page.selectedTemplateIds().has('tpl-1')).toBe(true);
    expect(page.selectedTemplateIds().has('tpl-2')).toBe(false);

    // Toggle tpl-2 on
    page.toggleTemplate('tpl-2', true);
    expect(page.selectedTemplateIds().has('tpl-2')).toBe(true);

    await page.submit();

    expect(service.update).toHaveBeenCalledWith('route-1', expect.objectContaining({
      supervisorUserId: 'supervisor-1',
      collectorUserIds: ['collector-1'],
      status: 'Active',
      activeTemplateIds: expect.arrayContaining(['tpl-1', 'tpl-2']),
    }));
  });

  it('opens a route from its card, cancels without saving and starts a clean new route', async () => {
    const fixture = TestBed.createComponent(RoutesPage); await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('form')).toBeNull();
    root.querySelector<HTMLElement>('article')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(root.querySelector('dialog[open]')).toBeTruthy();
    expect(fixture.componentInstance.form.controls.name.value).toBe('Centro');
    fixture.componentInstance.closeEditor(); await fixture.whenStable();
    expect(root.querySelector('form')).toBeNull(); expect(service.update).not.toHaveBeenCalled();
    root.querySelector<HTMLButtonElement>('.new-record')!.click(); await fixture.whenStable();
    expect(fixture.componentInstance.editingRouteId()).toBeNull();
    expect(fixture.componentInstance.selectedCollectorIds().size).toBe(0);
    expect(fixture.componentInstance.selectedTemplateIds().size).toBe(0);
  });

  it('blocks closing and duplicate saves while the route request is pending', async () => {
    const fixture = TestBed.createComponent(RoutesPage); await fixture.whenStable();
    const page = fixture.componentInstance; page.edit(page.routes()[0]);
    let finish!: () => void;
    service.update.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
    const pending = page.submit(); page.closeEditor(); await page.submit();
    expect(page.editorOpen()).toBe(true); expect(service.update).toHaveBeenCalledTimes(1);
    finish(); await pending; expect(page.editorOpen()).toBe(false);
  });

  it('supports selectAllTemplates and deselectAllTemplates', async () => {
    const fixture = TestBed.createComponent(RoutesPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;

    page.selectAllTemplates();
    expect(page.selectedTemplateIds().size).toBe(2);

    page.deselectAllTemplates();
    expect(page.selectedTemplateIds().size).toBe(0);
  });
});
