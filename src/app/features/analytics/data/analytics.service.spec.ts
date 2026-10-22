import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../../core/auth/auth.config';
import { AnalyticsService } from './analytics.service';
import { PortfolioOverview } from './analytics.models';

describe('Admin AnalyticsService', () => {
  let service: AnalyticsService;
  const authService = {
    authorizedFetch: vi.fn(),
  };

  const sampleOverview: PortfolioOverview = {
    targetDate: '2026-10-21',
    totalActiveLoans: 12,
    totalActiveCustomers: 10,
    totalPlacedAmount: 5000000,
    totalCollectedAmount: 2500000,
    totalBalanceAmount: 2500000,
    totalOverdueAmount: 500000,
    portfolioAtRiskRate: 20.0,
    dailyCollectionEfficiencyRate: 92.5,
    agingBuckets: [
      { bucketKey: 'current', label: 'Al día (0 días)', minDays: 0, maxDays: 0, totalAmount: 2000000, loanCount: 10 },
      { bucketKey: 'overdue_1_7', label: '1 - 7 días', minDays: 1, maxDays: 7, totalAmount: 500000, loanCount: 2 },
    ],
    routesPerformance: [
      {
        routeId: 'route-north',
        activeLoansCount: 12,
        activeCustomersCount: 10,
        totalPlacedAmount: 5000000,
        totalCollectedAmount: 2500000,
        totalBalanceAmount: 2500000,
        overdueBalanceAmount: 500000,
        portfolioAtRiskRate: 20.0,
        agingBuckets: [],
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: AuthService, useValue: authService },
        { provide: AUTH_CONFIG, useValue: { identityBaseUrl: '/identity' } },
      ],
    });

    service = TestBed.inject(AnalyticsService);
  });

  it('getOverview calls /api/v1/analytics/overview with query params', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleOverview,
    });

    const result = await service.getOverview('route-north', '2026-10-21');

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/analytics/overview?routeId=route-north&targetDate=2026-10-21');
    expect(result.totalActiveLoans).toBe(12);
    expect(result.portfolioAtRiskRate).toBe(20.0);
    expect(result.agingBuckets.length).toBe(2);
  });

  it('getRoutesPerformance calls /api/v1/analytics/routes-performance', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleOverview,
    });

    const result = await service.getRoutesPerformance('2026-10-21');

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/analytics/routes-performance?targetDate=2026-10-21');
    expect(result.routesPerformance.length).toBe(1);
    expect(result.routesPerformance[0].routeId).toBe('route-north');
  });

  it('getAging calls /api/v1/analytics/aging', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleOverview,
    });

    const result = await service.getAging('route-north');

    expect(authService.authorizedFetch).toHaveBeenCalledWith('/identity/api/v1/analytics/aging?routeId=route-north');
    expect(result.agingBuckets.length).toBe(2);
  });

  it('throws descriptive error on failure', async () => {
    authService.authorizedFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Ruta no autorizada' }),
    });

    await expect(service.getOverview()).rejects.toThrow('Ruta no autorizada');
  });
});
