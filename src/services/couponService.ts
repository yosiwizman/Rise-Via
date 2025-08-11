const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (!strings || !strings.length) {
      console.log('Mock SQL Query (couponService): strings is undefined or empty');
      return Promise.resolve([]);
    }
    const query = strings.join('?');
    console.log('Mock SQL Query (couponService):', query, values);
    
    if (query.includes('coupons')) {
      return Promise.resolve([{
        id: 'mock-coupon-id',
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 50,
        max_uses: 1000,
        current_uses: 245,
        expires_at: null,
        created_at: new Date().toISOString(),
        is_active: true
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

/**
 * Domain model (camelCase) used inside the app.
 */
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

/**
 * Maps a raw DB row (snake_case) to the internal camelCase Coupon interface.
 */
function mapRowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: row.id as string,
    code: row.code as string,
    discountType: row.discount_type as 'percentage' | 'fixed',
    discountValue: Number(row.discount_value),
    minOrderAmount: row.min_order_amount != null ? Number(row.min_order_amount) : undefined,
    maxUses: row.max_uses != null ? Number(row.max_uses) : undefined,
    currentUses: Number(row.current_uses),
    expiresAt: row.expires_at ? new Date(row.expires_at as string).toISOString() : undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
    isActive: row.is_active as boolean
  };
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export const couponService = {
  /**
   * Validate a coupon code against current order amount.
   * Falls back to mock coupons if DB query fails.
   */
  async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResult> {
    const normalized = normalizeCode(code);
    if (!normalized) {
      return { isValid: false, error: 'Coupon code is required' };
    }

    try {
      if (!sql) {
        console.warn('⚠️ Database not available, falling back to mock coupons');
        throw new Error('Database unavailable');
      }

      const result = await sql/* sql */`
        SELECT *
        FROM coupons
        WHERE code = ${normalized}
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses IS NULL OR current_uses < max_uses)
          AND (min_order_amount IS NULL OR ${orderAmount} >= min_order_amount)
        LIMIT 1;
      `;

      const row = result[0];
      if (!row) {
        return { isValid: false, error: 'Invalid or expired coupon code' };
      }

      const coupon = mapRowToCoupon(row);
      const discountAmount = this.calculateDiscount(coupon, orderAmount);

      return {
        isValid: true,
        coupon,
        discountAmount
      };
    } catch {
      // Graceful fallback: try mock coupons (useful in local dev or if Neon unavailable)
      try {
        const mock = this.getMockCoupons().find(c =>
          c.code === normalized &&
          c.isActive &&
          (!c.expiresAt || new Date(c.expiresAt).getTime() > Date.now()) &&
          (!c.minOrderAmount || orderAmount >= c.minOrderAmount) &&
          (!c.maxUses || c.currentUses < c.maxUses)
        );

        if (!mock) {
          return {
            isValid: false,
            error: 'Invalid or expired coupon code'
          };
        }

        return {
          isValid: true,
            coupon: mock,
          discountAmount: this.calculateDiscount(mock, orderAmount)
        };
      } catch {
        return {
          isValid: false,
          error: 'Failed to validate coupon. Please try again.'
        };
      }
    }
  },

  /**
   * Increment usage count for a coupon (DB only; mock coupons ignored).
   */
  async applyCoupon(code: string): Promise<void> {
    const normalized = normalizeCode(code);
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot apply coupon');
        throw new Error('Database unavailable');
      }

      await sql/* sql */`
        UPDATE coupons
        SET current_uses = current_uses + 1
        WHERE code = ${normalized}
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > NOW());
      `;
    } catch {
      throw new Error('Failed to apply coupon');
    }
  },

  calculateDiscount(coupon: Coupon, orderAmount: number): number {
    if (orderAmount <= 0) return 0;
    if (coupon.discountType === 'percentage') {
      return Math.min((orderAmount * coupon.discountValue) / 100, orderAmount);
    }
    return Math.min(coupon.discountValue, orderAmount);
  },

  formatDiscountDisplay(coupon: Coupon): string {
    return coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% off`
      : `$${coupon.discountValue.toFixed(2)} off`;
  },

  /**
   * Mock data (for local development or fallback when Neon is unavailable).
   */
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
