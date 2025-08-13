/**
 * Payment Processing Library
 * Handles secure payment transactions with comprehensive logging and fraud detection
 */

import { sql } from './neon';

export interface PaymentTransaction {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  processor: string;
  processor_transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  failure_reason?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentRefund {
  id: string;
  transaction_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  processor_refund_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FraudCheckResult {
  isValid: boolean;
  riskScore: number;
  reasons: string[];
  requiresManualReview: boolean;
}

/**
 * Initialize payment tables
 */
export async function initializePaymentTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping payment table initialization');
      return;
    }

    // Payment transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        customer_id UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_method VARCHAR(50) NOT NULL,
        processor VARCHAR(50) NOT NULL,
        processor_transaction_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        failure_reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Payment refunds table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_refunds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        processor_refund_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Payment webhooks table for tracking webhook events
    await sql`
      CREATE TABLE IF NOT EXISTS payment_webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        processor VARCHAR(50) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        transaction_id VARCHAR(255),
        payload JSONB NOT NULL,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Fraud detection logs
    await sql`
      CREATE TABLE IF NOT EXISTS fraud_detection_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID,
        customer_id UUID,
        risk_score DECIMAL(3,2) NOT NULL,
        reasons TEXT[],
        action_taken VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON payment_transactions(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_transactions_processor ON payment_transactions(processor)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction_id ON payment_refunds(transaction_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processor ON payment_webhooks(processor)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fraud_detection_logs_customer_id ON fraud_detection_logs(customer_id)`;

    console.log('✅ Payment tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize payment tables:', error);
  }
}

/**
 * Create a payment transaction record
 */
export async function createPaymentTransaction(
  orderId: string,
  customerId: string,
  amount: number,
  paymentMethod: string,
  processor: string,
  metadata: Record<string, unknown> = {}
): Promise<PaymentTransaction | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const transactions = await sql`
      INSERT INTO payment_transactions (order_id, customer_id, amount, payment_method, processor, metadata)
      VALUES (${orderId}, ${customerId}, ${amount}, ${paymentMethod}, ${processor}, ${JSON.stringify(metadata)})
      RETURNING *
    ` as Array<PaymentTransaction>;

    return transactions.length > 0 ? transactions[0] : null;
  } catch (error) {
    console.error('Failed to create payment transaction:', error);
    return null;
  }
}

/**
 * Update payment transaction status
 */
export async function updatePaymentTransaction(
  transactionId: string,
  status: PaymentTransaction['status'],
  processorTransactionId?: string,
  failureReason?: string,
  metadata?: Record<string, unknown>
): Promise<PaymentTransaction | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (processorTransactionId) {
      updateData.processor_transaction_id = processorTransactionId;
    }

    if (failureReason) {
      updateData.failure_reason = failureReason;
    }

    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }

    const transactions = await sql`
      UPDATE payment_transactions 
      SET status = ${status}, 
          processor_transaction_id = ${processorTransactionId || null},
          failure_reason = ${failureReason || null},
          metadata = ${metadata ? JSON.stringify(metadata) : sql`metadata`},
          updated_at = NOW()
      WHERE id = ${transactionId}
      RETURNING *
    ` as Array<PaymentTransaction>;

    return transactions.length > 0 ? transactions[0] : null;
  } catch (error) {
    console.error('Failed to update payment transaction:', error);
    return null;
  }
}

/**
 * Get payment transaction by ID
 */
export async function getPaymentTransaction(transactionId: string): Promise<PaymentTransaction | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const transactions = await sql`
      SELECT * FROM payment_transactions WHERE id = ${transactionId}
    ` as Array<PaymentTransaction>;

    return transactions.length > 0 ? transactions[0] : null;
  } catch (error) {
    console.error('Failed to get payment transaction:', error);
    return null;
  }
}

/**
 * Get payment transactions for an order
 */
export async function getOrderPaymentTransactions(orderId: string): Promise<PaymentTransaction[]> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return [];
    }

    const transactions = await sql`
      SELECT * FROM payment_transactions 
      WHERE order_id = ${orderId}
      ORDER BY created_at DESC
    ` as Array<PaymentTransaction>;

    return transactions || [];
  } catch (error) {
    console.error('Failed to get order payment transactions:', error);
    return [];
  }
}

/**
 * Create a refund record
 */
export async function createRefund(
  transactionId: string,
  amount: number,
  reason: string
): Promise<PaymentRefund | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const refunds = await sql`
      INSERT INTO payment_refunds (transaction_id, amount, reason)
      VALUES (${transactionId}, ${amount}, ${reason})
      RETURNING *
    ` as Array<PaymentRefund>;

    return refunds.length > 0 ? refunds[0] : null;
  } catch (error) {
    console.error('Failed to create refund:', error);
    return null;
  }
}

/**
 * Update refund status
 */
export async function updateRefund(
  refundId: string,
  status: PaymentRefund['status'],
  processorRefundId?: string
): Promise<PaymentRefund | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const refunds = await sql`
      UPDATE payment_refunds 
      SET status = ${status}, 
          processor_refund_id = ${processorRefundId || null},
          updated_at = NOW()
      WHERE id = ${refundId}
      RETURNING *
    ` as Array<PaymentRefund>;

    return refunds.length > 0 ? refunds[0] : null;
  } catch (error) {
    console.error('Failed to update refund:', error);
    return null;
  }
}

/**
 * Log webhook event
 */
export async function logWebhookEvent(
  processor: string,
  eventType: string,
  transactionId: string | null,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping webhook log');
      return;
    }

    await sql`
      INSERT INTO payment_webhooks (processor, event_type, transaction_id, payload)
      VALUES (${processor}, ${eventType}, ${transactionId}, ${JSON.stringify(payload)})
    `;
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

/**
 * Advanced fraud detection
 */
export async function performFraudCheck(
  customerId: string,
  amount: number,
  paymentMethod: string,
  ipAddress: string,
  userAgent: string,
  billingAddress?: Record<string, unknown>
): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let riskScore = 0;

  try {
    if (!sql) {
      console.warn('⚠️ Database not available for fraud check');
      return { isValid: true, riskScore: 0, reasons: [], requiresManualReview: false };
    }

    // Check transaction frequency
    const recentTransactions = await sql`
      SELECT COUNT(*) as count, SUM(amount) as total_amount
      FROM payment_transactions 
      WHERE customer_id = ${customerId} 
      AND created_at > NOW() - INTERVAL '1 hour'
      AND status IN ('completed', 'processing')
    ` as Array<{ count: number; total_amount: number }>;

    if (recentTransactions[0]?.count > 5) {
      riskScore += 0.4;
      reasons.push('High transaction frequency detected');
    }

    if (recentTransactions[0]?.total_amount > 2000) {
      riskScore += 0.3;
      reasons.push('High transaction volume in short period');
    }

    // Check amount patterns
    if (amount > 1000) {
      riskScore += 0.2;
      reasons.push('High-value transaction');
    }

    if (amount < 5) {
      riskScore += 0.1;
      reasons.push('Unusually low transaction amount');
    }

    // Check for round numbers (potential testing)
    if (amount % 100 === 0 && amount >= 100) {
      riskScore += 0.1;
      reasons.push('Round number transaction amount');
    }

    // Check payment method risk
    if (paymentMethod === 'credit_card') {
      // Credit cards have higher fraud risk
      riskScore += 0.1;
    }

    // Check for failed transactions from same customer
    const failedTransactions = await sql`
      SELECT COUNT(*) as count
      FROM payment_transactions 
      WHERE customer_id = ${customerId} 
      AND created_at > NOW() - INTERVAL '24 hours'
      AND status = 'failed'
    ` as Array<{ count: number }>;

    if (failedTransactions[0]?.count > 3) {
      riskScore += 0.5;
      reasons.push('Multiple failed transactions detected');
    }

    // Check IP address patterns (basic check)
    if (ipAddress) {
      const ipTransactions = await sql`
        SELECT COUNT(DISTINCT customer_id) as unique_customers
        FROM payment_transactions pt
        JOIN fraud_detection_logs fdl ON pt.id = fdl.transaction_id
        WHERE fdl.created_at > NOW() - INTERVAL '1 hour'
      ` as Array<{ unique_customers: number }>;

      // This is a simplified check - in production, you'd want more sophisticated IP analysis
      if (ipTransactions[0]?.unique_customers > 10) {
        riskScore += 0.3;
        reasons.push('High activity from IP address');
      }
    }

    // Check user agent patterns
    if (!userAgent || userAgent.length < 50) {
      riskScore += 0.2;
      reasons.push('Suspicious or missing user agent');
    }

    // Velocity checks - multiple cards from same customer
    const cardCount = await sql`
      SELECT COUNT(DISTINCT metadata->>'card_fingerprint') as card_count
      FROM payment_transactions 
      WHERE customer_id = ${customerId} 
      AND created_at > NOW() - INTERVAL '7 days'
      AND metadata->>'card_fingerprint' IS NOT NULL
    ` as Array<{ card_count: number }>;

    if (cardCount[0]?.card_count > 3) {
      riskScore += 0.3;
      reasons.push('Multiple payment methods used recently');
    }

    // Geographic risk (if billing address provided)
    if (billingAddress) {
      const country = billingAddress.country as string;
      const highRiskCountries = ['XX', 'YY']; // Add actual high-risk country codes
      
      if (highRiskCountries.includes(country)) {
        riskScore += 0.2;
        reasons.push('Transaction from high-risk geographic location');
      }
    }

    // Time-based risk
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      riskScore += 0.1;
      reasons.push('Transaction during unusual hours');
    }

    // Ensure risk score doesn't exceed 1.0
    riskScore = Math.min(riskScore, 1.0);

    const isValid = riskScore < 0.7;
    const requiresManualReview = riskScore >= 0.5 && riskScore < 0.7;

    // Log fraud check result
    await sql`
      INSERT INTO fraud_detection_logs (customer_id, risk_score, reasons, action_taken)
      VALUES (${customerId}, ${riskScore}, ${reasons}, ${isValid ? 'approved' : 'blocked'})
    `;

    return {
      isValid,
      riskScore,
      reasons,
      requiresManualReview
    };
  } catch (error) {
    console.error('Fraud check error:', error);
    // On error, allow transaction but flag for review
    return {
      isValid: true,
      riskScore: 0.5,
      reasons: ['Fraud check system error - manual review required'],
      requiresManualReview: true
    };
  }
}

/**
 * Get payment analytics
 */
export async function getPaymentAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  averageAmount: number;
  topPaymentMethods: Array<{ method: string; count: number; amount: number }>;
  fraudBlocked: number;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return {
        totalTransactions: 0,
        totalAmount: 0,
        successRate: 0,
        averageAmount: 0,
        topPaymentMethods: [],
        fraudBlocked: 0
      };
    }

    // Get overall stats
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
      FROM payment_transactions
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
    ` as Array<{
      total_transactions: number;
      total_amount: number;
      average_amount: number;
      success_rate: number;
    }>;

    // Get payment method breakdown
    const paymentMethods = await sql`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as amount
      FROM payment_transactions
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY payment_method
      ORDER BY amount DESC
    ` as Array<{ method: string; count: number; amount: number }>;

    // Get fraud stats
    const fraudStats = await sql`
      SELECT COUNT(*) as fraud_blocked
      FROM fraud_detection_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      AND action_taken = 'blocked'
    ` as Array<{ fraud_blocked: number }>;

    const stats = overallStats[0] || {
      total_transactions: 0,
      total_amount: 0,
      average_amount: 0,
      success_rate: 0
    };

    return {
      totalTransactions: stats.total_transactions,
      totalAmount: stats.total_amount,
      successRate: stats.success_rate,
      averageAmount: stats.average_amount,
      topPaymentMethods: paymentMethods || [],
      fraudBlocked: fraudStats[0]?.fraud_blocked || 0
    };
  } catch (error) {
    console.error('Failed to get payment analytics:', error);
    return {
      totalTransactions: 0,
      totalAmount: 0,
      successRate: 0,
      averageAmount: 0,
      topPaymentMethods: [],
      fraudBlocked: 0
    };
  }
}