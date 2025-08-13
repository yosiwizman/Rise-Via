/**
 * Stripe Payment Provider Implementation
 * Handles payment processing, refunds, and webhooks
 */

import Stripe from 'stripe';
import { sql } from '../../lib/neon';
import { createPaymentTransaction, updatePaymentTransaction } from '../../lib/payment';
import { performFraudCheck } from '../../lib/payment';

// Initialize Stripe with test/production key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-07-30.basil' as Stripe.LatestApiVersion,
});

// Webhook secret for verifying Stripe webhooks
const WEBHOOK_SECRET = process.env.VITE_STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export interface Customer {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
  redirectUrl?: string;
  requiresAction?: boolean;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  payment_method?: string;
  metadata: Record<string, string>;
}

export interface PaymentProvider {
  name: string;
  createPaymentIntent(amount: number, customer: Customer, orderId: string): Promise<PaymentResult>;
  confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult>;
  processPayment(amount: number, customer: Customer, paymentMethodId: string, orderId: string): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult>;
  validateWebhook(payload: string | Buffer, signature: string): boolean;
  handleWebhook(event: Stripe.Event): Promise<void>;
  createCustomer(customer: Customer): Promise<string | null>;
  attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean>;
  getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
}

class StripePaymentProvider implements PaymentProvider {
  name = 'stripe';

  /**
   * Create a Stripe customer
   */
  async createCustomer(customer: Customer): Promise<string | null> {
    try {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: {
          line1: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          postal_code: customer.address.zipCode,
          country: customer.address.country || 'US',
        },
        metadata: {
          customer_id: customer.id || '',
        },
      });

      // Store Stripe customer ID in database
      if (sql && customer.id) {
        await sql`
          UPDATE customers 
          SET stripe_customer_id = ${stripeCustomer.id}
          WHERE id = ${customer.id}
        `;
      }

