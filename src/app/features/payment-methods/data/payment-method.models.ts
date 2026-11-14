export interface PaymentMethodItem {
  readonly id: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
}

export interface CreatePaymentMethodRequest {
  readonly name: string;
  readonly displayOrder: number;
}

export interface UpdatePaymentMethodRequest {
  readonly name: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface NonPaymentReasonItem {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface CreateNonPaymentReasonRequest {
  readonly name: string;
  readonly description?: string | null;
  readonly displayOrder: number;
}

export interface UpdateNonPaymentReasonRequest {
  readonly name: string;
  readonly description?: string | null;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export type ParameterConfigTabId = 'payment-methods' | 'non-payment-reasons';

export interface ParameterConfigTabMeta {
  readonly id: ParameterConfigTabId;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}

