
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses: number;
  expiresAt?: string;
  createdAt: string;
  isActive: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
}

export const couponService = {
  async validateCoupon(): Promise<CouponValidationResult> {
    try {
      return {
        isValid: false,
        error: 'Invalid or expired coupon code'
      };
    } catch {
      return {
        isValid: false,
        error: 'Failed to validate coupon. Please try again.'
      };
    }
  },

  async applyCoupon(code: string): Promise<void> {
    try {
      console.log('Applying coupon:', code);
    } catch {
      throw new Error('Failed to apply coupon');
    }
  },

  calculateDiscount(coupon: Coupon, orderAmount: number): number {
    if (coupon.discountType === 'percentage') {
      return Math.min((orderAmount * coupon.discountValue) / 100, orderAmount);
    } else {
      return Math.min(coupon.discountValue, orderAmount);
    }
  },

  formatDiscountDisplay(coupon: Coupon): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% off`;
    } else {
      return `$${coupon.discountValue.toFixed(2)} off`;
    }
  },

  getMockCoupons(): Coupon[] {
    return [
      {
        id: '1',
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 50,
        maxUses: 1000,
        currentUses: 245,
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        code: 'SAVE20',
        discountType: 'fixed',
        discountValue: 20,
        minOrderAmount: 100,
        maxUses: 500,
        currentUses: 123,
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '3',
        code: 'FIRST15',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 75,
        maxUses: 200,
        currentUses: 67,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '4',
        code: 'HEMP25',
        discountType: 'fixed',
        discountValue: 25,
        minOrderAmount: 150,
        maxUses: 100,
        currentUses: 34,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
  }
};

export default couponService;
