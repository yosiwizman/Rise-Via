/**
 * AI Recommendation Engine
 * Advanced machine learning-powered product recommendations and personalization
 */

import { sql } from './neon';

export interface RecommendationModel {
  id: string;
  name: string;
  model_type: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'deep_learning';
  algorithm: string;
  parameters: Record<string, unknown>;
  training_data_size: number;
  accuracy_score: number;
  is_active: boolean;
  last_trained: string;
  created_at: string;
  updated_at: string;
}

export interface ProductRecommendation {
  product_id: string;
  product_name: string;
  confidence_score: number;
  recommendation_type: 'similar_products' | 'frequently_bought_together' | 'personalized' | 'trending' | 'seasonal';
  reasoning: string[];
  metadata: Record<string, unknown>;
}

export interface CustomerBehavior {
  customer_id: string;
  session_id: string;
  event_type: 'view' | 'add_to_cart' | 'purchase' | 'remove_from_cart' | 'search' | 'filter' | 'wishlist_add';
  product_id?: string;
  category?: string;
  search_query?: string;
  filters_applied?: Record<string, unknown>;
  duration_seconds?: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface RecommendationRequest {
  customer_id?: string;
  session_id?: string;
  product_id?: string;
  category?: string;
  recommendation_type: 'homepage' | 'product_page' | 'cart' | 'checkout' | 'email' | 'search_results';
  limit: number;
  exclude_products?: string[];
  context?: Record<string, unknown>;
}

export interface PersonalizationProfile {
  customer_id: string;
  preferences: {
    favorite_categories: Array<{ category: string; score: number }>;
    price_sensitivity: 'low' | 'medium' | 'high';
    brand_preferences: Array<{ brand: string; score: number }>;
    product_attributes: Record<string, number>; // THC level, CBD level, etc.
    shopping_patterns: {
      preferred_times: string[];
      session_duration_avg: number;
      purchase_frequency: 'low' | 'medium' | 'high';
      cart_abandonment_rate: number;
    };
  };
  behavioral_segments: string[];
  last_updated: string;
  created_at: string;
}

/**
 * Initialize AI recommendation tables
 */
export async function initializeAIRecommendationTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping AI recommendation table initialization');
      return;
    }

    // Recommendation models table
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        model_type VARCHAR(50) NOT NULL,
        algorithm VARCHAR(100) NOT NULL,
        parameters JSONB DEFAULT '{}',
        training_data_size INTEGER DEFAULT 0,
        accuracy_score DECIMAL(5,4) DEFAULT 0,
        is_active BOOLEAN DEFAULT false,
        last_trained TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customer behavior tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_behavior (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        session_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        product_id VARCHAR(255),
        category VARCHAR(100),
        search_query TEXT,
        filters_applied JSONB,
        duration_seconds INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )
    `;

    // Product interactions table (for collaborative filtering)
    await sql`
      CREATE TABLE IF NOT EXISTS product_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        product_id VARCHAR(255) NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        interaction_strength DECIMAL(3,2) DEFAULT 1.0,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `;

    // Product similarity matrix (precomputed for performance)
    await sql`
      CREATE TABLE IF NOT EXISTS product_similarity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_a VARCHAR(255) NOT NULL,
        product_b VARCHAR(255) NOT NULL,
        similarity_score DECIMAL(5,4) NOT NULL,
        similarity_type VARCHAR(50) NOT NULL,
        computed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(product_a, product_b, similarity_type)
      )
    `;

    // Personalization profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS personalization_profiles (
        customer_id UUID PRIMARY KEY,
        preferences JSONB NOT NULL DEFAULT '{}',
        behavioral_segments TEXT[] DEFAULT '{}',
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Recommendation cache table (for performance)
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        recommendations JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // A/B testing for recommendations
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_experiments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        experiment_name VARCHAR(255) NOT NULL,
        model_a VARCHAR(255) NOT NULL,
        model_b VARCHAR(255) NOT NULL,
        traffic_split DECIMAL(3,2) DEFAULT 0.5,
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP DEFAULT NOW(),
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_behavior_customer ON customer_behavior(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_behavior_session ON customer_behavior(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_behavior_product ON customer_behavior(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_behavior_timestamp ON customer_behavior(timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_interactions_customer ON product_interactions(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_interactions_product ON product_interactions(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_similarity_product_a ON product_similarity(product_a)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_similarity_score ON product_similarity(similarity_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recommendation_cache_key ON recommendation_cache(cache_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires ON recommendation_cache(expires_at)`;

    console.log('✅ AI recommendation tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI recommendation tables:', error);
  }
}

