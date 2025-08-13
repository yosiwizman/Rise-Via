import { PaymentProvider, Customer, PaymentResult, RefundResult } from './PaymentProvider';
import Stripe from 'stripe';

export class POSaBITProvider implements PaymentProvider {
  name = 'POSaBIT';
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.apiUrl = testMode ? 'https://sandbox-api.posabit.com' : 'https://api.posabit.com';
  }

  async createPaymentIntent(amount: number, customer: Customer, orderId: string): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'POSaBIT API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/v1/payment-intents`, {
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
          order_id: orderId,
          payment_method: 'ach'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          paymentIntentId: data.intent_id || `posabit_intent_${Date.now()}`,
          transactionId: data.transaction_id || `posabit_${Date.now()}`,
          clientSecret: data.client_secret,
          redirectUrl: data.redirect_url
        };
      } else {
        return {
          success: false,
          error: data.error || 'Payment intent creation failed'
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
          error: 'POSaBIT API key not configured'
        };
      }

      const response = await fetch(`${this.apiUrl}/v1/payment-intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
          transactionId: data.transaction_id || paymentIntentId,
          paymentIntentId: paymentIntentId
        };
      } else {
        return {
          success: false,
          error: data.error || 'Payment confirmation failed'
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
          payment_method: 'ach',
          payment_method_id: paymentMethodId,
          order_id: orderId
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

  async refund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
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
          transaction_id: transactionId,
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

  async handleWebhook(event: any): Promise<void> {
    // POSaBIT uses its own webhook format, not Stripe's
    try {
      const eventData = event.data?.object || event;
      
      switch (event.type) {
        case 'payment.succeeded':
          console.log('POSaBIT payment succeeded:', eventData.transaction_id);
          // Handle successful payment
          break;
        
        case 'payment.failed':
          console.log('POSaBIT payment failed:', eventData.transaction_id);
          // Handle failed payment
          break;
        
        case 'refund.completed':
          console.log('POSaBIT refund completed:', eventData.refund_id);
          // Handle refund completion
          break;
        
        default:
          console.log('Unhandled POSaBIT webhook event:', event.type);
      }
    } catch (error) {
      console.error('Failed to handle POSaBIT webhook:', error);
      throw error;
    }
  }

  async createCustomer(customer: Customer): Promise<string | null> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return null;
      }

      const response = await fetch(`${this.apiUrl}/v1/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.customer_id || `posabit_customer_${Date.now()}`;
      } else {
        console.error('Failed to create POSaBIT customer:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Failed to create POSaBIT customer:', error);
      return null;
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return false;
      }

      const response = await fetch(`${this.apiUrl}/v1/customers/${customerId}/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

      const response = await fetch(`${this.apiUrl}/v1/customers/${customerId}/payment-methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert POSaBIT payment methods to Stripe-like format for compatibility
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
