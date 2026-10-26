export type RouteFinancialEntryType = 'Income' | 'Investment' | 'Expense';
export type RouteFinanceSection = 'income-investments' | 'expenses' | 'all';

export interface RouteBalance {
  readonly routeId: string; readonly routeName: string; readonly initialBalance: number;
  readonly loanDisbursements: number; readonly paymentCollections: number;
  readonly incomeInvestments: number; readonly expenses: number; readonly netBalance: number;
}

export interface RouteFinancialEntry {
  readonly id: string; readonly routeId: string; readonly type: RouteFinancialEntryType;
  readonly concept: string; readonly description: string | null; readonly amount: number;
  readonly createdByUserId: string; readonly createdByDisplayName: string; readonly createdAtUtc: string;
  readonly updatedByUserId: string; readonly updatedByDisplayName: string; readonly updatedAtUtc: string;
  readonly canEdit: boolean;
}

export interface SaveRouteFinancialEntryRequest {
  readonly routeId: string; readonly type: RouteFinancialEntryType; readonly concept: string;
  readonly description: string | null; readonly amount: number;
}

export interface RouteDayClosingStatus {
  readonly isClosed: boolean;
  readonly closedAtUtc: string | null;
  readonly closedByDisplayName: string | null;
  readonly localDate: string | null;
}

export type AuditAction = 'Created' | 'Updated' | 'Deleted';
export type AuditEntityType = 'Loan' | 'Payment' | 'RouteFinancialEntry';

export interface FinancialMovementAuditLog {
  readonly id: string;
  readonly routeId: string;
  readonly entityType: AuditEntityType;
  readonly entityId: string;
  readonly action: AuditAction;
  readonly concept: string;
  readonly details: string | null;
  readonly amount: number | null;
  readonly localTimestamp: string;
  readonly performedByUserId: string;
  readonly performedByDisplayName: string;
  readonly performedByRole: string;
}
