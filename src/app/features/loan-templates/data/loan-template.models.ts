export type LoanTemplateClassification = 'Low' | 'High' | 'CustomTemplate';
export type LoanTemplateStatus = 'Draft' | 'Published' | 'Inactive';

export interface LoanTemplateVersion {
  readonly version: number;
  readonly name: string;
  readonly description: string | null;
  readonly classification: LoanTemplateClassification;
  readonly status: LoanTemplateStatus;
  readonly maxLoanDays: number;
  readonly maxPrincipalAmount: number;
  readonly allowedPercentages: readonly number[];
  readonly recordedByUserId: string;
  readonly recordedAtUtc: string;
}

export interface LoanTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly classification: LoanTemplateClassification;
  readonly status: LoanTemplateStatus;
  readonly version: number;
  readonly maxLoanDays: number;
  readonly maxPrincipalAmount: number;
  readonly allowedPercentages: readonly number[];
  readonly versions?: readonly LoanTemplateVersion[];
  readonly updatedAtUtc: string;
}

export interface LoanTemplateRequest {
  readonly name: string;
  readonly description: string | null;
  readonly classification: LoanTemplateClassification;
  readonly status: LoanTemplateStatus;
  readonly maxLoanDays: number;
  readonly maxPrincipalAmount: number;
  readonly allowedPercentages: readonly number[];
}
