import { sql } from '../../lib/neon';

export interface PriceTier {
  id: string;
  name: string;
  min_quantity: number;
  max_quantity?: number;
  discount_percentage: number;
  is_active: boolean;
}

export interface CustomerPricing {
  customer_id: string;
  product_id?: string;
  category?: string;
  price_override?: number;
  discount_percentage?: number;
  valid_from?: string;
  valid_to?: string;
}

export interface ContractPricing {
  id: string;
  business_account_id: string;
  contract_number: string;
  pricing_rules: any;
  valid_from: string;
  valid_to: string;
  status: 'active' | 'pending' | 'expired';
  created_at: string;
}

export interface PriceCalculation {
  base_price: number;
  quantity: number;
  tier_discount: number;
  customer_discount: number;
  contract_discount: number;
  promotional_discount: number;
  final_price: number;
  unit_price: number;
  total_savings: number;
}

class B2BPricingService {
  private static instance: B2BPricingService;

  public static getInstance(): B2BPricingService {
    if (!B2BPricingService.instance) {
      B2BPricingService.instance = new B2BPricingService();
    }
    return B2BPricingService.instance;
  }

  /**
   * Calculate B2B price for a product
   */
  async calculateB2BPrice(
    productId: string,
    quantity: number,
    businessAccountId: string
  ): Promise<PriceCalculation> {
    try {
      // Get base product price
      const productResult = await sql`
        SELECT price, category FROM products WHERE id = ${productId}
      `;
      
      if (!productResult || productResult.length === 0) {
        throw new Error('Product not found');
      }

      const basePrice = productResult[0].price;
      const category = productResult[0].category;

      // Initialize calculation
      const calculation: PriceCalculation = {
        base_price: basePrice,
        quantity: quantity,
        tier_discount: 0,
        customer_discount: 0,
        contract_discount: 0,
        promotional_discount: 0,
        final_price: basePrice * quantity,
        unit_price: basePrice,
        total_savings: 0
      };

      // Apply volume tier discount
      const tierDiscount = await this.getVolumeTierDiscount(quantity);
      calculation.tier_discount = tierDiscount;

      // Apply customer-specific discount
      const customerDiscount = await this.getCustomerDiscount(businessAccountId, productId, category);
      calculation.customer_discount = customerDiscount;

      // Apply contract pricing if exists
      const contractDiscount = await this.getContractDiscount(businessAccountId, productId);
      calculation.contract_discount = contractDiscount;

      // Apply promotional discounts
      const promoDiscount = await this.getPromotionalDiscount(productId, businessAccountId);
      calculation.promotional_discount = promoDiscount;

      // Calculate final price
      const totalDiscountPercentage = Math.min(
        tierDiscount + customerDiscount + contractDiscount + promoDiscount,
        50 // Max 50% discount
      );

      const discountAmount = (basePrice * quantity * totalDiscountPercentage) / 100;
      calculation.final_price = (basePrice * quantity) - discountAmount;
      calculation.unit_price = calculation.final_price / quantity;
      calculation.total_savings = discountAmount;

      return calculation;
    } catch (error) {
      console.error('Error calculating B2B price:', error);
      return {
        base_price: 0,
        quantity: quantity,
        tier_discount: 0,
        customer_discount: 0,
        contract_discount: 0,
        promotional_discount: 0,
        final_price: 0,
        unit_price: 0,
        total_savings: 0
      };
    }
  }

  /**
   * Get volume tier discount based on quantity
   */
  async getVolumeTierDiscount(quantity: number): Promise<number> {
    try {
      const result = await sql`
        SELECT discount_percentage FROM price_tiers
        WHERE is_active = true
        AND min_quantity <= ${quantity}
        AND (max_quantity IS NULL OR max_quantity >= ${quantity})
        ORDER BY discount_percentage DESC
        LIMIT 1
      `;

      return result && result.length > 0 ? result[0].discount_percentage : 0;
    } catch (error) {
      console.error('Error getting volume tier discount:', error);
      return 0;
    }
  }

  /**
   * Get customer-specific discount
   */
  async getCustomerDiscount(
    businessAccountId: string,
    productId?: string,
    category?: string
  ): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Check for product-specific discount
      if (productId) {
        const productDiscount = await sql`
          SELECT discount_percentage FROM customer_pricing
          WHERE customer_id = ${businessAccountId}
          AND product_id = ${productId}
          AND (valid_from IS NULL OR valid_from <= ${now})
          AND (valid_to IS NULL OR valid_to >= ${now})
          LIMIT 1
        `;

        if (productDiscount && productDiscount.length > 0) {
          return productDiscount[0].discount_percentage || 0;
        }
      }

      // Check for category discount
      if (category) {
        const categoryDiscount = await sql`
          SELECT discount_percentage FROM customer_pricing
          WHERE customer_id = ${businessAccountId}
          AND category = ${category}
          AND (valid_from IS NULL OR valid_from <= ${now})
          AND (valid_to IS NULL OR valid_to >= ${now})
          LIMIT 1
        `;

        if (categoryDiscount && categoryDiscount.length > 0) {
          return categoryDiscount[0].discount_percentage || 0;
        }
      }

