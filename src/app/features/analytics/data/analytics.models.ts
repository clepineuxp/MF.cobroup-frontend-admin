export interface AgingBucket {
  bucketKey: string;
  label: string;
  minDays: number;
  maxDays: number | null;
  totalAmount: number;
  loanCount: number;
}

export interface RoutePerformanceItem {
  routeId: string;
  activeLoansCount: number;
  activeCustomersCount: number;
  totalPlacedAmount: number;
  totalCollectedAmount: number;
  totalBalanceAmount: number;
  overdueBalanceAmount: number;
  portfolioAtRiskRate: number;
  agingBuckets: AgingBucket[];
}

export interface PortfolioOverview {
  targetDate: string;
  totalActiveLoans: number;
  totalActiveCustomers: number;
  totalPlacedAmount: number;
  totalCollectedAmount: number;
  totalBalanceAmount: number;
  totalOverdueAmount: number;
  portfolioAtRiskRate: number;
  dailyCollectionEfficiencyRate: number;
  agingBuckets: AgingBucket[];
  routesPerformance: RoutePerformanceItem[];
}
