import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { PortfolioOverview } from './analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);

  async getOverview(routeId?: string, targetDate?: string): Promise<PortfolioOverview> {
    const query = new URLSearchParams();
    if (routeId) query.set('routeId', routeId);
    if (targetDate) query.set('targetDate', targetDate);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/analytics/overview${queryString}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar el resumen de analítica.'));
    return (await response.json()) as PortfolioOverview;
  }

  async getRoutesPerformance(targetDate?: string): Promise<PortfolioOverview> {
    const query = new URLSearchParams();
    if (targetDate) query.set('targetDate', targetDate);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/analytics/routes-performance${queryString}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar el rendimiento de rutas.'));
    return (await response.json()) as PortfolioOverview;
  }

  async getAging(routeId?: string, targetDate?: string): Promise<PortfolioOverview> {
    const query = new URLSearchParams();
    if (routeId) query.set('routeId', routeId);
    if (targetDate) query.set('targetDate', targetDate);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await this.auth.authorizedFetch(`${this.config.identityBaseUrl}/api/v1/analytics/aging${queryString}`);
    if (!response.ok) throw new Error(await this.message(response, 'No fue posible consultar el reporte de envejecimiento.'));
    return (await response.json()) as PortfolioOverview;
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
