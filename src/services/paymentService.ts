/**
 * Cannabis Payment Service
 * Integrates with cannabis-compliant payment processors
 */

import { POSaBITProvider } from './payments/POSaBIT';
import { AeropayProvider } from './payments/Aeropay';
import { HypurProvider } from './payments/Hypur';
import { 
  createPaymentTransaction,
  updatePaymentTransaction,
  performFraudCheck,
  initializePaymentTables,
  type FraudCheckResult
} from '../lib/payment';

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
    const testMode = import.meta.env.VITE_APP_ENV === 'development';
    this.posabit = new POSaBITProvider(import.meta.env.VITE_POSABIT_API_KEY || '', testMode);
    this.aeropay = new AeropayProvider(import.meta.env.VITE_AEROPAY_API_KEY || '', testMode);
    this.hypur = new HypurProvider(import.meta.env.VITE_HYPUR_API_KEY || '', testMode);
    
    // Initialize payment tables
    initializePaymentTables();
  }

  /**
   * Enhanced fraud detection for payment processing
   */
  private async detectPaymentFraud(
    orderData: OrderData, 
    customerData: Record<string, unknown>,
    ipAddress: string = '',
    userAgent: string = ''
  ): Promise<FraudCheckResult> {
    return await performFraudCheck(
      orderData.customerId,
      orderData.amount,
      'card', // Default payment method
      ipAddress,
      userAgent,
      customerData.billingAddress as Record<string, unknown>
    );
  }

  /**
   * Get available payment processors with security validation
   */
  getAvailableProcessors(): PaymentProcessor[] {
    return [
      {
        name: 'POSaBIT',
        type: 'POS Integration',
        isAvailable: !!import.meta.env.VITE_POSABIT_API_KEY
      },
      {
        name: 'Aeropay',
        type: 'ACH',
        isAvailable: !!import.meta.env.VITE_AEROPAY_API_KEY
      },
      {
        name: 'Hypur',
        type: 'Digital Wallet',
        isAvailable: !!import.meta.env.VITE_HYPUR_API_KEY
      }
    ];
  }


  /**
   * Process payment with enhanced security and fraud detection
   */
  async processPayment(
    orderData: OrderData, 
    preferredProcessor?: string, 
    customerData?: Record<string, unknown>,
    ipAddress: string = '',
    userAgent: string = ''
  ): Promise<PaymentResult> {
    let transactionId: string | null = null;
    
    try {
      // Create initial transaction record
      const transaction = await createPaymentTransaction(
        orderData.orderId,
        orderData.customerId,
        orderData.amount,
        preferredProcessor || 'unknown',
        preferredProcessor || 'default',
        { orderData, customerData }
      );

      if (!transaction) {
        return {
          success: false,
          error: 'Failed to create payment transaction record'
        };
      }

      transactionId = transaction.id;

      // Perform fraud detection
      const fraudCheck = await this.detectPaymentFraud(orderData, customerData || {}, ipAddress, userAgent);
      
      if (!fraudCheck.isValid) {
        await updatePaymentTransaction(
          transactionId,
          'failed',
          undefined,
          `Fraud detection: ${fraudCheck.reasons.join(', ')}`
        );
        
        console.warn('Payment blocked due to fraud detection:', fraudCheck);
        return {
          success: false,
          error: `Payment blocked: ${fraudCheck.reasons.join(', ')}`
        };
      }

      if (fraudCheck.requiresManualReview) {
        await updatePaymentTransaction(
          transactionId,
          'pending',
          undefined,
          `Manual review required: ${fraudCheck.reasons.join(', ')}`
        );
        
        return {
          success: false,
          error: 'Payment requires manual review. Our team will contact you shortly.'
        };
      }

      // Update transaction status to processing
      await updatePaymentTransaction(transactionId, 'processing');

      const processors = this.getAvailableProcessors();
      const availableProcessors = processors.filter(p => p.isAvailable);

      if (availableProcessors.length === 0) {
        await updatePaymentTransaction(
          transactionId,
          'failed',
          undefined,
          'No payment processors configured'
        );
        
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

      let paymentResult: PaymentResult;

      if (preferredProcessor) {
        const processor = availableProcessors.find(p => p.name === preferredProcessor);
        if (processor) {
          switch (processor.name) {
            case 'POSaBIT':
              paymentResult = await this.posabit.processPayment(orderData.amount, customer);
              break;
            case 'Aeropay':
              paymentResult = await this.aeropay.processPayment(orderData.amount, customer);
              break;
            case 'Hypur':
              paymentResult = await this.hypur.processPayment(orderData.amount, customer);
              break;
            default:
              paymentResult = {
                success: false,
                error: 'Preferred processor not supported'
              };
          }
        } else {
          paymentResult = {
            success: false,
            error: 'Preferred processor not available'
          };
        }
      } else {
        const defaultProcessor = availableProcessors[0];
        switch (defaultProcessor.name) {
          case 'POSaBIT':
            paymentResult = await this.posabit.processPayment(orderData.amount, customer);
            break;
          case 'Aeropay':
            paymentResult = await this.aeropay.processPayment(orderData.amount, customer);
            break;
          case 'Hypur':
            paymentResult = await this.hypur.processPayment(orderData.amount, customer);
            break;
          default:
            paymentResult = {
              success: false,
              error: 'Payment processor not supported'
            };
        }
      }

      // Update transaction with result
      if (paymentResult.success) {
        await updatePaymentTransaction(
          transactionId,
          'completed',
          paymentResult.transactionId,
          undefined,
          { paymentResult }
        );
      } else {
        await updatePaymentTransaction(
          transactionId,
          'failed',
          paymentResult.transactionId,
          paymentResult.error,
          { paymentResult }
        );
      }

      return paymentResult;
    } catch (error) {
      console.error('Payment processing error:', error);
      
      if (transactionId) {
        await updatePaymentTransaction(
          transactionId,
          'failed',
          undefined,
          error instanceof Error ? error.message : 'Payment processing failed'
        );
      }
      
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
