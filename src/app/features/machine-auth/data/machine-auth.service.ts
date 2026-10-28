import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';

export interface PendingMachineOtp { readonly requestId: string; readonly routeId: string; readonly userId: string; readonly userDisplayName?: string; readonly machineId: string; readonly createdAtUtc: string; readonly expiresAtUtc: string; }
export interface MachineAuthorization { readonly id: string; readonly routeId: string; readonly userId: string; readonly userDisplayName?: string; readonly machineId: string; readonly authorizedUntilUtc: string | null; readonly indefinite: boolean; readonly status: string; }
@Injectable({ providedIn: 'root' })
export class MachineAuthService {
  private readonly auth = inject(AuthService); private readonly config = inject(AUTH_CONFIG); private get base(): string { return `${this.config.identityBaseUrl}/api/v1/machine-auth`; }
  async pending(routeId?: string): Promise<readonly PendingMachineOtp[]> { const response = await this.auth.authorizedFetch(`${this.base}/pending${routeId ? `?routeId=${routeId}` : ''}`); if (!response.ok) throw new Error('No fue posible consultar solicitudes.'); return await response.json(); }
  async list(routeId: string): Promise<readonly MachineAuthorization[]> { const response = await this.auth.authorizedFetch(`${this.base}/authorizations?routeId=${routeId}`); if (!response.ok) throw new Error('No fue posible consultar dispositivos.'); return await response.json(); }
  async approve(requestId: string, otp: string, days: number | null, indefinite: boolean): Promise<void> { const response = await this.auth.authorizedFetch(`${this.base}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, otp, days, indefinite }) }); if (!response.ok) throw new Error('OTP inválido o expirado.'); }
  async revoke(id: string): Promise<void> { const response = await this.auth.authorizedFetch(`${this.base}/${id}/revoke`, { method: 'POST' }); if (!response.ok) throw new Error('No fue posible revocar el dispositivo.'); }
}
