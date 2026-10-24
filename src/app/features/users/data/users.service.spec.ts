import { TestBed } from '@angular/core/testing';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { AuthService } from '../../../core/auth/auth.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const authorizedFetch = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({ providers: [
      { provide: AUTH_CONFIG, useValue: { identityBaseUrl: '/identity' } },
      { provide: AuthService, useValue: { authorizedFetch, context: () => ({ organizationId: 'org-1' }) } },
    ] });
  });

  it('pins submission to the displayed organization without using it to select the tenant', async () => {
    const input = { username: 'ana', displayName: 'Ana', phoneNumber: '+573001234567', password: 'private-password-test', role: 'Collector' as const };
    authorizedFetch.mockResolvedValue(new Response(JSON.stringify({ id: 'ana', username: 'ana' }), { status: 201 }));
    await TestBed.inject(UsersService).create(input);
    const [endpoint, options] = authorizedFetch.mock.calls[0];
    expect(endpoint).toBe('/identity/api/v1/users');
    expect(options.headers['X-Cobroup-Expected-Organization']).toBe('org-1');
    expect(JSON.parse(options.body)).toEqual(input);
    expect(JSON.parse(options.body)).not.toHaveProperty('organizationId');
  });

  it('surfaces a conflict instead of reporting success or retrying with another account', async () => {
    authorizedFetch.mockResolvedValue(new Response(JSON.stringify({ message: 'El nombre de usuario no está disponible.' }), { status: 409 }));
    await expect(TestBed.inject(UsersService).create({ username: 'ana', displayName: 'Ana', phoneNumber: '+573001234567', password: 'private-password-test', role: 'Supervisor' }))
      .rejects.toThrow('El nombre de usuario no está disponible.');
    expect(authorizedFetch).toHaveBeenCalledTimes(1);
  });
});