      return stripeCustomer.id;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      return null;
    }
  }

  /**
   * Create a payment intent for later confirmation
   */
  async createPaymentIntent(amount: number, customer: Customer, orderId: string): Promise<PaymentResult> {
    try {
      // Perform fraud check
      const fraudCheck = await performFraudCheck(
        customer.id || '',
        amount,
        'credit_card',
        '', // IP address should be passed from request
        '', // User agent should be passed from request
        customer.address
      );

      if (!fraudCheck.isValid) {
        return {
          success: false,
          error: `Payment blocked: ${fraudCheck.reasons.join(', ')}`,
        };
      }

      // Get or create Stripe customer
      let stripeCustomerId: string | undefined;
      if (customer.id && sql) {
        const customers = await sql`
          SELECT stripe_customer_id FROM customers WHERE id = ${customer.id}
        ` as Array<{ stripe_customer_id: string | null }>;
        
        if (customers.length > 0 && customers[0].stripe_customer_id) {
          stripeCustomerId = customers[0].stripe_customer_id;
        }
      }

      if (!stripeCustomerId) {
        const newCustomerId = await this.createCustomer(customer);
        stripeCustomerId = newCustomerId || undefined;
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: stripeCustomerId,
        metadata: {
          order_id: orderId,
          customer_id: customer.id || '',
          customer_email: customer.email,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Order #${orderId}`,
        shipping: {
          name: customer.name,
          address: {
            line1: customer.address.street,
            city: customer.address.city,
            state: customer.address.state,
            postal_code: customer.address.zipCode,
            country: customer.address.country || 'US',
          },
        },
      });

      // Create payment transaction record
      if (customer.id) {
        await createPaymentTransaction(
          orderId,
          customer.id,
          amount,
          'credit_card',
          'stripe',
          {
            payment_intent_id: paymentIntent.id,
            fraud_check: fraudCheck,
          }
        );
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        transactionId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  }

  /**
   * Confirm a payment intent with a payment method
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
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
          redirectUrl,
        };
      }

      if (paymentIntent.status === 'succeeded') {
        // Update payment transaction
        await updatePaymentTransaction(
          paymentIntent.id,
          'completed',
          paymentIntent.id
        );

        return {
          success: true,
          transactionId: paymentIntent.id,
          paymentIntentId: paymentIntent.id,
        };
      }

      return {
        success: false,
        error: `Payment intent status: ${paymentIntent.status}`,
      };
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      };
    }
  }

  /**
   * Process a payment immediately
   */
  async processPayment(
    amount: number,
    customer: Customer,
    paymentMethodId: string,
    orderId: string
  ): Promise<PaymentResult> {
    try {
      // Create payment intent
      const intentResult = await this.createPaymentIntent(amount, customer, orderId);
      if (!intentResult.success || !intentResult.paymentIntentId) {
        return intentResult;
      }

      // Confirm payment
      return await this.confirmPayment(intentResult.paymentIntentId, paymentMethodId);
    } catch (error) {
      console.error('Failed to process payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payment',
      };
    }
  }

  /**
   * Refund a payment
   */
  async refund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
    try {
      // Get payment intent details
      const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
      
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: transactionId,
        reason: this.mapRefundReason(reason),
        metadata: {
          original_order_id: paymentIntent.metadata.order_id || '',
          refund_reason: reason || 'requested_by_customer',
        },
      };

      // If amount specified, refund partial amount
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      // Update payment transaction
      await updatePaymentTransaction(
        transactionId,
        amount && amount < (paymentIntent.amount / 100) ? 'completed' : 'refunded',
        undefined,
        undefined,
        { refund_id: refund.id, refund_amount: amount }
      );

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error('Failed to process refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund',
      };
    }
  }

  /**
   * Map refund reason to Stripe format
   */
  private mapRefundReason(reason?: string): Stripe.RefundCreateParams.Reason {
    const reasonMap: Record<string, Stripe.RefundCreateParams.Reason> = {
      'duplicate': 'duplicate',
      'fraudulent': 'fraudulent',
      'customer_request': 'requested_by_customer',
      'requested_by_customer': 'requested_by_customer',
    };

    return reasonMap[reason || ''] || 'requested_by_customer';
  }

  /**
   * Validate webhook signature
   */
  validateWebhook(payload: string | Buffer, signature: string): boolean {
    try {
      stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
      return true;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleRefundUpdate(event.data.object as Stripe.Charge);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Handle subscription events if needed
          console.log('Subscription event:', event.type);
          break;

        default:
          console.log('Unhandled webhook event type:', event.type);
      }
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw error; // Re-throw to return 500 to Stripe
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.order_id;
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata');
      return;
    }

    // Update payment transaction
    await updatePaymentTransaction(
      paymentIntent.id,
      'completed',
      paymentIntent.id,
      undefined,
      {
        payment_method: paymentIntent.payment_method,
        amount_received: paymentIntent.amount_received / 100,
      }
    );

    // Update order status
    if (sql) {
      await sql`
        UPDATE orders 
        SET payment_status = 'paid',
            payment_intent_id = ${paymentIntent.id},
            status = CASE 
              WHEN status = 'pending' THEN 'confirmed'
              ELSE status
            END,
            updated_at = NOW()
        WHERE id = ${orderId}
      `;
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.order_id;
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata');
      return;
    }

    // Update payment transaction
    await updatePaymentTransaction(
      paymentIntent.id,
      'failed',
      paymentIntent.id,
      paymentIntent.last_payment_error?.message
    );

    // Update order status
    if (sql) {
      await sql`
        UPDATE orders 
        SET payment_status = 'failed',
            notes = ${`Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`},
            updated_at = NOW()
        WHERE id = ${orderId}
      `;
    }
  }

  /**
   * Handle refund update
   */
  private async handleRefundUpdate(charge: Stripe.Charge): Promise<void> {
    if (!charge.payment_intent || typeof charge.payment_intent !== 'string') {
      return;
    }

    const refundAmount = charge.amount_refunded / 100;
    const isFullRefund = charge.amount === charge.amount_refunded;

    // Update payment transaction
    await updatePaymentTransaction(
      charge.payment_intent,
      isFullRefund ? 'refunded' : 'completed',
      undefined,
      undefined,
      {
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
      }
    );
  }

  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to attach payment method:', error);
      return false;
    }
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return [];
    }
  }

  /**
   * Create a checkout session for more complex flows
   */
  async createCheckoutSession(
    orderId: string,
    customer: Customer,
    lineItems: Array<{ name: string; amount: number; quantity: number }>,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId?: string; url?: string; error?: string }> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.amount * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customer.email,
        metadata: {
          order_id: orderId,
          customer_id: customer.id || '',
        },
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      });

      return {
        sessionId: session.id,
        url: session.url || undefined,
      };
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      };
    }
  }
}

// Export singleton instance
export const stripePaymentProvider = new StripePaymentProvider();

// Export for use in other files
export default stripePaymentProvider;
