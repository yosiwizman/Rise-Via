import { PaymentProvider, Customer, PaymentResult, RefundResult } from './PaymentProvider';

export class AeropayProvider implements PaymentProvider {
  name = 'Aeropay';
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.apiUrl = testMode ? 'https://sandbox.aeropay.com/api' : 'https://api.aeropay.com';
  }

  async processPayment(amount: number, customer: Customer): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'Aeropay API key not configured'
        };
      }

      const authToken = this.generateAuthToken();
      
      const response = await fetch(`${this.apiUrl}/v1/transaction`, {
        method: 'POST',
        headers: {
          'authorizationToken': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          merchantId: import.meta.env.VITE_AEROPAY_MERCHANT_ID || 'default',
          uuid: crypto.randomUUID(),
          customer_email: customer.email,
          customer_name: customer.name,
          payment_type: 'bank_transfer',
          address: customer.address
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          transactionId: data.payment_id || `aeropay_${Date.now()}`,
          redirectUrl: data.qr_code_url
        };
      } else {
        return {
          success: false,
          error: data.message || 'Payment failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateAuthToken(): string {
    const payload = {
      api_key: this.apiKey,
      timestamp: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async refund(transactionId: string): Promise<RefundResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'Aeropay API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/v1/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_id: transactionId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          refundId: data.refund_id || `refund_${Date.now()}`
        };
      } else {
        return {
          success: false,
          error: data.message || 'Refund failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  validateWebhook(payload: Record<string, unknown>): boolean {
    return !!(payload && 
             typeof payload.provider === 'string' && payload.provider === 'aeropay' && 
             typeof payload.payment_id === 'string' && payload.payment_id);
  }
}
