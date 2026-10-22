import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { PaymentMethodsService } from './payment-methods.service';

describe('Admin PaymentMethodsService', () => {
  let service: PaymentMethodsService;
  const authService = {
    authorizedFetch: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        PaymentMethodsService,
        { provide: AuthService, useValue: authService },
        { provide: AUTH_CONFIG, useValue: { identityBaseUrl: '/identity' } },
      ],
    });

    service = TestBed.inject(PaymentMethodsService);
  });

  it('list calls /api/v1/payment-methods', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'pm-1', name: 'Efectivo', displayOrder: 1, isActive: true }],
    });

    const result = await service.list();

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/payment-methods');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Efectivo');
  });

  it('create posts payment method payload', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'pm-2', name: 'Transferencia', displayOrder: 2, isActive: true }),
    });

    const result = await service.create({ name: 'Transferencia', displayOrder: 2 });

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Transferencia', displayOrder: 2 }),
    });
    expect(result.id).toBe('pm-2');
  });

  it('toggleStatus posts new active status', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'pm-1', isActive: false }),
    });

    const result = await service.toggleStatus('pm-1', false);

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/payment-methods/pm-1/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    });
    expect(result.isActive).toBe(false);
  });
});
