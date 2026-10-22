import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';

export interface AdminMapLocation {
  customerId: string;
  customerName: string;
  businessOrWorkName: string | null;
  primaryPhone: string | null;
  routeId: string;
  latitude: number;
  longitude: number;
  address: string | null;
  alias: string | null;
  activeLoanId: string | null;
  loanBalance: number;
  overdueAmount: number;
  dueTodayAmount: number;
  status: string;
  markerColor: string;
}

@Injectable({ providedIn: 'root' })
export class MapSupervisionService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async getRouteLocations(routeId?: string, targetDate?: string): Promise<readonly AdminMapLocation[]> {
    const query = new URLSearchParams();
    if (routeId) query.set('routeId', routeId);
    if (targetDate) query.set('targetDate', targetDate);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/map/route-locations${queryString}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar las ubicaciones en el mapa.'));
    return (await response.json()) as readonly AdminMapLocation[];
  }

  private async message(response: Response, fallback: string): Promise<string> {
    try {
      const data = await response.json();
      return data?.detail ?? data?.title ?? data?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
}
