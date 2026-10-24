import { TestBed } from '@angular/core/testing';
import { LoanTemplatesPage } from './loan-templates.page';
import { LoanTemplatesService } from '../data/loan-templates.service';
import { RoutesService } from '../../routes/data/routes.service';

describe('LoanTemplatesPage ranges and routes', () => {
  const templates = { list: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue(undefined), update: vi.fn(), get: vi.fn() };
  const routes = { list: vi.fn().mockResolvedValue([{ id: 'r-1', name: 'Centro', status: 'Active' }]) };
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function(this: HTMLDialogElement) { this.setAttribute('open', ''); } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function(this: HTMLDialogElement) { this.removeAttribute('open'); } });
  });
  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoanTemplatesPage],
      providers: [{ provide: LoanTemplatesService, useValue: templates }, { provide: RoutesService, useValue: routes }],
    }).compileComponents();
  });
  it('sends amount and interest bounds with selected routes', async () => {
    const fixture = TestBed.createComponent(LoanTemplatesPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.form.setValue({ name: 'Diario', description: '', classification: 'Low', status: 'Published', maxLoanDays: 30,
      minPrincipalAmount: 100000, maxPrincipalAmount: 1000000, minPercentage: 10, maxPercentage: 20, routeIds: ['r-1'] });
    await page.submit();
    expect(templates.create).toHaveBeenCalledWith(expect.objectContaining({
      minPrincipalAmount: 100000, maxPrincipalAmount: 1000000, minPercentage: 10, maxPercentage: 20, routeIds: ['r-1'],
    }));
  });
  it('rejects inverted bounds without submitting', async () => {
    const page = TestBed.createComponent(LoanTemplatesPage).componentInstance;
    page.form.patchValue({ name: 'Diario', minPrincipalAmount: 200, maxPrincipalAmount: 100, minPercentage: 10, maxPercentage: 20 });
    await page.submit();
    expect(templates.create).not.toHaveBeenCalled();
    expect(page.error()).toContain('mínimos');
    page.form.patchValue({ minPrincipalAmount: 50, minPercentage: 21 });
    await page.submit();
    expect(templates.create).not.toHaveBeenCalled();
  });
  it('renders separate limits and the route selector', async () => {
    const fixture = TestBed.createComponent(LoanTemplatesPage);
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentInstance.openCreate(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[formControlName="minPrincipalAmount"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[formControlName="minPercentage"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[formControlName="maxPercentage"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('select[multiple]').textContent).toContain('Centro');
  });
  it('does not resurrect an edit after closing while details are loading', async () => {
    const fixture = TestBed.createComponent(LoanTemplatesPage); await fixture.whenStable();
    const page = fixture.componentInstance;
    const item = { id: 't-1', name: 'Diario' } as Parameters<LoanTemplatesPage['edit']>[0];
    let finish!: (value: typeof item) => void;
    templates.get.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const pending = page.edit(item); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('dialog').textContent).toContain('Cargando plantilla');
    page.closeEditor(); page.openCreate(); finish(item); await pending; await fixture.whenStable();
    expect(page.editingId()).toBeNull(); expect(page.form.controls.name.value).toBe('');
    expect(page.editorLoading()).toBe(false);
  });
});
