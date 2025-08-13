import { PaymentProvider, Customer, PaymentResult, RefundResult } from './PaymentProvider';
import Stripe from 'stripe';

export class StripeProvider implements PaymentProvider {
  name = 'Stripe';
  private apiKey: string;
  private stripe: Stripe;

  constructor(apiKey: string, testMode = false) {
    this.apiKey = apiKey;
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-07-30.basil' as Stripe.LatestApiVersion,
    });
  }

  async createPaymentIntent(amount: number, customer: Customer, orderId: string): Promise<PaymentResult> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return {
          success: false,
          error: 'Stripe API key not configured'
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          order_id: orderId,
          customer_email: customer.email,
          customer_name: customer.name
        },
        automatic_payment_methods: {
          enabled: true,
        }
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined
      };
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
          error: 'Stripe API key not configured'
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      if (paymentIntent.status === 'requires_action' && paymentIntent.next_action) {
        const redirectUrl = paymentIntent.next_action.type === 'redirect_to_url' && 
                           paymentIntent.next_action.redirect_to_url?.url 
                           ? paymentIntent.next_action.redirect_to_url.url 
                           : undefined;
        
        return {
          success: false,
          requiresAction: true,
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret || undefined,
          redirectUrl
        };
      }

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          paymentIntentId: paymentIntent.id
        };
      }

      return {
        success: false,
        error: `Payment intent status: ${paymentIntent.status}`
      };
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
          error: 'Stripe API key not configured'
        };
      }

      // Create and confirm payment intent in one step
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        metadata: {
          order_id: orderId,
          customer_email: customer.email,
          customer_name: customer.name
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        }
      });

      if (paymentIntent.status === 'requires_action' && paymentIntent.next_action) {
        const redirectUrl = paymentIntent.next_action.type === 'redirect_to_url' && 
                           paymentIntent.next_action.redirect_to_url?.url 
                           ? paymentIntent.next_action.redirect_to_url.url 
                           : undefined;
        
        return {
          success: false,
          requiresAction: true,
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret || undefined,
          redirectUrl
        };
      }

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          paymentIntentId: paymentIntent.id
        };
      }

      return {
        success: false,
        error: `Payment intent status: ${paymentIntent.status}`
      };
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
          error: 'Stripe API key not configured'
        };
      }

      const refundData: Stripe.RefundCreateParams = {
        payment_intent: transactionId,
        reason: this.mapRefundReason(reason)
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapRefundReason(reason?: string): Stripe.RefundCreateParams.Reason {
    const reasonMap: Record<string, Stripe.RefundCreateParams.Reason> = {
      'duplicate': 'duplicate',
      'fraudulent': 'fraudulent',
      'customer_request': 'requested_by_customer',
      'requested_by_customer': 'requested_by_customer',
    };

    return reasonMap[reason || ''] || 'requested_by_customer';
  }

  validateWebhook(payload: string | Buffer, signature: string): boolean {
    try {
      const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
      this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return true;
    } catch {
      return false;
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Stripe payment succeeded:', paymentIntent.id);
          // Handle successful payment
          break;

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Stripe payment failed:', failedIntent.id);
          // Handle failed payment
          break;

        case 'charge.refunded':
          const charge = event.data.object as Stripe.Charge;
          console.log('Stripe refund processed:', charge.id);
          // Handle refund
          break;

        default:
          console.log('Unhandled Stripe webhook event:', event.type);
      }
    } catch (error) {
      console.error('Failed to handle Stripe webhook:', error);
      throw error;
    }
  }

  async createCustomer(customer: Customer): Promise<string | null> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return null;
      }

      const stripeCustomer = await this.stripe.customers.create({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: {
          line1: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          postal_code: customer.address.zipCode,
          country: customer.address.country || 'US'
        },
        metadata: {
          customer_id: customer.id || ''
        }
      });

      return stripeCustomer.id;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      return null;
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'placeholder-key') {
        return false;
      }

      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      return true;
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

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return [];
    }
  }
}
