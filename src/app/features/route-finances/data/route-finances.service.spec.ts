import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { RouteFinancesService } from './route-finances.service';

describe('RouteFinancesService', () => {
  const auth = { authorizedFetch: vi.fn() };
  let service: RouteFinancesService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [
      RouteFinancesService,
      { provide: AuthService, useValue: auth },
      { provide: AUTH_CONFIG, useValue: { identityBaseUrl: '/identity' } },
    ] });
    service = TestBed.inject(RouteFinancesService);
  });

  it('uses the administrative finance proxy', async () => {
    auth.authorizedFetch.mockResolvedValue(new Response(JSON.stringify([{ id: 'entry-1' }]), { status: 200 }));
    const entries = await service.listEntries('route-1', 'all');
    expect(auth.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/route-finances/entries?routeId=route-1&section=all');
    expect(entries).toHaveLength(1);
  });

  it('allows administrators to update historical entries through the proxy', async () => {
    auth.authorizedFetch.mockResolvedValue(new Response(JSON.stringify({ id: 'entry-1' }), { status: 200 }));
    await service.update('entry-1', { routeId: 'route-1', type: 'Expense', concept: 'Gasolina', description: null, amount: 25 });
    expect(auth.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/route-finances/entries/entry-1', expect.objectContaining({ method: 'PUT' }));
  });
});
