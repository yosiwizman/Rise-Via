import { PaymentProvider, Customer, PaymentResult, RefundResult } from './PaymentProvider';

export class POSaBITProvider implements PaymentProvider {
  name = 'POSaBIT';
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.apiUrl = testMode ? 'https://sandbox-api.posabit.com' : 'https://api.posabit.com';
  }

  async processPayment(amount: number, customer: Customer): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'POSaBIT API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          customer: {
            email: customer.email,
            name: customer.name,
            address: customer.address
          },
          payment_method: 'ach'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          transactionId: data.transaction_id || `posabit_${Date.now()}`,
          redirectUrl: data.redirect_url
        };
      } else {
        return {
          success: false,
          error: data.error || 'Payment failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async refund(transactionId: string): Promise<RefundResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'POSaBIT API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/v1/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: transactionId
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
          error: data.error || 'Refund failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  validateWebhook(payload: string | Buffer, signature: string): boolean {
    try {
      // Parse the payload if it's a string or Buffer
      const data = typeof payload === 'string' 
        ? JSON.parse(payload) 
        : JSON.parse(payload.toString());
      
      // Validate the webhook data structure
      return !!(data && 
               typeof data.provider === 'string' && data.provider === 'posabit' && 
               typeof data.transaction_id === 'string' && data.transaction_id &&
               signature && signature.length > 0);
    } catch {
      return false;
    }
  }
}
