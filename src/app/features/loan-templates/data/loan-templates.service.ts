import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { LoanTemplate, LoanTemplateRequest, RouteLoanTemplateSummary } from './loan-template.models';

@Injectable({ providedIn: 'root' })
export class LoanTemplatesService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async list(): Promise<readonly LoanTemplate[]> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/loan-templates`);
    if (!response.ok) throw new Error('No fue posible consultar las plantillas de préstamo.');
    return (await response.json()) as LoanTemplate[];
  }

  async get(templateId: string): Promise<LoanTemplate> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/loan-templates/${templateId}`);
    if (!response.ok) throw new Error('No fue posible consultar la plantilla.');
    return (await response.json()) as LoanTemplate;
  }

  async create(request: LoanTemplateRequest): Promise<void> {
    await this.save(`${this.config.identityBaseUrl}/api/v1/loan-templates`, 'POST', request);
  }

  async update(templateId: string, request: LoanTemplateRequest): Promise<void> {
    await this.save(`${this.config.identityBaseUrl}/api/v1/loan-templates/${templateId}`, 'PUT', request);
  }

  async listForRoute(routeId: string): Promise<readonly RouteLoanTemplateSummary[]> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/routes/${routeId}/loan-templates`);
    if (!response.ok) throw new Error('No fue posible consultar las plantillas de la ruta.');
    return (await response.json()) as RouteLoanTemplateSummary[];
  }

  async configureForRoute(routeId: string, activeTemplateIds: readonly string[]): Promise<readonly RouteLoanTemplateSummary[]> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/routes/${routeId}/loan-templates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeTemplateIds }),
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => null) as { detail?: string; message?: string } | null;
      throw new Error(problem?.message ?? problem?.detail ?? 'No fue posible actualizar las plantillas de la ruta.');
    }
    return (await response.json()) as RouteLoanTemplateSummary[];
  }

  private async save(url: string, method: 'POST' | 'PUT', request: LoanTemplateRequest): Promise<void> {
    const response = await this.auth.authorizedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (response.ok) return;
    const problem = await response.json().catch(() => null) as { detail?: string; message?: string; error?: string } | null;
    throw new Error(problem?.message ?? problem?.detail ?? problem?.error ?? `Error al guardar la plantilla (${response.status}: ${response.statusText || 'Error en el servidor'}).`);
  }
}
