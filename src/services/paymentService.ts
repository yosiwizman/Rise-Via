/**
 * Cannabis Payment Service
 * Integrates with cannabis-compliant payment processors
 */

import { POSaBITProvider } from './payments/POSaBIT';
import { AeropayProvider } from './payments/Aeropay';
import { HypurProvider } from './payments/Hypur';
import { SecurityUtils } from '../utils/security';
import { ComplianceManager } from '../utils/compliance';
import { env } from '../config/env';

export interface PaymentProcessor {
  name: string;
  type: 'ACH' | 'Digital Wallet' | 'POS Integration';
  isAvailable: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  walletUrl?: string;
  status?: string;
  error?: string;
  orderNumber?: string;
  paymentMethod?: string;
  redirectUrl?: string;
}

export interface OrderData {
  orderId: string;
  amount: number;
  customerId: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}


/**
 * Main Payment Service
 * Orchestrates different payment processors with enhanced security
 */
export class PaymentService {
  private posabit: POSaBITProvider;
  private aeropay: AeropayProvider;
  private hypur: HypurProvider;

  constructor() {
    const testMode = !env.IS_PRODUCTION;
    this.posabit = new POSaBITProvider(env.STRIPE_PUBLISHABLE_KEY || '', testMode);
    this.aeropay = new AeropayProvider(env.STRIPE_PUBLISHABLE_KEY || '', testMode);
    this.hypur = new HypurProvider(env.STRIPE_PUBLISHABLE_KEY || '', testMode);
  }

  /**
   * Enhanced fraud detection for payment processing
   */
  private async detectPaymentFraud(orderData: OrderData, customerData: Record<string, unknown>): Promise<{ isValid: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    const rateLimitKey = `payment_${customerData.email || orderData.customerId}`;
    if (!SecurityUtils.checkRateLimit(rateLimitKey, 3, 300000)) {
      riskScore += 0.8;
      reasons.push('Excessive payment attempts detected');
    }

    if (orderData.amount > 5000) {
      riskScore += 0.3;
      reasons.push('High-value transaction requires additional verification');
    }

    if (orderData.amount < 10) {
      riskScore += 0.2;
      reasons.push('Unusually low transaction amount');
    }

    if (!SecurityUtils.isValidEmail(orderData.customerId)) {
      riskScore += 0.4;
      reasons.push('Invalid customer email format');
    }

    const complianceResult = ComplianceManager.verifyAge({
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });

    riskScore += complianceResult.riskScore * 0.5;
    if (complianceResult.reasons.length > 0) {
      reasons.push(...complianceResult.reasons);
    }

    return {
      isValid: riskScore < 0.8,
      riskScore: Math.min(riskScore, 1.0),
      reasons
    };
  }

  /**
   * Get available payment processors with security validation
   */
  getAvailableProcessors(): PaymentProcessor[] {
    return [
      {
        name: 'POSaBIT',
        type: 'POS Integration',
        isAvailable: !!env.STRIPE_PUBLISHABLE_KEY
      },
      {
        name: 'Aeropay',
        type: 'ACH',
        isAvailable: !!env.STRIPE_PUBLISHABLE_KEY
      },
      {
        name: 'Hypur',
        type: 'Digital Wallet',
        isAvailable: !!env.STRIPE_PUBLISHABLE_KEY
      }
    ];
  }


  /**
   * Process payment with enhanced security and fraud detection
   */
  async processPayment(orderData: OrderData, preferredProcessor?: string, customerData?: Record<string, unknown>): Promise<PaymentResult> {
    try {
      const fraudCheck = await this.detectPaymentFraud(orderData, customerData || {});
      if (!fraudCheck.isValid) {
        console.warn('Payment blocked due to fraud detection:', fraudCheck);
        return {
          success: false,
          error: `Payment blocked: ${fraudCheck.reasons.join(', ')}`
        };
      }

      const processors = this.getAvailableProcessors();
      const availableProcessors = processors.filter(p => p.isAvailable);

      if (availableProcessors.length === 0) {
        return {
          success: false,
          error: 'No payment processors configured. Please contact support.'
        };
      }

      const customer = {
        email: orderData.customerId,
        name: (customerData?.name as string) || 'Customer',
        address: (customerData?.address as { street: string; city: string; state: string; zipCode: string }) || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      };

      if (preferredProcessor) {
        const processor = availableProcessors.find(p => p.name === preferredProcessor);
        if (processor) {
          switch (processor.name) {
            case 'POSaBIT':
              return await this.posabit.processPayment(orderData.amount, customer);
            case 'Aeropay':
              return await this.aeropay.processPayment(orderData.amount, customer);
            case 'Hypur':
              return await this.hypur.processPayment(orderData.amount, customer);
          }
        }
      }

      const defaultProcessor = availableProcessors[0];
      switch (defaultProcessor.name) {
        case 'POSaBIT':
          return await this.posabit.processPayment(orderData.amount, customer);
        case 'Aeropay':
          return await this.aeropay.processPayment(orderData.amount, customer);
        case 'Hypur':
          return await this.hypur.processPayment(orderData.amount, customer);
        default:
          return {
            success: false,
            error: 'Payment processor not supported'
          };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Process refund through appropriate processor
   */
  async processRefund(transactionId: string, processorName: string): Promise<PaymentResult> {
    try {
      switch (processorName) {
        case 'POSaBIT': {
          const posResult = await this.posabit.refund(transactionId);
          return { success: posResult.success, error: posResult.error, transactionId: posResult.refundId };
        }
        case 'Aeropay': {
          const aeroResult = await this.aeropay.refund(transactionId);
          return { success: aeroResult.success, error: aeroResult.error, transactionId: aeroResult.refundId };
        }
        case 'Hypur': {
          const hypResult = await this.hypur.refund(transactionId);
          return { success: hypResult.success, error: hypResult.error, transactionId: hypResult.refundId };
        }
        default:
          return { success: false, error: 'Unsupported processor for refund' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
