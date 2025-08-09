export interface PaymentMethod {
  id: string;
  name: string;
  provider: 'posabit' | 'aeropay' | 'hypur' | 'stripe';
  enabled: boolean;
  supportedStates: string[];
  cannabisCompliant: boolean;
  processingTime: string;
  feePercentage: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentConfig {
  provider: 'posabit' | 'aeropay' | 'hypur' | 'stripe';
  apiKey: string;
  testMode: boolean;
  enabledStates: string[];
  feePercentage: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  transaction: PaymentTransaction;
  customer: {
    id?: string;
    email: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
}

export interface PaymentWebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  transactionId: string;
  orderId?: string;
  status: string;
  amount: number;
  customerEmail: string;
  timestamp: string;
  processed: boolean;
}
