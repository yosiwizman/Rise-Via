import { sql } from '../lib/neon';

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
  async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResult> {
    try {
      const result = await sql`
        SELECT * FROM coupons 
        WHERE code = ${code} 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses IS NULL OR current_uses < max_uses)
        AND (min_order_amount IS NULL OR ${orderAmount} >= min_order_amount)
      `;
      
      const coupon = result[0];
      
      if (!coupon) {
        return {
          isValid: false,
          error: 'Invalid or expired coupon code'
        };
      }

      const discountAmount = coupon.discount_type === 'percentage' 
        ? (orderAmount * coupon.discount_value) / 100
        : coupon.discount_value;

      const finalDiscountAmount = Math.min(discountAmount, orderAmount);

      return {
        isValid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discount_type,
          discountValue: coupon.discount_value,
          minOrderAmount: coupon.min_order_amount,
          maxUses: coupon.max_uses,
          currentUses: coupon.current_uses,
          expiresAt: coupon.expires_at,
          createdAt: coupon.created_at,
          isActive: coupon.is_active
        },
        discountAmount: finalDiscountAmount
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        error: 'Failed to validate coupon. Please try again.'
      };
    }
  },

  async applyCoupon(code: string): Promise<void> {
    try {
      await sql`UPDATE coupons SET current_uses = current_uses + 1 WHERE code = ${code}`;
    } catch (error) {
      console.error('Error applying coupon:', error);
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
