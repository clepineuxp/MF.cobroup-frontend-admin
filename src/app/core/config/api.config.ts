import { InjectionToken } from '@angular/core';

export interface ApiConfig { readonly baseUrl: string; }

export const API_CONFIG = new InjectionToken<ApiConfig>('COBROUP_ADMIN_API_CONFIG', {
  providedIn: 'root',
  factory: () => ({ baseUrl: '/api/admin/v1' }),
});