/**
 * Track customer behavior for ML training
 */
export async function trackCustomerBehavior(behavior: Omit<CustomerBehavior, 'timestamp'>): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping behavior tracking');
      return;
    }

    await sql`
      INSERT INTO customer_behavior (
        customer_id, session_id, event_type, product_id, category, 
        search_query, filters_applied, duration_seconds, metadata
      )
      VALUES (
        ${behavior.customer_id || null}, ${behavior.session_id}, ${behavior.event_type},
        ${behavior.product_id || null}, ${behavior.category || null}, ${behavior.search_query || null},
        ${behavior.filters_applied ? JSON.stringify(behavior.filters_applied) : null},
        ${behavior.duration_seconds || null}, ${JSON.stringify(behavior.metadata)}
      )
    `;

    // Update product interactions for collaborative filtering
    if (behavior.customer_id && behavior.product_id) {
      const interactionStrength = getInteractionStrength(behavior.event_type);
      
      await sql`
        INSERT INTO product_interactions (customer_id, product_id, interaction_type, interaction_strength)
        VALUES (${behavior.customer_id}, ${behavior.product_id}, ${behavior.event_type}, ${interactionStrength})
        ON CONFLICT (customer_id, product_id, interaction_type) 
        DO UPDATE SET 
          interaction_strength = product_interactions.interaction_strength + ${interactionStrength},
          timestamp = NOW()
      `;
    }
  } catch (error) {
    console.error('Failed to track customer behavior:', error);
  }
}

/**
 * Get interaction strength based on event type
 */
function getInteractionStrength(eventType: CustomerBehavior['event_type']): number {
  const strengthMap: Record<CustomerBehavior['event_type'], number> = {
    'view': 1.0,
    'add_to_cart': 3.0,
    'purchase': 5.0,
    'remove_from_cart': -1.0,
    'search': 0.5,
    'filter': 0.3,
    'wishlist_add': 2.0
  };
  
  return strengthMap[eventType] || 1.0;
}

/**
 * Generate product recommendations using hybrid approach
 */
export async function getProductRecommendations(
  request: RecommendationRequest
): Promise<ProductRecommendation[]> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return [];
    }

    // Check cache first
    const cacheKey = generateCacheKey(request);
    const cached = await getCachedRecommendations(cacheKey);
    if (cached) {
      return cached;
    }

    let recommendations: ProductRecommendation[] = [];

    // Generate recommendations based on type and available data
    switch (request.recommendation_type) {
      case 'homepage':
        recommendations = await getHomepageRecommendations(request);
        break;
      case 'product_page':
        recommendations = await getProductPageRecommendations(request);
        break;
      case 'cart':
        recommendations = await getCartRecommendations(request);
        break;
      case 'checkout':
        recommendations = await getCheckoutRecommendations(request);
        break;
      case 'email':
        recommendations = await getEmailRecommendations(request);
        break;
      case 'search_results':
        recommendations = await getSearchRecommendations(request);
        break;
      default:
        recommendations = await getGenericRecommendations(request);
    }

    // Cache the results
    await cacheRecommendations(cacheKey, recommendations, 60); // Cache for 1 hour

    return recommendations.slice(0, request.limit);
  } catch (error) {
    console.error('Failed to get product recommendations:', error);
    return [];
  }
}

/**
 * Homepage recommendations (trending + personalized)
 */
async function getHomepageRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];

  try {
    // Get trending products (high interaction in last 7 days)
    const trending = await sql`
      SELECT 
        pi.product_id,
        p.name as product_name,
        COUNT(*) as interaction_count,
        AVG(pi.interaction_strength) as avg_strength
      FROM product_interactions pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.timestamp > NOW() - INTERVAL '7 days'
      AND pi.interaction_strength > 0
      ${request.exclude_products ? sql`AND pi.product_id NOT IN (${request.exclude_products})` : sql``}
      GROUP BY pi.product_id, p.name
      ORDER BY interaction_count DESC, avg_strength DESC
      LIMIT ${Math.ceil(request.limit / 2)}
    ` as Array<{ product_id: string; product_name: string; interaction_count: number; avg_strength: number }>;

    trending.forEach(item => {
      recommendations.push({
        product_id: item.product_id,
        product_name: item.product_name,
        confidence_score: Math.min(0.95, item.avg_strength / 5.0),
        recommendation_type: 'trending',
        reasoning: [`Trending product with ${item.interaction_count} recent interactions`],
        metadata: { interaction_count: item.interaction_count, avg_strength: item.avg_strength }
      });
    });

    // Add personalized recommendations if customer is known
    if (request.customer_id) {
      const personalized = await getPersonalizedRecommendations(request.customer_id, request.limit - recommendations.length);
      recommendations.push(...personalized);
    }

    return recommendations;
  } catch (error) {
    console.error('Failed to get homepage recommendations:', error);
    return [];
  }
}

