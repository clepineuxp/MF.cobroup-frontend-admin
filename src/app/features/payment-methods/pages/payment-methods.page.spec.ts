import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethodsService } from '../data/payment-methods.service';
import { PaymentMethodsPage } from './payment-methods.page';

describe('Admin PaymentMethodsPage', () => {
  let component: PaymentMethodsPage;
  let fixture: ComponentFixture<PaymentMethodsPage>;

  const paymentMethodsServiceMock = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    toggleStatus: vi.fn(),
    delete: vi.fn(),
    listReasons: vi.fn(),
    createReason: vi.fn(),
    updateReason: vi.fn(),
    toggleReasonStatus: vi.fn(),
    deleteReason: vi.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function(this: HTMLDialogElement) { this.setAttribute('open', ''); } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function(this: HTMLDialogElement) { this.removeAttribute('open'); } });
  });
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    paymentMethodsServiceMock.list.mockResolvedValue([
      {
        id: 'pm-1',
        name: 'Efectivo',
        displayOrder: 1,
        isActive: true,
        createdAtUtc: '2026-10-21T00:00:00Z',
        updatedAtUtc: '2026-10-21T00:00:00Z',
      },
      {
        id: 'pm-2',
        name: 'Transferencia Bancaria',
        displayOrder: 2,
        isActive: false,
        createdAtUtc: '2026-10-21T00:00:00Z',
        updatedAtUtc: '2026-10-21T00:00:00Z',
      },
    ]);

    paymentMethodsServiceMock.listReasons.mockResolvedValue([
      {
        id: 'r-1',
        name: 'Cliente ausente',
        description: 'No se encontraba en el domicilio',
        displayOrder: 1,
        isActive: true,
      },
    ]);

    paymentMethodsServiceMock.toggleStatus.mockResolvedValue({
      id: 'pm-2',
      name: 'Transferencia Bancaria',
      displayOrder: 2,
      isActive: true,
      createdAtUtc: '2026-10-21T00:00:00Z',
      updatedAtUtc: '2026-10-21T00:00:00Z',
    });

    paymentMethodsServiceMock.delete.mockResolvedValue(undefined);
    paymentMethodsServiceMock.createReason.mockResolvedValue({
      id: 'r-2',
      name: 'Sin dinero hoy',
      description: 'Promete pagar mañana',
      displayOrder: 2,
      isActive: true,
    });
    paymentMethodsServiceMock.deleteReason.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [PaymentMethodsPage],
      providers: [
        { provide: PaymentMethodsService, useValue: paymentMethodsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders payment methods table with items', async () => {
    await fixture.whenStable();
    expect(paymentMethodsServiceMock.list).toHaveBeenCalled();
    expect(component.items().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Efectivo');
    expect(fixture.nativeElement.textContent).toContain('Transferencia Bancaria');
  });

  it('opens create modal with correct initial state', () => {
    component.openCreate();
    expect(component.showModal()).toBe(true);
    expect(component.editingItem()).toBeNull();
    expect(component.form.controls.displayOrder.value).toBe(3);
  });

  it('toggles payment method status and updates item', async () => {
    await fixture.whenStable();
    const itemToToggle = component.items()[1]; // pm-2 (inactive)

    await component.toggleStatus(itemToToggle);
    fixture.detectChanges();

    expect(paymentMethodsServiceMock.toggleStatus).toHaveBeenCalledWith('pm-2', true);
    const updated = component.items().find((i) => i.id === 'pm-2');
    expect(updated?.isActive).toBe(true);
  });
  it('opens editing from the row and keeps status actions independent', async () => {
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('dialog')).toBeNull();
    root.querySelector<HTMLTableRowElement>('tbody tr')!.click(); await fixture.whenStable();
    expect(component.editingItem()?.name).toBe('Efectivo'); expect(root.querySelector('dialog[open]')).toBeTruthy();
    component.closeModal(); await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('tbody .btn-action')!.click(); await fixture.whenStable();
    expect(paymentMethodsServiceMock.toggleStatus).toHaveBeenCalled(); expect(component.showModal()).toBe(false);
  });
  it('preserves errors and blocks cancel while submitting', async () => {
    await fixture.whenStable(); component.openEdit(component.items()[0]);
    let fail!: (error: Error) => void;
    paymentMethodsServiceMock.update.mockImplementationOnce(() => new Promise((_, reject) => { fail = reject; }));
    const pending = component.save(); component.closeModal();
    expect(component.showModal()).toBe(true);
    fail(new Error('Nombre duplicado')); await pending; await fixture.whenStable();
    expect(component.showModal()).toBe(true);
    expect(fixture.nativeElement.querySelector('dialog [role="alert"]').textContent).toContain('duplicado');
  });

  it('switches to non-payment reasons tab and supports mini-crud operations', async () => {
    await fixture.whenStable();
    component.selectTab('non-payment-reasons');
    fixture.detectChanges();

    expect(component.activeTab()).toBe('non-payment-reasons');
    expect(fixture.nativeElement.textContent).toContain('Cliente ausente');

    component.openCreateReason();
    expect(component.showReasonModal()).toBe(true);
    component.reasonForm.setValue({
      name: 'Sin dinero hoy',
      description: 'Promete pagar mañana',
      displayOrder: 2,
    });
    await component.saveReason();
    expect(paymentMethodsServiceMock.createReason).toHaveBeenCalledWith({
      name: 'Sin dinero hoy',
      description: 'Promete pagar mañana',
      displayOrder: 2,
    });

    await component.deleteReason(component.reasons()[0]);
    expect(paymentMethodsServiceMock.deleteReason).toHaveBeenCalledWith('r-1');
  });
});
