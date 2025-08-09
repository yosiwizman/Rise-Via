import { cartAnalytics } from '../analytics/cartAnalytics';
import { emailService } from './emailService';

interface AbandonedCart {
  sessionId: string;
  userId?: string;
  email?: string;
  customerName?: string;
  items: any[];
  totalValue: number;
  abandonedAt: number;
  emailsSent: string[];
  discountCode?: string;
}

interface EmailSequenceConfig {
  type: string;
  delay: number;
  subject: string;
  discount?: number;
  template: string;
}

class AbandonedCartService {
  private static instance: AbandonedCartService;
  private readonly STORAGE_KEY = 'abandoned_carts';
  private readonly CHECK_INTERVAL = 5 * 60 * 1000;

  private emailSequence: EmailSequenceConfig[] = [
    {
      type: 'reminder',
      delay: 30 * 60 * 1000,
      subject: 'You left something in your cart!',
      template: 'cart_reminder'
    },
    {
      type: 'discount_10',
      delay: 2 * 60 * 60 * 1000,
      subject: 'Complete your order and save 10%',
      discount: 10,
      template: 'cart_discount_10'
    },
    {
      type: 'discount_15',
      delay: 24 * 60 * 60 * 1000,
      subject: 'Last chance - 15% off your cart',
      discount: 15,
      template: 'cart_discount_15'
    },
    {
      type: 'final_offer',
      delay: 7 * 24 * 60 * 60 * 1000,
      subject: 'Final offer - Your cart is waiting',
      discount: 20,
      template: 'cart_final_offer'
    }
  ];

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): AbandonedCartService {
    if (!AbandonedCartService.instance) {
      AbandonedCartService.instance = new AbandonedCartService();
    }
    return AbandonedCartService.instance;
  }

  private startMonitoring() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.checkAbandonedCarts();
      }, this.CHECK_INTERVAL);
    }
  }

  public trackCartActivity(customerEmail?: string, customerName?: string) {
    const cartData = this.getCurrentCartData();
    if (cartData.items.length > 0) {
      this.updateAbandonmentTimer(cartData, customerEmail, customerName);
    }
  }

  public trackCheckoutStart() {
    const cartData = this.getCurrentCartData();
    if (cartData.items.length > 0) {
      this.removeAbandonedCart(cartData.sessionId);
      cartAnalytics.trackCartEvent('checkout_start', undefined, {
        totalValue: cartData.stats.totalValue,
        itemCount: cartData.items.length
      });
    }
  }

  private getCurrentCartData() {
    const cartState = JSON.parse(localStorage.getItem('risevia-cart') || '{}');
    return {
      items: cartState.state?.items || [],
      stats: cartState.state?.stats || {},
      sessionId: sessionStorage.getItem('risevia_session_id') || crypto.randomUUID(),
      userId: localStorage.getItem('risevia_user_id') || ''
    };
  }

  private updateAbandonmentTimer(cartData: any, email?: string, customerName?: string) {
    const abandonedCarts = this.getAbandonedCarts();
    const existingCartIndex = abandonedCarts.findIndex(cart => cart.sessionId === cartData.sessionId);

    const cartInfo: AbandonedCart = {
      sessionId: cartData.sessionId,
      userId: cartData.userId,
      email: email,
      customerName: customerName,
      items: cartData.items,
      totalValue: cartData.stats.totalValue || 0,
      abandonedAt: Date.now(),
      emailsSent: existingCartIndex >= 0 ? abandonedCarts[existingCartIndex].emailsSent : []
    };

    if (existingCartIndex >= 0) {
      abandonedCarts[existingCartIndex] = cartInfo;
    } else {
      abandonedCarts.push(cartInfo);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(abandonedCarts));
  }

  private getAbandonedCarts(): AbandonedCart[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private removeAbandonedCart(sessionId: string) {
    const abandonedCarts = this.getAbandonedCarts();
    const filteredCarts = abandonedCarts.filter(cart => cart.sessionId !== sessionId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCarts));
  }

  private async checkAbandonedCarts() {
    const abandonedCarts = this.getAbandonedCarts();
    const now = Date.now();

    for (const cart of abandonedCarts) {
      if (!cart.email) continue;

      const timeSinceAbandoned = now - cart.abandonedAt;

      for (const emailConfig of this.emailSequence) {
        if (timeSinceAbandoned >= emailConfig.delay && !cart.emailsSent.includes(emailConfig.type)) {
          await this.sendAbandonedCartEmail(cart, emailConfig);
          break;
        }
      }
    }
  }

  private async sendAbandonedCartEmail(cart: AbandonedCart, emailConfig: EmailSequenceConfig) {
    try {
      const discountCode = emailConfig.discount ? this.generateDiscountCode(emailConfig.discount) : undefined;
      
      await this.sendEmailViaResend(cart, emailConfig, discountCode);
      
      cart.emailsSent.push(emailConfig.type);
      if (discountCode) {
        cart.discountCode = discountCode;
      }

      const abandonedCarts = this.getAbandonedCarts();
      const index = abandonedCarts.findIndex(c => c.sessionId === cart.sessionId);
      if (index !== -1) {
        abandonedCarts[index] = cart;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(abandonedCarts));
      }

      console.log(`Sent abandoned cart email: ${emailConfig.type} to ${cart.email}`);
    } catch (error) {
      console.error(`Failed to send abandoned cart email (${emailConfig.type}):`, error);
    }
  }

  private generateDiscountCode(discount: number): string {
    const prefix = 'CART';
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${discount}${suffix}`;
  }

  private async sendEmailViaResend(cart: AbandonedCart, _emailConfig: EmailSequenceConfig, _discountCode?: string) {
    return emailService.sendOrderConfirmation(cart.email!, {
      orderNumber: `CART-${cart.sessionId.slice(-8)}`,
      total: cart.totalValue
    });
  }

  public getAbandonedCartStats() {
    const carts = this.getAbandonedCarts();
    return {
      totalAbandoned: carts.length,
      totalValue: carts.reduce((sum, cart) => sum + cart.totalValue, 0),
      emailsSent: carts.reduce((sum, cart) => sum + cart.emailsSent.length, 0),
      averageCartValue: carts.length > 0 ? carts.reduce((sum, cart) => sum + cart.totalValue, 0) / carts.length : 0
    };
  }
}

export const abandonedCartService = AbandonedCartService.getInstance();
export type { AbandonedCart, EmailSequenceConfig };
