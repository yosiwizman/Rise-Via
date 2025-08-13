/**
 * Promotions & Coupon System
 * Advanced promotional campaigns, discount codes, and marketing automation
 */

import { sql } from './neon';
import { triggerEmailAutomation } from './email-automation';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping' | 'bundle';
  discount_value: number;
  minimum_order_value?: number;
  maximum_discount?: number;
  applicable_products?: string[]; // product IDs
  applicable_categories?: string[];
  excluded_products?: string[];
  usage_limit?: number;
  usage_limit_per_customer?: number;
  current_usage: number;
  is_active: boolean;
  requires_code: boolean;
  auto_apply: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

export interface CouponCode {
  id: string;
  code: string;
  promotion_id: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  current_usage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  coupon_code_id?: string;
  customer_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
}

export interface CartPromotion {
  promotion: Promotion;
  coupon_code?: string;
  discount_amount: number;
  applicable_items: Array<{
    product_id: string;
    quantity: number;
    original_price: number;
    discounted_price: number;
  }>;
}

export interface AbandonedCart {
  id: string;
  customer_id?: string;
  session_id: string;
  email?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>;
  total_value: number;
  abandoned_at: string;
  recovery_emails_sent: number;
  recovered: boolean;
  recovered_at?: string;
  recovery_order_id?: string;
}

/**
 * Initialize promotions tables
 */
