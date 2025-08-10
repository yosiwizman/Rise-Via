import { emailService } from '../../services/emailService';
import crypto from 'crypto';

interface WebhookPayload extends Record<string, unknown> {
  provider: string;
  event_type: string;
  transaction_id: string;
  status: string;
  amount: number;
  customer_email: string;
  order_number?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export async function handlePaymentWebhook(payload: WebhookPayload) {
  try {
    console.log('Processing webhook:', payload.event_type, 'for', payload.provider);

    switch (payload.event_type) {
      case 'payment.completed':
      case 'payment.succeeded':
        await handlePaymentCompleted(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(payload);
        break;
      case 'payment.pending':
        await handlePaymentPending(payload);
        break;
      default:
        console.log('Unhandled webhook event:', payload.event_type);
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
}

async function handlePaymentCompleted(payload: WebhookPayload) {
  console.log('Payment completed:', payload.transaction_id);
  
  try {
    if (payload.customer_email && payload.order_number) {
      await emailService.sendOrderConfirmation(payload.customer_email, {
        orderNumber: payload.order_number,
        total: payload.amount
      });
    }

    updateOrderStatus(payload.order_number || payload.transaction_id, 'paid', {
      transactionId: payload.transaction_id,
      provider: payload.provider,
      amount: payload.amount
    });

  } catch (error) {
    console.error('Failed to process payment completion:', error);
  }
}

async function handlePaymentFailed(payload: WebhookPayload) {
  console.log('Payment failed:', payload.transaction_id);
  
  try {
    updateOrderStatus(payload.order_number || payload.transaction_id, 'payment_failed', {
      transactionId: payload.transaction_id,
      provider: payload.provider,
      error: payload.metadata?.error || 'Payment failed'
    });

    if (payload.customer_email) {
      console.log('Would send payment failure notification to:', payload.customer_email);
    }

  } catch (error) {
    console.error('Failed to process payment failure:', error);
  }
}

async function handlePaymentRefunded(payload: WebhookPayload) {
  console.log('Payment refunded:', payload.transaction_id);
  
  try {
    updateOrderStatus(payload.order_number || payload.transaction_id, 'refunded', {
      transactionId: payload.transaction_id,
      provider: payload.provider,
      refundAmount: payload.amount
    });

    if (payload.customer_email && payload.order_number) {
      console.log('Would send refund confirmation to:', payload.customer_email);
    }

  } catch (error) {
    console.error('Failed to process payment refund:', error);
  }
}

async function handlePaymentPending(payload: WebhookPayload) {
  console.log('Payment pending:', payload.transaction_id);
  
  try {
    updateOrderStatus(payload.order_number || payload.transaction_id, 'pending', {
      transactionId: payload.transaction_id,
      provider: payload.provider
    });

  } catch (error) {
    console.error('Failed to process payment pending:', error);
  }
}

function updateOrderStatus(orderId: string, status: string, metadata: Record<string, unknown>) {
  const orderUpdate = {
    orderId,
    status,
    updatedAt: new Date().toISOString(),
    paymentMetadata: metadata
  };

  const existingOrders = JSON.parse(localStorage.getItem('order_updates') || '[]');
  existingOrders.push(orderUpdate);
  
  if (existingOrders.length > 1000) {
    existingOrders.splice(0, existingOrders.length - 1000);
  }
  
  localStorage.setItem('order_updates', JSON.stringify(existingOrders));
  
  console.log('Order status updated:', orderUpdate);
}

export function createWebhookRoute() {
  return async (req: { body: WebhookPayload; headers: Record<string, string> }, res: { status: (code: number) => { json: (data: Record<string, unknown>) => void } }) => {
    try {
      const payload = req.body as WebhookPayload;
      
      if (!payload.provider || !payload.event_type || !payload.transaction_id) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }

      const signature = req.headers['x-signature'] || req.headers['signature'] || '';
      const isValidSignature = validateWebhookSignature(payload.provider, payload, signature);
      if (!isValidSignature) {
        console.error('Invalid webhook signature for provider:', payload.provider);
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const result = await handlePaymentWebhook(payload);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Webhook route error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  };
}

export function validateWebhookSignature(provider: string, payload: Record<string, unknown>, signature: string): boolean {
  try {
    switch (provider) {
      case 'posabit':
        const posSecret = process.env.VITE_POSABIT_SECRET || '';
        if (!posSecret) return false;
        
        const posExpectedSignature = crypto
          .createHmac('sha256', posSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        return signature === `sha256=${posExpectedSignature}`;

      case 'aeropay':
        const aeroSecret = process.env.VITE_AEROPAY_SECRET || '';
        if (!aeroSecret) return false;
        
        const timestamp = payload.timestamp as string;
        const aeroPayload = `${timestamp}.${JSON.stringify(payload)}`;
        const aeroExpectedSignature = crypto
          .createHmac('sha256', aeroSecret)
          .update(aeroPayload)
          .digest('hex');
        return signature === aeroExpectedSignature;

      case 'hypur':
        const hypSecret = process.env.VITE_HYPUR_SECRET || '';
        if (!hypSecret) return false;
        
        const hypExpectedSignature = crypto
          .createHmac('sha256', hypSecret)
          .update(JSON.stringify(payload))
          .digest('base64');
        return signature === hypExpectedSignature;

      case 'stripe':
        return true;

      default:
        console.warn('Unknown payment provider for webhook validation:', provider);
        return false;
    }
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
}
