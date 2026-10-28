import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';

export interface PendingMachineOtp { readonly requestId: string; readonly routeId: string; readonly userId: string; readonly userDisplayName?: string; readonly machineId: string; readonly createdAtUtc: string; readonly expiresAtUtc: string; }
export interface MachineAuthorization { readonly id: string; readonly routeId: string; readonly userId: string; readonly userDisplayName?: string; readonly machineId: string; readonly authorizedUntilUtc: string | null; readonly indefinite: boolean; readonly status: string; }
export interface MachineAuthorizationPage { readonly items: readonly MachineAuthorization[]; readonly total: number; readonly page: number; readonly pageSize: number; }
@Injectable({ providedIn: 'root' })
export class MachineAuthService {
  private readonly auth = inject(AuthService); private readonly config = inject(AUTH_CONFIG); private get base(): string { return `${this.config.identityBaseUrl}/api/v1/machine-auth`; }
  async pending(routeId?: string): Promise<readonly PendingMachineOtp[]> { const response = await this.auth.authorizedFetch(`${this.base}/pending${routeId ? `?routeId=${routeId}` : ''}`); if (!response.ok) throw new Error('No fue posible consultar solicitudes.'); return await response.json(); }
  async list(filters: { routeId?: string; role?: 'Supervisor' | 'Collector'; userId?: string; page?: number; pageSize?: number }): Promise<MachineAuthorizationPage> { const query = new URLSearchParams(); if (filters.routeId) query.set('routeId', filters.routeId); if (filters.role) query.set('role', filters.role); if (filters.userId) query.set('userId', filters.userId); query.set('page', String(filters.page ?? 1)); query.set('pageSize', String(filters.pageSize ?? 20)); const response = await this.auth.authorizedFetch(`${this.base}/authorizations?${query}`); if (!response.ok) throw new Error('No fue posible consultar dispositivos.'); return await response.json() as MachineAuthorizationPage; }
  async cancel(requestId: string): Promise<void> { const response = await this.auth.authorizedFetch(`${this.base}/pending/${requestId}/cancel`, { method: 'POST' }); if (!response.ok) throw new Error('No fue posible cancelar el OTP.'); }
  async approve(requestId: string, otp: string, days: number | null, indefinite: boolean): Promise<void> { const response = await this.auth.authorizedFetch(`${this.base}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, otp, days, indefinite }) }); if (!response.ok) throw new Error('OTP inválido o expirado.'); }
  async revoke(id: string): Promise<void> { const response = await this.auth.authorizedFetch(`${this.base}/${id}/revoke`, { method: 'POST' }); if (!response.ok) throw new Error('No fue posible revocar el dispositivo.'); }
}