export async function initializePromotionsTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping promotions table initialization');
      return;
    }

    // Promotions table
    await sql`
      CREATE TABLE IF NOT EXISTS promotions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        promotion_type VARCHAR(50) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        minimum_order_value DECIMAL(10,2),
        maximum_discount DECIMAL(10,2),
        applicable_products TEXT[],
        applicable_categories TEXT[],
        excluded_products TEXT[],
        usage_limit INTEGER,
        usage_limit_per_customer INTEGER,
        current_usage INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        requires_code BOOLEAN DEFAULT false,
        auto_apply BOOLEAN DEFAULT false,
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Coupon codes table
    await sql`
      CREATE TABLE IF NOT EXISTS coupon_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        promotion_id UUID NOT NULL,
        usage_limit INTEGER,
        usage_limit_per_customer INTEGER,
        current_usage INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Promotion usage table
    await sql`
      CREATE TABLE IF NOT EXISTS promotion_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        promotion_id UUID NOT NULL,
        coupon_code_id UUID,
        customer_id UUID NOT NULL,
        order_id UUID NOT NULL,
        discount_amount DECIMAL(10,2) NOT NULL,
        used_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Abandoned carts table
    await sql`
      CREATE TABLE IF NOT EXISTS abandoned_carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        session_id VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        items JSONB NOT NULL,
        total_value DECIMAL(10,2) NOT NULL,
        abandoned_at TIMESTAMP DEFAULT NOW(),
        recovery_emails_sent INTEGER DEFAULT 0,
        recovered BOOLEAN DEFAULT false,
        recovered_at TIMESTAMP,
        recovery_order_id UUID
      )
    `;

    // Price alerts table (enhanced from inventory)
    await sql`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        email VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        target_price DECIMAL(10,2) NOT NULL,
        current_price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        triggered_at TIMESTAMP,
        notification_sent BOOLEAN DEFAULT false
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(valid_from, valid_until)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_promotions_auto_apply ON promotions(auto_apply)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupon_codes_promotion ON coupon_codes(promotion_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_promotion_usage_customer ON promotion_usage(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion ON promotion_usage(promotion_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered ON abandoned_carts(recovered)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_product ON price_alerts(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active)`;

    console.log('✅ Promotions tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize promotions tables:', error);
  }
}

/**
 * Create promotion
 */
export async function createPromotion(
  name: string,
  description: string,
  promotionType: Promotion['promotion_type'],
  discountValue: number,
  validFrom: string,
  validUntil: string,
  options: {
    minimumOrderValue?: number;
    maximumDiscount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    usageLimit?: number;
    usageLimitPerCustomer?: number;
    requiresCode?: boolean;
    autoApply?: boolean;
  } = {}
): Promise<Promotion | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const promotions = await sql`
      INSERT INTO promotions (
        name, description, promotion_type, discount_value, valid_from, valid_until,
        minimum_order_value, maximum_discount, applicable_products, applicable_categories,
        excluded_products, usage_limit, usage_limit_per_customer, requires_code, auto_apply
      )
      VALUES (
        ${name}, ${description}, ${promotionType}, ${discountValue}, ${validFrom}, ${validUntil},
        ${options.minimumOrderValue || null}, ${options.maximumDiscount || null},
        ${options.applicableProducts || []}, ${options.applicableCategories || []},
        ${options.excludedProducts || []}, ${options.usageLimit || null},
        ${options.usageLimitPerCustomer || null}, ${options.requiresCode || false},
        ${options.autoApply || false}
      )
      RETURNING *
    ` as Array<Promotion>;

    return promotions.length > 0 ? promotions[0] : null;
  } catch (error) {
    console.error('Failed to create promotion:', error);
    return null;
  }
}

/**
 * Create coupon code
 */
export async function createCouponCode(
  promotionId: string,
  code: string,
  options: {
    usageLimit?: number;
    usageLimitPerCustomer?: number;
  } = {}
): Promise<CouponCode | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const coupons = await sql`
      INSERT INTO coupon_codes (promotion_id, code, usage_limit, usage_limit_per_customer)
      VALUES (${promotionId}, ${code.toUpperCase()}, ${options.usageLimit || null}, ${options.usageLimitPerCustomer || null})
      RETURNING *
    ` as Array<CouponCode>;

    return coupons.length > 0 ? coupons[0] : null;
  } catch (error) {
    console.error('Failed to create coupon code:', error);
    return null;
  }
}

/**
 * Validate coupon code
 */
export async function validateCouponCode(
  code: string,
  customerId?: string,
  cartTotal?: number
): Promise<{ valid: boolean; promotion?: Promotion; error?: string }> {
  try {
    if (!sql) {
      return { valid: false, error: 'Service temporarily unavailable' };
    }

    // Get coupon and promotion
    const coupons = await sql`
      SELECT cc.*, p.*
      FROM coupon_codes cc
      JOIN promotions p ON cc.promotion_id = p.id
      WHERE cc.code = ${code.toUpperCase()} AND cc.is_active = true AND p.is_active = true
    ` as Array<CouponCode & Promotion>;

    if (coupons.length === 0) {
      return { valid: false, error: 'Invalid or expired coupon code' };
    }

    const coupon = coupons[0];

    // Check validity dates
    const now = new Date();
    if (new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'Coupon is not yet valid' };
    }
    if (new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'Coupon has expired' };
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.current_usage >= coupon.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    // Check per-customer usage limit
    if (customerId && coupon.usage_limit_per_customer) {
      const customerUsage = await sql`
        SELECT COUNT(*) as usage_count
        FROM promotion_usage
        WHERE promotion_id = ${coupon.promotion_id} AND customer_id = ${customerId}
      ` as Array<{ usage_count: number }>;

      if (customerUsage[0]?.usage_count >= coupon.usage_limit_per_customer) {
        return { valid: false, error: 'You have reached the usage limit for this coupon' };
      }
    }

    // Check minimum order value
    if (cartTotal && coupon.minimum_order_value && cartTotal < coupon.minimum_order_value) {
      return { 
        valid: false, 
        error: `Minimum order value of $${coupon.minimum_order_value} required` 
      };
    }

    return { valid: true, promotion: coupon };
  } catch (error) {
    console.error('Failed to validate coupon code:', error);
    return { valid: false, error: 'Failed to validate coupon code' };
  }
}

/**
 * Apply promotions to cart
 */
export async function applyPromotionsToCart(
  cartItems: Array<{
    product_id: string;
    product_name: string;
    category: string;
    quantity: number;
    price: number;
  }>,
  customerId?: string,
  couponCode?: string
): Promise<{
  appliedPromotions: CartPromotion[];
  totalDiscount: number;
  finalTotal: number;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return { appliedPromotions: [], totalDiscount: 0, finalTotal: 0 };
    }

    const appliedPromotions: CartPromotion[] = [];
    let totalDiscount = 0;
    const originalTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get applicable promotions
    let promotions: Promotion[] = [];

    if (couponCode) {
      // Validate and get coupon-based promotion
      const validation = await validateCouponCode(couponCode, customerId, originalTotal);
      if (validation.valid && validation.promotion) {
        promotions.push(validation.promotion);
      }
    }

    // Get auto-apply promotions
    const autoPromotions = await sql`
      SELECT * FROM promotions 
      WHERE is_active = true 
      AND auto_apply = true 
      AND requires_code = false
      AND valid_from <= NOW() 
      AND valid_until >= NOW()
      AND (usage_limit IS NULL OR current_usage < usage_limit)
    ` as Array<Promotion>;

    promotions.push(...autoPromotions);

    // Apply each promotion
    for (const promotion of promotions) {
      const cartPromotion = await calculatePromotionDiscount(promotion, cartItems, customerId);
      if (cartPromotion && cartPromotion.discount_amount > 0) {
        appliedPromotions.push(cartPromotion);
        totalDiscount += cartPromotion.discount_amount;
      }
    }

    const finalTotal = Math.max(0, originalTotal - totalDiscount);

    return {
      appliedPromotions,
      totalDiscount,
      finalTotal
    };
  } catch (error) {
    console.error('Failed to apply promotions to cart:', error);
    return { appliedPromotions: [], totalDiscount: 0, finalTotal: 0 };
  }
}

/**
 * Calculate promotion discount for cart
 */
async function calculatePromotionDiscount(
  promotion: Promotion,
  cartItems: Array<{
    product_id: string;
    product_name: string;
    category: string;
    quantity: number;
    price: number;
  }>,
  customerId?: string
): Promise<CartPromotion | null> {
  try {
    // Check customer usage limit
    if (customerId && promotion.usage_limit_per_customer) {
      const customerUsage = await sql`
        SELECT COUNT(*) as usage_count
        FROM promotion_usage
        WHERE promotion_id = ${promotion.id} AND customer_id = ${customerId}
      ` as Array<{ usage_count: number }>;

      if (customerUsage[0]?.usage_count >= promotion.usage_limit_per_customer) {
        return null;
      }
    }

    // Filter applicable items
    const applicableItems = cartItems.filter(item => {
      // Check if product is excluded
      if (promotion.excluded_products?.includes(item.product_id)) {
        return false;
      }

      // Check if specific products are required
      if (promotion.applicable_products && promotion.applicable_products.length > 0) {
        return promotion.applicable_products.includes(item.product_id);
      }

      // Check if specific categories are required
      if (promotion.applicable_categories && promotion.applicable_categories.length > 0) {
        return promotion.applicable_categories.includes(item.category);
      }

      return true;
    });

    if (applicableItems.length === 0) {
      return null;
    }

    const applicableTotal = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check minimum order value
    if (promotion.minimum_order_value && applicableTotal < promotion.minimum_order_value) {
      return null;
    }

    let discountAmount = 0;
    const discountedItems = applicableItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      original_price: item.price,
      discounted_price: item.price
    }));

    // Calculate discount based on promotion type
    switch (promotion.promotion_type) {
      case 'percentage':
        discountAmount = applicableTotal * (promotion.discount_value / 100);
        if (promotion.maximum_discount) {
          discountAmount = Math.min(discountAmount, promotion.maximum_discount);
        }
        break;

      case 'fixed_amount':
        discountAmount = Math.min(promotion.discount_value, applicableTotal);
        break;

      case 'free_shipping':
        // This would be handled at checkout level
        discountAmount = 0; // Shipping discount handled separately
        break;

      case 'buy_x_get_y':
        // Simplified buy X get Y logic
        const buyQuantity = Math.floor(promotion.discount_value); // X
        const getQuantity = 1; // Y (simplified to 1)
        
        for (const item of applicableItems) {
          const eligibleSets = Math.floor(item.quantity / buyQuantity);
          const freeItems = Math.min(eligibleSets * getQuantity, item.quantity);
          discountAmount += freeItems * item.price;
        }
        break;

      default:
        return null;
    }

    if (discountAmount <= 0) {
      return null;
    }

    return {
      promotion,
      discount_amount: Math.round(discountAmount * 100) / 100,
      applicable_items: discountedItems
    };
  } catch (error) {
    console.error('Failed to calculate promotion discount:', error);
    return null;
  }
}

/**
 * Record promotion usage
 */
export async function recordPromotionUsage(
  promotionId: string,
  customerId: string,
  orderId: string,
  discountAmount: number,
  couponCodeId?: string
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping promotion usage recording');
      return;
    }

    // Record usage
    await sql`
      INSERT INTO promotion_usage (promotion_id, coupon_code_id, customer_id, order_id, discount_amount)
      VALUES (${promotionId}, ${couponCodeId || null}, ${customerId}, ${orderId}, ${discountAmount})
    `;

    // Update promotion usage count
    await sql`
      UPDATE promotions 
      SET current_usage = current_usage + 1,
          updated_at = NOW()
      WHERE id = ${promotionId}
    `;

    // Update coupon usage count if applicable
    if (couponCodeId) {
      await sql`
        UPDATE coupon_codes 
        SET current_usage = current_usage + 1,
            updated_at = NOW()
        WHERE id = ${couponCodeId}
      `;
    }
  } catch (error) {
    console.error('Failed to record promotion usage:', error);
  }
}

/**
 * Track abandoned cart
 */
export async function trackAbandonedCart(
  sessionId: string,
  cartItems: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>,
  customerId?: string,
  email?: string
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping abandoned cart tracking');
      return;
    }

    if (cartItems.length === 0) return;

    const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Upsert abandoned cart
    await sql`
      INSERT INTO abandoned_carts (customer_id, session_id, email, items, total_value)
      VALUES (${customerId || null}, ${sessionId}, ${email || null}, ${JSON.stringify(cartItems)}, ${totalValue})
      ON CONFLICT (session_id) DO UPDATE SET
        customer_id = EXCLUDED.customer_id,
        email = EXCLUDED.email,
        items = EXCLUDED.items,
        total_value = EXCLUDED.total_value,
        abandoned_at = NOW()
    `;
  } catch (error) {
    console.error('Failed to track abandoned cart:', error);
  }
}

/**
 * Process abandoned cart recovery
 */
export async function processAbandonedCartRecovery(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping abandoned cart recovery');
      return;
    }

    // Get abandoned carts that need recovery emails
    const abandonedCarts = await sql`
      SELECT * FROM abandoned_carts 
      WHERE recovered = false 
      AND email IS NOT NULL
      AND abandoned_at < NOW() - INTERVAL '1 hour'
      AND recovery_emails_sent < 3
      AND (
        (recovery_emails_sent = 0 AND abandoned_at < NOW() - INTERVAL '1 hour') OR
        (recovery_emails_sent = 1 AND abandoned_at < NOW() - INTERVAL '24 hours') OR
        (recovery_emails_sent = 2 AND abandoned_at < NOW() - INTERVAL '72 hours')
      )
    ` as Array<AbandonedCart>;

    for (const cart of abandonedCarts) {
      // Create recovery discount code
      const recoveryCode = `COMEBACK${Date.now().toString(36).toUpperCase()}`;
      
      // Create a 10% discount promotion for cart recovery
      const promotion = await createPromotion(
        `Cart Recovery - ${cart.id}`,
        'Special discount for abandoned cart recovery',
        'percentage',
        10,
        new Date().toISOString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        {
          usageLimit: 1,
          usageLimitPerCustomer: 1,
          requiresCode: true
        }
      );

      if (promotion) {
        await createCouponCode(promotion.id, recoveryCode, { usageLimit: 1 });
      }

      // Send recovery email
      await triggerEmailAutomation('cart_abandoned', cart.email!, {
        firstName: 'Valued Customer',
        cartItems: JSON.stringify(cart.items),
        cartTotal: cart.total_value.toString(),
        recoveryCode: recoveryCode,
        recoveryUrl: `${process.env.VITE_APP_URL || 'https://rise-via.vercel.app'}/cart?recovery=${cart.id}&code=${recoveryCode}`
      });

      // Update recovery email count
      await sql`
        UPDATE abandoned_carts 
        SET recovery_emails_sent = recovery_emails_sent + 1
        WHERE id = ${cart.id}
      `;
    }

    console.log(`Processed ${abandonedCarts.length} abandoned cart recovery emails`);
  } catch (error) {
    console.error('Failed to process abandoned cart recovery:', error);
  }
}

/**
 * Mark cart as recovered
 */
export async function markCartAsRecovered(
  sessionId: string,
  orderId: string
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping cart recovery marking');
      return;
    }

    await sql`
      UPDATE abandoned_carts 
      SET recovered = true,
          recovered_at = NOW(),
          recovery_order_id = ${orderId}
      WHERE session_id = ${sessionId}
    `;
  } catch (error) {
    console.error('Failed to mark cart as recovered:', error);
  }
}

/**
 * Create price alert
 */
export async function createPriceAlert(
  email: string,
  productId: string,
  productName: string,
  targetPrice: number,
  currentPrice: number,
  customerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Service temporarily unavailable' };
    }

    // Check if alert already exists
    const existing = await sql`
      SELECT id FROM price_alerts 
      WHERE email = ${email} AND product_id = ${productId} AND is_active = true
    `;

    if (existing.length > 0) {
      return { success: false, error: 'Price alert already exists for this product' };
    }

    await sql`
      INSERT INTO price_alerts (customer_id, email, product_id, product_name, target_price, current_price)
      VALUES (${customerId || null}, ${email}, ${productId}, ${productName}, ${targetPrice}, ${currentPrice})
    `;

    return { success: true };
  } catch (error) {
    console.error('Failed to create price alert:', error);
    return { success: false, error: 'Failed to create price alert' };
  }
}

/**
 * Check and trigger price alerts
 */
export async function checkPriceAlerts(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping price alerts check');
      return;
    }

    // This would typically integrate with your product pricing system
    // For now, we'll simulate checking against current product prices
    
    const alerts = await sql`
      SELECT pa.*, p.price as current_product_price
      FROM price_alerts pa
      LEFT JOIN products p ON pa.product_id = p.id
      WHERE pa.is_active = true 
      AND pa.notification_sent = false
      AND p.price <= pa.target_price
    ` as Array<{
      id: string;
      email: string;
      product_id: string;
      product_name: string;
      target_price: number;
      current_product_price: number;
    }>;

    for (const alert of alerts) {
      // Send price alert email
      await triggerEmailAutomation('price_alert', alert.email, {
        productName: alert.product_name,
        targetPrice: alert.target_price.toString(),
        currentPrice: alert.current_product_price.toString(),
        productUrl: `${process.env.VITE_APP_URL || 'https://rise-via.vercel.app'}/products/${alert.product_id}`
      });

      // Mark as notified
      await sql`
        UPDATE price_alerts 
        SET notification_sent = true,
            triggered_at = NOW()
        WHERE id = ${alert.id}
      `;
    }

    console.log(`Triggered ${alerts.length} price alerts`);
  } catch (error) {
    console.error('Failed to check price alerts:', error);
  }
}

/**
 * Get promotion analytics
 */
export async function getPromotionAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  totalPromotions: number;
  activePromotions: number;
  totalDiscountGiven: number;
  totalUsage: number;
  topPromotions: Array<{ name: string; usage: number; discount_given: number }>;
  conversionRate: number;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return {
        totalPromotions: 0,
        activePromotions: 0,
        totalDiscountGiven: 0,
        totalUsage: 0,
        topPromotions: [],
        conversionRate: 0
      };
    }

    // Get overall stats
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_promotions,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_promotions
      FROM promotions
    ` as Array<{ total_promotions: number; active_promotions: number }>;

    // Get usage stats
    const usageStats = await sql`
      SELECT 
        COUNT(*) as total_usage,
        SUM(discount_amount) as total_discount_given
      FROM promotion_usage
      WHERE used_at BETWEEN ${startDate} AND ${endDate}
    ` as Array<{ total_usage: number; total_discount_given: number }>;

    // Get top promotions
    const topPromotions = await sql`
      SELECT 
        p.name,
        COUNT(pu.id) as usage,
        SUM(pu.discount_amount) as discount_given
      FROM promotions p
      LEFT JOIN promotion_usage pu ON p.id = pu.promotion_id
      WHERE pu.used_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY p.id, p.name
      ORDER BY usage DESC
      LIMIT 10
    ` as Array<{ name: string; usage: number; discount_given: number }>;

    const stats = overallStats[0] || { total_promotions: 0, active_promotions: 0 };
    const usage = usageStats[0] || { total_usage: 0, total_discount_given: 0 };

    return {
      totalPromotions: stats.total_promotions,
      activePromotions: stats.active_promotions,
      totalDiscountGiven: usage.total_discount_given || 0,
      totalUsage: usage.total_usage,
      topPromotions: topPromotions || [],
      conversionRate: 0 // Would need more complex calculation
    };
  } catch (error) {
    console.error('Failed to get promotion analytics:', error);
    return {
      totalPromotions: 0,
      activePromotions: 0,
      totalDiscountGiven: 0,
      totalUsage: 0,
      topPromotions: [],
      conversionRate: 0
    };
  }
}

// Initialize promotions tables on module load
initializePromotionsTables();

// Run abandoned cart recovery every hour
setInterval(processAbandonedCartRecovery, 60 * 60 * 1000);

// Check price alerts every 6 hours
setInterval(checkPriceAlerts, 6 * 60 * 60 * 1000);