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
});
