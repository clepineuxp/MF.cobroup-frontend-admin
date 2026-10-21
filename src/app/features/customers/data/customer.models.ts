export type CustomerStatus = 'Active' | 'Inactive';
export type LocationSource = 'Manual' | 'Gps';

export interface CustomerPhone { readonly id: string; readonly number: string; readonly isPrimary: boolean; }
export interface CustomerLocation { readonly id: string; readonly latitude: number; readonly longitude: number; readonly alias: string | null; readonly address: string | null; readonly isPrimary: boolean; readonly source: LocationSource; }
export interface CustomerSummary { readonly id: string; readonly routeId: string; readonly firstNames: string; readonly lastNames: string; readonly businessOrWorkName: string | null; readonly primaryPhone: string; readonly primaryLatitude: number; readonly primaryLongitude: number; readonly status: CustomerStatus; readonly updatedAtUtc: string; }
export interface CustomerDetails { readonly id: string; readonly routeId: string; readonly firstNames: string; readonly lastNames: string; readonly businessOrWorkName: string | null; readonly observations: string | null; readonly status: CustomerStatus; readonly phones: readonly CustomerPhone[]; readonly locations: readonly CustomerLocation[]; readonly createdAtUtc: string; readonly updatedAtUtc: string; }
export interface CustomerPage { readonly items: readonly CustomerSummary[]; readonly page: number; readonly pageSize: number; readonly totalCount: number; }
export interface CustomerWriteRequest { readonly routeId: string; readonly firstNames: string; readonly lastNames: string; readonly businessOrWorkName: string | null; readonly observations: string | null; readonly status: CustomerStatus; readonly phones: readonly CustomerPhone[]; readonly locations: readonly CustomerLocation[]; }
