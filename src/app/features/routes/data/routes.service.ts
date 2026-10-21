import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { AssignableUser, CollectionRoute, CreateRouteRequest, UpdateRouteRequest } from './route.models';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async list(): Promise<readonly CollectionRoute[]> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/routes`);
    if (!response.ok) throw new Error('No fue posible consultar las rutas.');
    return (await response.json()) as CollectionRoute[];
  }

  async listAssignableUsers(): Promise<readonly AssignableUser[]> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/users/assignable`);
    if (!response.ok) throw new Error('No fue posible consultar los usuarios asignables.');
    return (await response.json()) as AssignableUser[];
  }

  async create(request: CreateRouteRequest): Promise<void> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (response.ok) return;
    const problem = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(problem?.message ?? 'No fue posible crear la ruta.');
  }

  async update(routeId: string, request: UpdateRouteRequest): Promise<void> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/routes/${routeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (response.ok) return;
    const problem = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(problem?.message ?? 'No fue posible actualizar la ruta.');
  }
}
