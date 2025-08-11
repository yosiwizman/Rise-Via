export interface Customer {
  id?: string;
  email: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  processPayment(amount: number, customer: Customer): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
  validateWebhook(payload: Record<string, unknown>): boolean;
}