      // Check for general customer discount
      const generalDiscount = await sql`
        SELECT discount_percentage FROM customer_pricing
        WHERE customer_id = ${businessAccountId}
        AND product_id IS NULL
        AND category IS NULL
        AND (valid_from IS NULL OR valid_from <= ${now})
        AND (valid_to IS NULL OR valid_to >= ${now})
        LIMIT 1
      `;

      return generalDiscount && generalDiscount.length > 0 
        ? generalDiscount[0].discount_percentage || 0 
        : 0;
    } catch (error) {
      console.error('Error getting customer discount:', error);
      return 0;
    }
  }

  /**
   * Get contract-based discount
   */
  async getContractDiscount(
    businessAccountId: string,
    productId: string
  ): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const result = await sql`
        SELECT pricing_rules FROM contract_pricing
        WHERE business_account_id = ${businessAccountId}
        AND status = 'active'
        AND valid_from <= ${now}
        AND valid_to >= ${now}
        LIMIT 1
      `;

      if (result && result.length > 0) {
        const rules = result[0].pricing_rules;
        
        // Check if product has specific contract discount
        if (rules.products && rules.products[productId]) {
          return rules.products[productId].discount || 0;
        }
        
        // Return general contract discount
        return rules.general_discount || 0;
      }

      return 0;
    } catch (error) {
      console.error('Error getting contract discount:', error);
      return 0;
    }
  }

  /**
   * Get promotional discount
   */
  async getPromotionalDiscount(
    productId: string,
    businessAccountId: string
  ): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const result = await sql`
        SELECT discount_percentage FROM promotions
        WHERE is_active = true
        AND (product_ids IS NULL OR ${productId} = ANY(product_ids))
        AND (customer_ids IS NULL OR ${businessAccountId} = ANY(customer_ids))
        AND valid_from <= ${now}
        AND valid_to >= ${now}
        ORDER BY discount_percentage DESC
        LIMIT 1
      `;

      return result && result.length > 0 ? result[0].discount_percentage : 0;
    } catch (error) {
      console.error('Error getting promotional discount:', error);
      return 0;
    }
  }

  /**
   * Create or update customer pricing
   */
  async setCustomerPricing(
    businessAccountId: string,
    pricing: Partial<CustomerPricing>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sql`
        INSERT INTO customer_pricing (
          customer_id, product_id, category, price_override,
          discount_percentage, valid_from, valid_to
        ) VALUES (
          ${businessAccountId}, ${pricing.product_id || null},
          ${pricing.category || null}, ${pricing.price_override || null},
          ${pricing.discount_percentage || 0}, ${pricing.valid_from || null},
          ${pricing.valid_to || null}
        )
        ON CONFLICT (customer_id, COALESCE(product_id, '00000000-0000-0000-0000-000000000000'), COALESCE(category, ''))
        DO UPDATE SET
          price_override = EXCLUDED.price_override,
          discount_percentage = EXCLUDED.discount_percentage,
          valid_from = EXCLUDED.valid_from,
          valid_to = EXCLUDED.valid_to
      `;

      return { success: true };
    } catch (error) {
      console.error('Error setting customer pricing:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set customer pricing' 
      };
    }
  }

  /**
   * Create price tiers
   */
  async createPriceTier(tier: Partial<PriceTier>): Promise<{ success: boolean; tier?: PriceTier; error?: string }> {
    try {
      const result = await sql`
        INSERT INTO price_tiers (
          name, min_quantity, max_quantity, discount_percentage, is_active
        ) VALUES (
          ${tier.name}, ${tier.min_quantity}, ${tier.max_quantity || null},
          ${tier.discount_percentage}, ${tier.is_active ?? true}
        )
        RETURNING *
      `;

      if (result && result.length > 0) {
        return { success: true, tier: result[0] as PriceTier };
      }

      return { success: false, error: 'Failed to create price tier' };
    } catch (error) {
      console.error('Error creating price tier:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create price tier' 
      };
    }
  }

  /**
   * Get all price tiers
   */
  async getPriceTiers(): Promise<PriceTier[]> {
    try {
      const result = await sql`
        SELECT * FROM price_tiers
        WHERE is_active = true
        ORDER BY min_quantity
      `;

      return result as PriceTier[];
    } catch (error) {
      console.error('Error fetching price tiers:', error);
      return [];
    }
  }

  /**
   * Calculate bulk order pricing
   */
  async calculateBulkOrderPricing(
    items: Array<{ productId: string; quantity: number }>,
    businessAccountId: string
  ): Promise<{
    items: Array<PriceCalculation & { productId: string }>;
    subtotal: number;
    totalDiscount: number;
    total: number;
  }> {
    try {
      const pricedItems = await Promise.all(
        items.map(async (item) => {
          const pricing = await this.calculateB2BPrice(
            item.productId,
            item.quantity,
            businessAccountId
          );
          return { ...pricing, productId: item.productId };
        })
      );

      const subtotal = pricedItems.reduce((sum, item) => sum + (item.base_price * item.quantity), 0);
      const total = pricedItems.reduce((sum, item) => sum + item.final_price, 0);
      const totalDiscount = subtotal - total;

      return {
        items: pricedItems,
        subtotal,
        totalDiscount,
        total
      };
    } catch (error) {
      console.error('Error calculating bulk order pricing:', error);
      return {
        items: [],
        subtotal: 0,
        totalDiscount: 0,
        total: 0
      };
    }
  }
}

export const b2bPricingService = B2BPricingService.getInstance();
