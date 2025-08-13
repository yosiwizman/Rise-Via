import { PaymentProvider, Customer, PaymentResult, RefundResult } from './PaymentProvider';

export class StripeProvider implements PaymentProvider {
  name = 'Stripe';
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.apiUrl = testMode ? 'https://api.stripe.com/v1' : 'https://api.stripe.com/v1';
  }

  async processPayment(amount: number, customer: Customer): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'Stripe API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(),
          currency: 'usd',
          'metadata[customer_email]': customer.email,
          'metadata[customer_name]': customer.name
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          transactionId: data.id || `stripe_${Date.now()}`,
          redirectUrl: data.next_action?.redirect_to_url?.url
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Payment failed'
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
          error: 'Stripe API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          payment_intent: transactionId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          refundId: data.id || `refund_${Date.now()}`
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Refund failed'
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
      
      // Validate the webhook data structure for Stripe
      return !!(data && 
               typeof data.type === 'string' && data.type &&
               data.data && 
               typeof data.data === 'object' && data.data !== null &&
               'object' in data.data &&
               signature && signature.length > 0);
    } catch {
      return false;
    }
  }
}
