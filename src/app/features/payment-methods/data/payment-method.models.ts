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
