import { Injectable, inject } from '@angular/core';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { AuthService } from '../../../core/auth/auth.service';
import { CustomerDetails, CustomerPage, CustomerWriteRequest } from './customer.models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async search(routeId: string, search: string): Promise<CustomerPage> {
    const query = new URLSearchParams({ page: '1', pageSize: '50' });
    if (routeId) query.set('routeId', routeId);
    if (search.trim()) query.set('search', search.trim());
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/customers?${query}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar los clientes.'));
    return (await response.json()) as CustomerPage;
  }

  async get(customerId: string): Promise<CustomerDetails> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/customers/${customerId}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar el cliente.'));
    return (await response.json()) as CustomerDetails;
  }

  async update(customerId: string, request: CustomerWriteRequest): Promise<CustomerDetails> {
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/customers/${customerId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible actualizar el cliente.'));
    return (await response.json()) as CustomerDetails;
  }

  private async message(response: Response, fallback: string): Promise<string> {
    const detail = await response.json().catch(() => null) as { message?: string } | null;
    if (response.status === 409) return detail?.message ?? 'La ruta seleccionada no tiene cupo disponible.';
    if (response.status === 503) return 'El backend operativo no está disponible temporalmente.';
    return detail?.message ?? fallback;
  }
}
