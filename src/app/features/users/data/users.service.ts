import { Injectable, inject } from '@angular/core';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { AuthService } from '../../../core/auth/auth.service';
import { CreateUserRequest, OrganizationUser, UpdateUserRequest } from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly auth = inject(AuthService);
  private readonly endpoint = `${inject(AUTH_CONFIG).identityBaseUrl}/api/v1/users`;

  async list(signal?: AbortSignal): Promise<readonly OrganizationUser[]> {
    const response = await this.auth.authorizedFetch(this.endpoint, { signal });
    if (!response.ok) throw new Error('No fue posible consultar los usuarios de la organización.');
    return response.json() as Promise<OrganizationUser[]>;
  }

  async create(input: CreateUserRequest): Promise<OrganizationUser> {
    const context = this.auth.context();
    if (!context) throw new Error('La sesión administrativa no está disponible.');
    const response = await this.auth.authorizedFetch(this.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Cobroup-Expected-Organization': context.organizationId }, body: JSON.stringify(input),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(result?.message ?? (response.status === 403
        ? 'Tu sesión no tiene permisos para crear usuarios.' : 'No fue posible crear el usuario.'));
    }
    return response.json() as Promise<OrganizationUser>;
  }

  async update(id: string, input: UpdateUserRequest): Promise<OrganizationUser> {
    const context = this.auth.context();
    if (!context) throw new Error('La sesión administrativa no está disponible.');
    const response = await this.auth.authorizedFetch(`${this.endpoint}/${encodeURIComponent(id)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Cobroup-Expected-Organization': context.organizationId },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(result?.message ?? 'No fue posible actualizar el usuario.');
    }
    return response.json() as Promise<OrganizationUser>;
  }
}
