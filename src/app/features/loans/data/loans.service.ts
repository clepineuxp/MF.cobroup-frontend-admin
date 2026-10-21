import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { LoanDetails, LoanSearchResponse } from './loan.models';

@Injectable({ providedIn: 'root' })
export class LoansService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async search(
    routeId?: string,
    customerId?: string,
    status?: string,
    page = 1,
    pageSize = 25
  ): Promise<LoanSearchResponse> {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (routeId) params.append('routeId', routeId);
    if (customerId) params.append('customerId', customerId);
    if (status) params.append('status', status);

    const response = await this.auth.authorizedFetch(
      `${this.config.identityBaseUrl}/api/v1/loans?${params.toString()}`
    );
    if (!response.ok) throw new Error('No fue posible consultar los préstamos.');
    return (await response.json()) as LoanSearchResponse;
  }

  async get(id: string): Promise<LoanDetails> {
    const response = await this.auth.authorizedFetch(
      `${this.config.identityBaseUrl}/api/v1/loans/${id}`
    );
    if (!response.ok) throw new Error('No fue posible consultar el préstamo.');
    return (await response.json()) as LoanDetails;
  }

  async listByCustomer(customerId: string): Promise<readonly LoanDetails[]> {
    const response = await this.auth.authorizedFetch(
      `${this.config.identityBaseUrl}/api/v1/loans/by-customer/${customerId}`
    );
    if (!response.ok) throw new Error('No fue posible consultar los préstamos del cliente.');
    return (await response.json()) as readonly LoanDetails[];
  }
}
