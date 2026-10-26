export type AssignmentRole = 'Supervisor' | 'Collector';

export interface AssignableUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly role: AssignmentRole;
}

export interface RouteUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
}

export interface CollectionRoute {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: 'Active' | 'Inactive';
  readonly supervisor: RouteUser;
  readonly collectors: readonly RouteUser[];
  readonly maxActiveCustomers: RouteLimit;
  readonly maxActiveLoans: RouteLimit;
  readonly initialBalance: number;
  readonly timeZoneId?: string | null;
  readonly resolvedTimeZoneId?: string | null;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
}

export type RouteSettingMode = 'Inherited' | 'Overridden';

export interface RouteLimit {
  readonly mode: RouteSettingMode;
  readonly overrideValue: number | null;
  readonly effectiveValue: number | null;
}

export interface CreateRouteRequest {
  readonly name: string;
  readonly description: string | null;
  readonly supervisorUserId: string;
  readonly collectorUserIds: readonly string[];
  readonly maxActiveCustomersMode: RouteSettingMode;
  readonly maxActiveCustomersOverride: number | null;
  readonly maxActiveLoansMode: RouteSettingMode;
  readonly maxActiveLoansOverride: number | null;
  readonly initialBalance: number;
  readonly timeZoneId?: string | null;
}

export interface UpdateRouteRequest extends CreateRouteRequest {
  readonly status: 'Active' | 'Inactive';
}
