import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import {
  CreateNonPaymentReasonRequest,
  CreatePaymentMethodRequest,
  NonPaymentReasonItem,
  PaymentMethodItem,
  UpdateNonPaymentReasonRequest,
  UpdatePaymentMethodRequest,
} from './payment-method.models';

@Injectable({ providedIn: 'root' })
export class PaymentMethodsService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async list(): Promise<readonly PaymentMethodItem[]> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/payment-methods`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar los medios de pago.'));
    return (await response.json()) as readonly PaymentMethodItem[];
  }

  async get(id: string): Promise<PaymentMethodItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/payment-methods/${id}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar el medio de pago.'));
    return (await response.json()) as PaymentMethodItem;
  }

  async create(request: CreatePaymentMethodRequest): Promise<PaymentMethodItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible crear el medio de pago.'));
    return (await response.json()) as PaymentMethodItem;
  }

  async update(id: string, request: UpdatePaymentMethodRequest): Promise<PaymentMethodItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/payment-methods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible actualizar el medio de pago.'));
    return (await response.json()) as PaymentMethodItem;
  }

  async toggleStatus(id: string, isActive: boolean): Promise<PaymentMethodItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/payment-methods/${id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible cambiar el estado del medio de pago.'));
    return (await response.json()) as PaymentMethodItem;
  }

  async delete(id: string): Promise<void> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/payment-methods/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible eliminar el medio de pago.'));
  }

  async listReasons(includeInactive = true): Promise<readonly NonPaymentReasonItem[]> {
    const response = await this.auth.authorizedFetch(
      `${this.config.identityBaseUrl}/api/v1/non-payment-reasons?includeInactive=${includeInactive}`
    );
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar los motivos de no pago.'));
    return (await response.json()) as readonly NonPaymentReasonItem[];
  }

  async createReason(request: CreateNonPaymentReasonRequest): Promise<NonPaymentReasonItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/non-payment-reasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible crear el motivo de no pago.'));
    return (await response.json()) as NonPaymentReasonItem;
  }

  async updateReason(id: string, request: UpdateNonPaymentReasonRequest): Promise<NonPaymentReasonItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/non-payment-reasons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible actualizar el motivo de no pago.'));
    return (await response.json()) as NonPaymentReasonItem;
  }

  async toggleReasonStatus(id: string, isActive: boolean): Promise<NonPaymentReasonItem> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/non-payment-reasons/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible cambiar el estado del motivo de no pago.'));
    return (await response.json()) as NonPaymentReasonItem;
  }

  async deleteReason(id: string): Promise<void> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/non-payment-reasons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible eliminar el motivo de no pago.'));
  }

  private async message(response: Response, fallback: string): Promise<string> {
    if (response.status === 403) return 'No tienes permisos de Administrador para gestionar estos parámetros.';
    if (response.status === 409) {
      const detail = (await response.json().catch(() => null)) as { error?: string } | null;
      return detail?.error ?? 'Ya existe un registro con este nombre en la organización.';
    }
    const detail = (await response.json().catch(() => null)) as { error?: string; message?: string; detail?: string } | null;
    return detail?.error ?? detail?.message ?? detail?.detail ?? fallback;
  }
}
