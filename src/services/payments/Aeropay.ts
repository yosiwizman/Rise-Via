import { PaymentProvider, Customer, PaymentResult, RefundResult } from './PaymentProvider';
import Stripe from 'stripe';

export class AeropayProvider implements PaymentProvider {
  name = 'Aeropay';
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.apiUrl = testMode ? 'https://sandbox.aeropay.com/api' : 'https://api.aeropay.com';
  }

  async createPaymentIntent(amount: number, customer: Customer, orderId: string): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'Aeropay API key not configured'
        };
      }

      const authToken = this.generateAuthToken();
      
      const response = await fetch(`${this.apiUrl}/v1/payment-intent`, {
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
          order_id: orderId,
          payment_type: 'bank_transfer',
          address: customer.address
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          paymentIntentId: data.intent_id || `aeropay_intent_${Date.now()}`,
          transactionId: data.payment_id || `aeropay_${Date.now()}`,
          clientSecret: data.client_secret,
          redirectUrl: data.qr_code_url
        };
      } else {
        return {
          success: false,
          error: data.message || 'Payment intent creation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'Aeropay API key not configured'
        };
      }

      const authToken = this.generateAuthToken();
      
      const response = await fetch(`${this.apiUrl}/v1/payment-intent/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'authorizationToken': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: paymentMethodId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          transactionId: data.payment_id || paymentIntentId,
          paymentIntentId: paymentIntentId
        };
      } else {
        return {
          success: false,
          error: data.message || 'Payment confirmation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processPayment(amount: number, customer: Customer, paymentMethodId: string, orderId: string): Promise<PaymentResult> {
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
          payment_method_id: paymentMethodId,
          order_id: orderId,
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

  async refund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
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
          payment_id: transactionId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason
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

  validateWebhook(payload: string | Buffer, signature: string): boolean {
    try {
      // Parse the payload if it's a string or Buffer
      const data = typeof payload === 'string' 
        ? JSON.parse(payload) 
        : JSON.parse(payload.toString());
      
      // Validate the webhook data structure
      return !!(data && 
               typeof data.provider === 'string' && data.provider === 'aeropay' && 
               typeof data.payment_id === 'string' && data.payment_id &&
               signature && signature.length > 0);
    } catch {
      return false;
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    // Aeropay uses its own webhook format, not Stripe's
    // This method adapts the interface for compatibility
    try {
      const eventData = event.data.object as any;
      
      switch (event.type) {
        case 'transaction.completed':
          console.log('Aeropay transaction completed:', eventData.payment_id);
          // Handle successful payment
          break;
        
        case 'transaction.failed':
          console.log('Aeropay transaction failed:', eventData.payment_id);
          // Handle failed payment
          break;
        
        case 'refund.completed':
          console.log('Aeropay refund completed:', eventData.refund_id);
          // Handle refund completion
          break;
        
        default:
          console.log('Unhandled Aeropay webhook event:', event.type);
      }
    } catch (error) {
      console.error('Failed to handle Aeropay webhook:', error);
      throw error;
    }
  }

  async createCustomer(customer: Customer): Promise<string | null> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return null;
      }

      const authToken = this.generateAuthToken();
      
      const response = await fetch(`${this.apiUrl}/v1/customers`, {
        method: 'POST',
        headers: {
          'authorizationToken': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          merchantId: import.meta.env.VITE_AEROPAY_MERCHANT_ID || 'default'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.customer_id || `aeropay_customer_${Date.now()}`;
      } else {
        console.error('Failed to create Aeropay customer:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Failed to create Aeropay customer:', error);
      return null;
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return false;
      }

      const authToken = this.generateAuthToken();
      
      const response = await fetch(`${this.apiUrl}/v1/customers/${customerId}/payment-methods`, {
        method: 'POST',
        headers: {
          'authorizationToken': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          set_as_default: true
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to attach payment method:', error);
      return false;
    }
  }

  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return [];
      }

      const authToken = this.generateAuthToken();
      
      const response = await fetch(`${this.apiUrl}/v1/customers/${customerId}/payment-methods`, {
        method: 'GET',
        headers: {
          'authorizationToken': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert Aeropay payment methods to Stripe-like format for compatibility
        return (data.payment_methods || []).map((method: any) => ({
          id: method.id,
          type: 'us_bank_account',
          created: Math.floor(new Date(method.created_at).getTime() / 1000),
          customer: customerId,
          livemode: !this.apiUrl.includes('sandbox'),
          metadata: {},
          us_bank_account: {
            account_holder_type: 'individual',
            account_type: method.account_type || 'checking',
            bank_name: method.bank_name || 'Unknown Bank',
            fingerprint: method.fingerprint,
            last4: method.last4,
            routing_number: method.routing_number
          }
        } as Stripe.PaymentMethod));
      }

      return [];
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return [];
    }
  }
}
