import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { ApplyDecisionRequest, LoanExceptionItem, LoanExceptionSearchResponse } from './loan-exception.models';

@Injectable({ providedIn: 'root' })
export class LoanExceptionsService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async search(status?: string, page = 1, pageSize = 25): Promise<LoanExceptionSearchResponse> {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (status) params.append('status', status);

    const response = await this.auth.authorizedFetch(
      `${this.config.identityBaseUrl}/api/v1/loan-exceptions?${params.toString()}`
    );
    if (!response.ok) throw new Error('No fue posible consultar las solicitudes de excepción.');
    return (await response.json()) as LoanExceptionSearchResponse;
  }

  async applyDecision(id: string, request: ApplyDecisionRequest): Promise<LoanExceptionItem> {
    const response = await this.auth.authorizedFetch(
      `${this.config.identityBaseUrl}/api/v1/loan-exceptions/${id}/decision`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) {
      const problem = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(problem?.message ?? 'No fue posible registrar la decisión de la excepción.');
    }
    return (await response.json()) as LoanExceptionItem;
  }
}
