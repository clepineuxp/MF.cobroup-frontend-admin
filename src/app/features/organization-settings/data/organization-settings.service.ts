import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { OrganizationSettings, OrganizationSettingsResponse, UpdateOrganizationSettingsRequest } from './organization-settings.models';

@Injectable({ providedIn: 'root' })
export class OrganizationSettingsService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);
  private readonly endpoint = `${this.config.identityBaseUrl}/api/v1/organization-settings`;

  async get(): Promise<OrganizationSettingsResponse> {
    const response = await this.auth.authorizedFetch(this.endpoint);
    if (!response.ok) throw new Error('No fue posible consultar la configuración de la organización.');
    return (await response.json()) as OrganizationSettingsResponse;
  }

  async update(request: UpdateOrganizationSettingsRequest): Promise<OrganizationSettings> {
    const response = await this.auth.authorizedFetch(this.endpoint, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(problem?.message ?? 'No fue posible guardar la configuración.');
    }
    return (await response.json()) as OrganizationSettings;
  }
}