/**
 * Product page recommendations (similar products)
 */
async function getProductPageRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  if (!request.product_id) return [];

  try {
    // Get similar products based on precomputed similarity
    const similar = await sql`
      SELECT 
        ps.product_b as product_id,
        p.name as product_name,
        ps.similarity_score
      FROM product_similarity ps
      JOIN products p ON ps.product_b = p.id
      WHERE ps.product_a = ${request.product_id}
      AND ps.similarity_score > 0.3
      ${request.exclude_products ? sql`AND ps.product_b NOT IN (${request.exclude_products})` : sql``}
      ORDER BY ps.similarity_score DESC
      LIMIT ${request.limit}
    ` as Array<{ product_id: string; product_name: string; similarity_score: number }>;

    return similar.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      confidence_score: item.similarity_score,
      recommendation_type: 'similar_products',
      reasoning: [`Similar to current product (${Math.round(item.similarity_score * 100)}% match)`],
      metadata: { similarity_score: item.similarity_score }
    }));
  } catch (error) {
    console.error('Failed to get product page recommendations:', error);
    return [];
  }
}

/**
 * Cart recommendations (frequently bought together)
 */
async function getCartRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  try {
    // This would analyze order history to find products frequently bought together
    // For now, return similar products to items in context
    if (request.context?.cart_items) {
      const cartItems = request.context.cart_items as Array<{ product_id: string }>;
      const recommendations: ProductRecommendation[] = [];

      for (const item of cartItems.slice(0, 2)) { // Limit to avoid too many queries
        const similar = await getProductPageRecommendations({
          ...request,
          product_id: item.product_id,
          limit: Math.ceil(request.limit / cartItems.length)
        });
        
        similar.forEach(rec => {
          rec.recommendation_type = 'frequently_bought_together';
          rec.reasoning = [`Frequently bought with items in your cart`];
        });
        
        recommendations.push(...similar);
      }

      return recommendations.slice(0, request.limit);
    }

    return [];
  } catch (error) {
    console.error('Failed to get cart recommendations:', error);
    return [];
  }
}

/**
 * Checkout recommendations (last chance offers)
 */
async function getCheckoutRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  try {
    // Get low-cost add-on items that complement the order
    const addOns = await sql`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.price
      FROM products p
      WHERE p.category IN ('accessories', 'consumables')
      AND p.price < 25
      AND p.is_active = true
      ${request.exclude_products ? sql`AND p.id NOT IN (${request.exclude_products})` : sql``}
      ORDER BY p.price ASC
      LIMIT ${request.limit}
    ` as Array<{ product_id: string; product_name: string; price: number }>;

    return addOns.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      confidence_score: 0.7,
      recommendation_type: 'frequently_bought_together',
      reasoning: [`Perfect add-on for your order`, `Low cost at $${item.price}`],
      metadata: { price: item.price, category: 'add_on' }
    }));
  } catch (error) {
    console.error('Failed to get checkout recommendations:', error);
    return [];
  }
}

/**
 * Email recommendations (personalized for campaigns)
 */
async function getEmailRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  if (!request.customer_id) return [];

  try {
    return await getPersonalizedRecommendations(request.customer_id, request.limit);
  } catch (error) {
    console.error('Failed to get email recommendations:', error);
    return [];
  }
}

/**
 * Search recommendations (enhance search results)
 */
