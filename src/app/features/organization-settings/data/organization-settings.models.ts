export interface OrganizationSettings {
  readonly timeZoneId: string;
  readonly currencyCode: string;
  readonly maxActiveCustomersPerRoute: number | null;
  readonly maxActiveLoansPerRoute: number | null;
  readonly dailyClosingTimeUtc?: string | null;
  readonly enforceDailyClosingSchedule?: boolean;
  readonly updatedAtUtc: string;
}

export interface OrganizationSettingsResponse {
  readonly configured: boolean;
  readonly settings: OrganizationSettings | null;
}

export interface UpdateOrganizationSettingsRequest {
  readonly timeZoneId: string;
  readonly currencyCode: string;
  readonly maxActiveCustomersPerRoute: number | null;
  readonly maxActiveLoansPerRoute: number | null;
  readonly dailyClosingTimeUtc?: string | null;
  readonly enforceDailyClosingSchedule?: boolean;
}
