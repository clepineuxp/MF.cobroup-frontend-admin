import { InjectionToken } from '@angular/core';

export interface AuthConfig { readonly clientId: string; readonly identityBaseUrl: string; readonly contextEndpoint: string; }

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('COBROUP_AUTH_CONFIG', {
  providedIn: 'root',
  factory: () => ({ clientId: 'cobroup-admin-spa', identityBaseUrl: '/identity', contextEndpoint: '/identity/api/v1/auth/me' }),
});
