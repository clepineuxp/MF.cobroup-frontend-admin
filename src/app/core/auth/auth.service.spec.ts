import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';

describe('Admin AuthService Antiforgery and Refresh', () => {
  let service: AuthService;
  let mockRouter: { navigateByUrl: ReturnType<typeof vi.fn> };
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRouter = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        {
          provide: AUTH_CONFIG,
          useValue: {
            clientId: 'cobroup-admin-spa',
            identityBaseUrl: '/identity',
            contextEndpoint: '/identity/api/v1/auth/me',
          },
        },
      ],
    });
  });

  it('fetches antiforgery token with credentials include and Cache-Control no-store', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requestToken: 'admin-antiforgery-token' }),
    });

    service = TestBed.inject(AuthService);
    const token = await service.ensureAntiforgeryToken();

    expect(token).toBe('admin-antiforgery-token');
    expect(fetchSpy).toHaveBeenCalledWith('/identity/api/v1/auth/antiforgery', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
      headers: { 'Cache-Control': 'no-store' },
    }));
  });

  it('sends X-XSRF-TOKEN on refresh request', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requestToken: 'csrf-admin-123' }),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'admin-jwt-access' }),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 'admin-1', organizationId: 'org-1' }),
    });

    service = TestBed.inject(AuthService);
    const refreshed = await service.refreshAccessToken();

    expect(refreshed).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith('/identity/api/v1/auth/refresh', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({
        'X-XSRF-TOKEN': 'csrf-admin-123',
      }),
    }));
  });

  it('deduplicates concurrent refresh calls into a single in-flight request', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requestToken: 'csrf-dedup-admin' }),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'jwt-single-flight-admin' }),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 'admin-1' }),
    });

    service = TestBed.inject(AuthService);
    const [res1, res2] = await Promise.all([
      service.refreshAccessToken(),
      service.refreshAccessToken(),
    ]);

    expect(res1).toBe(true);
    expect(res2).toBe(true);
    const refreshCalls = fetchSpy.mock.calls.filter((c: unknown[]) => c[0] === '/identity/api/v1/auth/refresh');
    expect(refreshCalls.length).toBe(1);
  });

  it('sends X-XSRF-TOKEN on logout', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requestToken: 'csrf-logout-admin' }),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
    });

    service = TestBed.inject(AuthService);
    await service.logout();

    expect(fetchSpy).toHaveBeenCalledWith('/identity/api/v1/auth/logout', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({
        'X-XSRF-TOKEN': 'csrf-logout-admin',
      }),
    }));
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
