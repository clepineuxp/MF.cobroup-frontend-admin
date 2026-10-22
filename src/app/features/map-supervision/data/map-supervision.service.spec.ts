import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { MapSupervisionService, AdminMapLocation } from './map-supervision.service';

describe('Admin MapSupervisionService', () => {
  let service: MapSupervisionService;
  const authService = {
    authorizedFetch: vi.fn(),
  };

  const sampleLocations: AdminMapLocation[] = [
    {
      customerId: 'cust-1',
      customerName: 'Juan Pérez',
      businessOrWorkName: 'Ferretería El Tornillo',
      primaryPhone: '3001234567',
      routeId: 'route-north',
      latitude: 4.60971,
      longitude: -74.08175,
      address: 'Calle 10 # 5-20',
      alias: 'El Paisa',
      activeLoanId: 'loan-1',
      loanBalance: 150000,
      overdueAmount: 50000,
      dueTodayAmount: 15000,
      status: 'Atrasado',
      markerColor: '#ef4444',
    },
    {
      customerId: 'cust-2',
      customerName: 'María Gómez',
      businessOrWorkName: 'Panadería Central',
      primaryPhone: '3109876543',
      routeId: 'route-north',
      latitude: 4.61500,
      longitude: -74.08500,
      address: 'Carrera 7 # 12-40',
      alias: 'Doña Mari',
      activeLoanId: 'loan-2',
      loanBalance: 80000,
      overdueAmount: 0,
      dueTodayAmount: 10000,
      status: 'Al día',
      markerColor: '#22c55e',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MapSupervisionService,
        { provide: AuthService, useValue: authService },
        { provide: AUTH_CONFIG, useValue: { identityBaseUrl: '/identity' } },
      ],
    });

    service = TestBed.inject(MapSupervisionService);
  });

  it('getRouteLocations fetches locations without filters', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleLocations,
    });

    const result = await service.getRouteLocations();

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/map/route-locations');
    expect(result.length).toBe(2);
    expect(result[0].customerName).toBe('Juan Pérez');
    expect(result[0].markerColor).toBe('#ef4444');
  });

  it('getRouteLocations includes query params when filtering by route and date', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [sampleLocations[0]],
    });

    const result = await service.getRouteLocations('route-north', '2026-10-21');

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/map/route-locations?routeId=route-north&targetDate=2026-10-21');
    expect(result.length).toBe(1);
    expect(result[0].customerId).toBe('cust-1');
  });

  it('throws descriptive error on HTTP failure', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Error al consultar mapa de supervisión' }),
    });

    await expect(service.getRouteLocations()).rejects.toThrow('Error al consultar mapa de supervisión');
  });
});
