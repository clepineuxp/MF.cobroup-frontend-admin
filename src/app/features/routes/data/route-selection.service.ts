import { Injectable, signal } from '@angular/core';

/**
 * Servicio compartido de estado para mantener sincronizada la ruta seleccionada
 * (o "Todas las rutas" representada por '') entre todos los módulos y menús
 * de la aplicación administrativa.
 */
@Injectable({ providedIn: 'root' })
export class RouteSelectionService {
  private readonly routeIdSignal = signal<string>('');

  /**
   * ID de la ruta activa seleccionada globalmente.
   * Una cadena vacía ('') significa "Todas las rutas".
   */
  readonly selectedRouteId = this.routeIdSignal.asReadonly();

  /**
   * Actualiza la ruta seleccionada globalmente.
   * Valores como null, undefined, '' o 'all' se normalizan a '' (Todas las rutas).
   */
  setSelectedRoute(routeId: string | null | undefined): void {
    const normalized = !routeId || routeId === 'all' ? '' : routeId.trim();
    this.routeIdSignal.set(normalized);
  }

  /**
   * Restablece la selección a "Todas las rutas" ('').
   */
  clear(): void {
    this.routeIdSignal.set('');
  }

  /**
   * Verifica que la ruta seleccionada pertenezca al listado de rutas cargado
   * para la organización actual. Si no existe, restablece a "Todas las rutas" ('').
   */
  ensureValidRoute(routes: readonly { id: string }[]): string {
    const current = this.routeIdSignal();
    if (!current) {
      return '';
    }
    if (routes.length > 0 && !routes.some((r) => r.id === current)) {
      this.routeIdSignal.set('');
      return '';
    }
    return current;
  }
}
