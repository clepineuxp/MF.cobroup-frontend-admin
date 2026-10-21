import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { LoansService } from './loans.service';

describe('Admin LoansService', () => {
  let service: LoansService;
  const authService = {
    authorizedFetch: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        LoansService,
        { provide: AuthService, useValue: authService },
        { provide: AUTH_CONFIG, useValue: { identityBaseUrl: 'http://admin-api.test' } },
      ],
    });

    service = TestBed.inject(LoansService);
  });

  it('search sends query parameters correctly', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], page: 1, pageSize: 25, totalCount: 0 }),
    });

    const result = await service.search('route-1', 'cust-1', 'Active', 1, 10);

    expect(authService.authorizedFetch).toHaveBeenCalledWith(
      'http://admin-api.test/api/v1/loans?page=1&pageSize=10&routeId=route-1&customerId=cust-1&status=Active'
    );
    expect(result.totalCount).toBe(0);
  });

  it('get fetches loan details by id', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'loan-1', principalAmount: 1000 }),
    });

    const result = await service.get('loan-1');

    expect(authService.authorizedFetch).toHaveBeenCalledWith('http://admin-api.test/api/v1/loans/loan-1');
    expect(result.id).toBe('loan-1');
  });

  it('listByCustomer fetches loans for a customer', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'loan-1', principalAmount: 1000 }],
    });

    const result = await service.listByCustomer('cust-1');

    expect(authService.authorizedFetch).toHaveBeenCalledWith('http://admin-api.test/api/v1/loans/by-customer/cust-1');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('loan-1');
  });
});