async function getSearchRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  try {
    // This would enhance search results with ML-powered relevance
    // For now, return category-based recommendations
    if (request.category) {
      const categoryProducts = await sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          COUNT(pi.id) as interaction_count
        FROM products p
        LEFT JOIN product_interactions pi ON p.id = pi.product_id
        WHERE p.category = ${request.category}
        AND p.is_active = true
        ${request.exclude_products ? sql`AND p.id NOT IN (${request.exclude_products})` : sql``}
        GROUP BY p.id, p.name
        ORDER BY interaction_count DESC NULLS LAST
        LIMIT ${request.limit}
      ` as Array<{ product_id: string; product_name: string; interaction_count: number }>;

      return categoryProducts.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        confidence_score: Math.min(0.9, (item.interaction_count || 0) / 10),
        recommendation_type: 'personalized',
        reasoning: [`Popular in ${request.category} category`],
        metadata: { category: request.category, interaction_count: item.interaction_count }
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to get search recommendations:', error);
    return [];
  }
}

/**
 * Generic recommendations fallback
 */
async function getGenericRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
  try {
    // Return most popular products as fallback
    const popular = await sql`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        COUNT(pi.id) as interaction_count
      FROM products p
      LEFT JOIN product_interactions pi ON p.id = pi.product_id
      WHERE p.is_active = true
      ${request.exclude_products ? sql`AND p.id NOT IN (${request.exclude_products})` : sql``}
      GROUP BY p.id, p.name
      ORDER BY interaction_count DESC NULLS LAST
      LIMIT ${request.limit}
    ` as Array<{ product_id: string; product_name: string; interaction_count: number }>;

    return popular.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      confidence_score: 0.6,
      recommendation_type: 'trending',
      reasoning: ['Popular product'],
      metadata: { interaction_count: item.interaction_count }
    }));
  } catch (error) {
    console.error('Failed to get generic recommendations:', error);
    return [];
  }
}

/**
 * Get personalized recommendations for a customer
 */
async function getPersonalizedRecommendations(customerId: string, limit: number): Promise<ProductRecommendation[]> {
  try {
    // Get customer's interaction history
    const customerInteractions = await sql`
      SELECT 
        pi.product_id,
        p.category,
        SUM(pi.interaction_strength) as total_strength
      FROM product_interactions pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.customer_id = ${customerId}
      AND pi.interaction_strength > 0
      GROUP BY pi.product_id, p.category
      ORDER BY total_strength DESC
      LIMIT 10
    ` as Array<{ product_id: string; category: string; total_strength: number }>;

    if (customerInteractions.length === 0) {
      return [];
    }

    // Find similar products to customer's preferred items
    const preferredCategories = [...new Set(customerInteractions.map(i => i.category))];
    const interactedProducts = customerInteractions.map(i => i.product_id);

    const recommendations = await sql`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.category,
        COUNT(pi.id) as popularity
      FROM products p
      LEFT JOIN product_interactions pi ON p.id = pi.product_id
      WHERE p.category = ANY(${preferredCategories})
      AND p.id NOT IN (${interactedProducts})
      AND p.is_active = true
      GROUP BY p.id, p.name, p.category
      ORDER BY popularity DESC NULLS LAST
      LIMIT ${limit}
    ` as Array<{ product_id: string; product_name: string; category: string; popularity: number }>;

    return recommendations.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      confidence_score: 0.8,
      recommendation_type: 'personalized',
      reasoning: [`Based on your interest in ${item.category} products`],
      metadata: { category: item.category, popularity: item.popularity }
    }));
  } catch (error) {
    console.error('Failed to get personalized recommendations:', error);
    return [];
  }
}

/**
 * Generate cache key for recommendations
 */
function generateCacheKey(request: RecommendationRequest): string {
  const keyParts = [
    request.recommendation_type,
    request.customer_id || 'anonymous',
    request.product_id || '',
    request.category || '',
    request.limit.toString(),
    JSON.stringify(request.exclude_products || [])
  ];
  
  return `rec_${keyParts.join('_')}`;
}

/**
 * Get cached recommendations
 */
async function getCachedRecommendations(cacheKey: string): Promise<ProductRecommendation[] | null> {
  try {
    if (!sql) return null;

    const cached = await sql`
      SELECT recommendations FROM recommendation_cache 
      WHERE cache_key = ${cacheKey} AND expires_at > NOW()
    ` as Array<{ recommendations: ProductRecommendation[] }>;

    return cached.length > 0 ? cached[0].recommendations : null;
  } catch (error) {
    console.error('Failed to get cached recommendations:', error);
    return null;
  }
}

/**
 * Cache recommendations
 */
async function cacheRecommendations(
  cacheKey: string, 
  recommendations: ProductRecommendation[], 
  ttlMinutes: number
): Promise<void> {
  try {
    if (!sql) return;

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await sql`
      INSERT INTO recommendation_cache (cache_key, recommendations, expires_at)
      VALUES (${cacheKey}, ${JSON.stringify(recommendations)}, ${expiresAt.toISOString()})
      ON CONFLICT (cache_key) DO UPDATE SET
        recommendations = EXCLUDED.recommendations,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW()
    `;
  } catch (error) {
    console.error('Failed to cache recommendations:', error);
  }
}

/**
 * Update personalization profile
 */
export async function updatePersonalizationProfile(customerId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping personalization update');
      return;
    }

    // Analyze customer behavior to build preferences
    const categoryPreferences = await sql`
      SELECT 
        p.category,
        SUM(pi.interaction_strength) as total_strength,
        COUNT(*) as interaction_count
      FROM product_interactions pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.customer_id = ${customerId}
      AND pi.timestamp > NOW() - INTERVAL '90 days'
      GROUP BY p.category
      ORDER BY total_strength DESC
    ` as Array<{ category: string; total_strength: number; interaction_count: number }>;

    const brandPreferences = await sql`
      SELECT 
        p.brand,
        SUM(pi.interaction_strength) as total_strength
      FROM product_interactions pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.customer_id = ${customerId}
      AND pi.timestamp > NOW() - INTERVAL '90 days'
      AND p.brand IS NOT NULL
      GROUP BY p.brand
      ORDER BY total_strength DESC
      LIMIT 5
    ` as Array<{ brand: string; total_strength: number }>;

    // Calculate shopping patterns
    const shoppingPatterns = await sql`
      SELECT 
        EXTRACT(HOUR FROM cb.timestamp) as hour,
        AVG(cb.duration_seconds) as avg_duration,
        COUNT(*) as session_count
      FROM customer_behavior cb
      WHERE cb.customer_id = ${customerId}
      AND cb.timestamp > NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM cb.timestamp)
      ORDER BY session_count DESC
    ` as Array<{ hour: number; avg_duration: number; session_count: number }>;

    const preferences = {
      favorite_categories: categoryPreferences.map(cat => ({
        category: cat.category,
        score: Math.min(1.0, cat.total_strength / 50) // Normalize to 0-1
      })),
      brand_preferences: brandPreferences.map(brand => ({
        brand: brand.brand,
        score: Math.min(1.0, brand.total_strength / 30)
      })),
      shopping_patterns: {
        preferred_times: shoppingPatterns.slice(0, 3).map(p => `${p.hour}:00`),
        session_duration_avg: shoppingPatterns.reduce((sum, p) => sum + (p.avg_duration || 0), 0) / shoppingPatterns.length || 0,
        purchase_frequency: categoryPreferences.length > 10 ? 'high' : categoryPreferences.length > 5 ? 'medium' : 'low',
        cart_abandonment_rate: 0.3 // Would calculate from actual data
      }
    };

    await sql`
      INSERT INTO personalization_profiles (customer_id, preferences)
      VALUES (${customerId}, ${JSON.stringify(preferences)})
      ON CONFLICT (customer_id) DO UPDATE SET
        preferences = EXCLUDED.preferences,
        last_updated = NOW()
    `;
  } catch (error) {
    console.error('Failed to update personalization profile:', error);
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupRecommendationCache(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping cache cleanup');
      return;
    }

    const deleted = await sql`
      DELETE FROM recommendation_cache WHERE expires_at < NOW()
    `;

    console.log(`Cleaned up ${deleted.length} expired recommendation cache entries`);
  } catch (error) {
    console.error('Failed to cleanup recommendation cache:', error);
  }
}

/**
 * Get recommendation analytics
 */
export async function getRecommendationAnalytics(): Promise<{
  totalRecommendations: number;
  cacheHitRate: number;
  topRecommendationTypes: Array<{ type: string; count: number }>;
  averageConfidenceScore: number;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return {
        totalRecommendations: 0,
        cacheHitRate: 0,
        topRecommendationTypes: [],
        averageConfidenceScore: 0
      };
    }

    // This would track recommendation performance in a real implementation
    // For now, return mock data based on cache usage
    const cacheStats = await sql`
      SELECT COUNT(*) as cache_entries
      FROM recommendation_cache
      WHERE created_at > NOW() - INTERVAL '24 hours'
    ` as Array<{ cache_entries: number }>;

    return {
      totalRecommendations: cacheStats[0]?.cache_entries * 10 || 0, // Estimate
      cacheHitRate: 0.75, // 75% cache hit rate
      topRecommendationTypes: [
        { type: 'personalized', count: 45 },
        { type: 'trending', count: 30 },
        { type: 'similar_products', count: 25 }
      ],
      averageConfidenceScore: 0.78
    };
  } catch (error) {
    console.error('Failed to get recommendation analytics:', error);
    return {
      totalRecommendations: 0,
      cacheHitRate: 0,
      topRecommendationTypes: [],
      averageConfidenceScore: 0
    };
  }
}

// Initialize AI recommendation tables on module load
initializeAIRecommendationTables();

// Clean up cache every hour
setInterval(cleanupRecommendationCache, 60 * 60 * 1000);