import { PaymentProvider } from './payments/PaymentProvider';
import { POSaBITProvider } from './payments/POSaBIT';
import { AeropayProvider } from './payments/Aeropay';
import { HypurProvider } from './payments/Hypur';
import { StripeProvider } from './payments/Stripe';
import { validateShippingState } from '../utils/stateBlocking';

export type PaymentProviderType = 'posabit' | 'aeropay' | 'hypur' | 'stripe';

interface PaymentConfig {
  provider: PaymentProviderType;
  apiKey: string;
  testMode: boolean;
  enabledStates?: string[];
}

class PaymentService {
  private providers: Map<PaymentProviderType, PaymentProvider> = new Map();
  private activeProvider: PaymentProviderType = 'posabit';
  private config: PaymentConfig | null = null;

  async initialize(config: PaymentConfig) {
    this.config = config;
    this.activeProvider = config.provider;

    if (config.provider === 'posabit') {
      this.providers.set('posabit', new POSaBITProvider(config.apiKey, config.testMode));
    } else if (config.provider === 'aeropay') {
      this.providers.set('aeropay', new AeropayProvider(config.apiKey, config.testMode));
    } else if (config.provider === 'hypur') {
      this.providers.set('hypur', new HypurProvider(config.apiKey, config.testMode));
    } else if (config.provider === 'stripe') {
      this.providers.set('stripe', new StripeProvider(config.apiKey, config.testMode));
    }
  }

  async processPayment(amount: number, customer: { email: string; name: string; address: { street: string; city: string; state: string; zipCode: string; } }, userState: string) {
    const stateValidation = validateShippingState(userState);
    if (!stateValidation.isValid) {
      return {
        success: false,
        error: stateValidation.message
      };
    }

    if (this.config?.enabledStates && !this.config.enabledStates.includes(userState)) {
      return {
        success: false,
        error: `Payment method not available in ${userState}`
      };
    }

    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      return {
        success: false,
        error: 'Payment provider not configured'
      };
    }

    return await provider.processPayment(amount, customer);
  }

  async refund(transactionId: string) {
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      return {
        success: false,
        error: 'Payment provider not configured'
      };
    }

    return await provider.refund(transactionId);
  }

  getActiveProvider(): PaymentProvider | undefined {
    return this.providers.get(this.activeProvider);
  }

  getActiveProviderName(): string {
    return this.activeProvider;
  }

  loadConfigFromStorage(): PaymentConfig | null {
    try {
      const stored = localStorage.getItem('payment_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load payment config:', error);
    }
    return null;
  }

  async initializeFromStorage() {
    const config = this.loadConfigFromStorage();
    if (config) {
      await this.initialize(config);
    }
  }
}

export const paymentService = new PaymentService();
