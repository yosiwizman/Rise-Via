/**
 * Search and Filter Service for Rise-Via
 * Provides advanced product search and filtering capabilities using database
 */

import { sql } from '../lib/neon';

export interface SearchFilters {
  query?: string;
  category?: string;
  strainType?: 'sativa' | 'indica' | 'hybrid' | 'all';
  priceRange?: { min: number; max: number };
  thcRange?: { min: number; max: number };
  effects?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'thc-asc' | 'thc-desc' | 'name-asc' | 'name-desc' | 'popular';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  thc?: number;
  thcaPercentage?: number;
  cbd?: number;
  strainType: 'sativa' | 'indica' | 'hybrid';
  effects: string[];
  description: string;
  images: string[];
  inventory?: number;
  terpenes?: string[];
  rating?: number;
  reviewCount?: number;
}

/**
 * Initialize product tables if they don't exist
 */
async function initializeProductTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping product table initialization');
      return;
    }

    // Products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        thc DECIMAL(5,2),
        thca_percentage DECIMAL(5,2),
        cbd DECIMAL(5,2),
        strain_type VARCHAR(20) NOT NULL,
        effects TEXT[],
        description TEXT,
        images TEXT[],
        inventory INTEGER DEFAULT 0,
        terpenes TEXT[],
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for better search performance
    await sql`CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_description ON products USING gin(to_tsvector('english', description))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_strain_type ON products(strain_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_thca ON products(thca_percentage)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_effects ON products USING gin(effects)`;

    console.log('✅ Product tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize product tables:', error);
  }
}

// Initialize tables on module load
initializeProductTables();

export class SearchService {
  private static instance: SearchService;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Search products based on query
   */
  async search(query: string): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty results');
        return [];
      }

      if (!query || query.trim() === '') {
        // Return all products if no query
        const products = await sql`
          SELECT * FROM products 
          ORDER BY created_at DESC
        ` as Array<Product>;
        return products || [];
      }

      // Use PostgreSQL full-text search
      const products = await sql`
        SELECT *,
          ts_rank(
            to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(effects, ' ')),
            plainto_tsquery('english', ${query})
          ) as rank
        FROM products
        WHERE 
          to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(effects, ' ')) 
          @@ plainto_tsquery('english', ${query})
          OR name ILIKE ${`%${query}%`}
          OR description ILIKE ${`%${query}%`}
          OR strain_type ILIKE ${`%${query}%`}
        ORDER BY rank DESC, name ASC
      ` as Array<Product>;

      return products || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Filter products based on criteria
   */
  async filter(products: Product[], filters: SearchFilters): Promise<Product[]> {
    // If we have database access, do filtering in SQL
    if (sql && (!products || products.length === 0)) {
      return this.searchAndFilter(filters);
    }

    // Otherwise filter in memory
    let filtered = [...products];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.strainType && filters.strainType !== 'all') {
      filtered = filtered.filter(p => 
        p.strainType.toLowerCase() === filters.strainType!.toLowerCase()
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      );
    }

    if (filters.thcRange) {
      filtered = filtered.filter(p => {
        const thcValue = p.thc || p.thcaPercentage || 0;
        return thcValue >= filters.thcRange!.min && thcValue <= filters.thcRange!.max;
      });
    }

    if (filters.effects && filters.effects.length > 0) {
      filtered = filtered.filter(p => 
        filters.effects!.some(effect => 
          p.effects.some(pEffect => 
            pEffect.toLowerCase().includes(effect.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }

  /**
   * Sort products
   */
  sort(products: Product[], sortBy: SearchFilters['sortBy']): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'thc-asc':
        return sorted.sort((a, b) => (a.thc || a.thcaPercentage || 0) - (b.thc || b.thcaPercentage || 0));
      case 'thc-desc':
        return sorted.sort((a, b) => (b.thc || b.thcaPercentage || 0) - (a.thc || a.thcaPercentage || 0));
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'popular':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default:
        return sorted;
    }
  }

  /**
   * Combined search, filter, and sort using database
   */
  async searchAndFilter(filters: SearchFilters): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty results');
        return [];
      }

      // Build WHERE clause
      const whereClauses: string[] = [];
      const values: any[] = [];

      // Search query
      if (filters.query) {
        whereClauses.push(`(
          to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(effects, ' ')) 
          @@ plainto_tsquery('english', $${values.length +1})
          OR name ILIKE $${values.length + 2}
          OR description ILIKE $${values.length + 3}
        )`);
        values.push(filters.query, `%${filters.query}%`, `%${filters.query}%`);
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        whereClauses.push(`category = $${values.length + 1}`);
        values.push(filters.category);
      }

      // Strain type filter
      if (filters.strainType && filters.strainType !== 'all') {
        whereClauses.push(`strain_type = $${values.length + 1}`);
        values.push(filters.strainType);
      }

      // Price range filter
      if (filters.priceRange) {
        whereClauses.push(`price BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(filters.priceRange.min, filters.priceRange.max);
      }

      // THC range filter
      if (filters.thcRange) {
        whereClauses.push(`COALESCE(thca_percentage, thc, 0) BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(filters.thcRange.min, filters.thcRange.max);
      }

      // Effects filter
      if (filters.effects && filters.effects.length > 0) {
        whereClauses.push(`effects && $${values.length + 1}`);
        values.push(filters.effects);
      }

      // Build ORDER BY clause
      let orderBy = 'created_at DESC';
      switch (filters.sortBy) {
        case 'price-asc':
          orderBy = 'price ASC';
          break;
        case 'price-desc':
          orderBy = 'price DESC';
          break;
        case 'thc-asc':
          orderBy = 'COALESCE(thca_percentage, thc, 0) ASC';
          break;
        case 'thc-desc':
          orderBy = 'COALESCE(thca_percentage, thc, 0) DESC';
          break;
        case 'name-asc':
          orderBy = 'name ASC';
          break;
        case 'name-desc':
          orderBy = 'name DESC';
          break;
        case 'popular':
          orderBy = 'review_count DESC NULLS LAST, rating DESC NULLS LAST';
          break;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Execute query
      const queryText = `
        SELECT * FROM products
        ${whereClause}
        ORDER BY ${orderBy}
      `;

      const products = values.length > 0 
        ? await sql.unsafe(queryText, values) as Array<Product>
        : await sql.unsafe(queryText) as Array<Product>;

      return products || [];
    } catch (error) {
      console.error('Search and filter error:', error);
      return [];
    }
  }

  /**
   * Get product suggestions based on partial input
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      if (!sql || !query || query.length < 2) {
        return [];
      }

      const suggestions = await sql`
        SELECT DISTINCT name
        FROM products
        WHERE name ILIKE ${`${query}%`}
        ORDER BY name
        LIMIT ${limit}
      ` as Array<{ name: string }>;

      return suggestions.map(s => s.name);
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [];
    }
  }

  /**
   * Get available filter options based on current products
   */
  async getFilterOptions(products?: Product[]): Promise<{
    categories: string[];
    strainTypes: string[];
    effects: string[];
    priceRange: { min: number; max: number };
    thcRange: { min: number; max: number };
  }> {
    try {
      if (sql && !products) {
        // Get from database
        const options = await sql`
          SELECT 
            array_agg(DISTINCT category) as categories,
            array_agg(DISTINCT strain_type) as strain_types,
            array_agg(DISTINCT unnest(effects)) as effects,
            MIN(price) as min_price,
            MAX(price) as max_price,
            MIN(COALESCE(thca_percentage, thc, 0)) as min_thc,
            MAX(COALESCE(thca_percentage, thc, 0)) as max_thc
          FROM products
        `;

        const result = options[0];
        return {
          categories: result.categories || [],
          strainTypes: result.strain_types || [],
          effects: result.effects || [],
          priceRange: { min: result.min_price || 0, max: result.max_price || 1000 },
          thcRange: { min: result.min_thc || 0, max: result.max_thc || 100 }
        };
      }

      // Get from provided products array
      if (!products || products.length === 0) {
        return {
          categories: [],
          strainTypes: [],
          effects: [],
          priceRange: { min: 0, max: 1000 },
          thcRange: { min: 0, max: 100 }
        };
      }

      const categories = new Set<string>();
      const strainTypes = new Set<string>();
      const effects = new Set<string>();
      let minPrice = Infinity;
      let maxPrice = 0;
      let minTHC = Infinity;
      let maxTHC = 0;

      products.forEach(product => {
        categories.add(product.category);
        strainTypes.add(product.strainType);
        product.effects.forEach(effect => effects.add(effect));
        
        if (product.price < minPrice) minPrice = product.price;
        if (product.price > maxPrice) maxPrice = product.price;
        const thcValue = product.thc || product.thcaPercentage || 0;
        if (thcValue < minTHC) minTHC = thcValue;
        if (thcValue > maxTHC) maxTHC = thcValue;
      });

      return {
        categories: Array.from(categories).sort(),
        strainTypes: Array.from(strainTypes).sort(),
        effects: Array.from(effects).sort(),
        priceRange: { min: minPrice, max: maxPrice },
        thcRange: { min: minTHC, max: maxTHC }
      };
    } catch (error) {
      console.error('Get filter options error:', error);
      return {
        categories: [],
        strainTypes: [],
        effects: [],
        priceRange: { min: 0, max: 1000 },
        thcRange: { min: 0, max: 100 }
      };
    }
  }

  /**
   * Get related products based on a product
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty results');
        return [];
      }

      // Get the source product
      const sourceProducts = await sql`
        SELECT * FROM products WHERE id = ${productId}
      ` as Array<Product>;

      if (sourceProducts.length === 0) {
        return [];
      }

      const product = sourceProducts[0];

      // Find related products based on strain type, category, and effects
      const relatedProducts = await sql`
        SELECT *,
          (
            CASE WHEN strain_type = ${product.strainType} THEN 3 ELSE 0 END +
            CASE WHEN category = ${product.category} THEN 2 ELSE 0 END +
            CASE WHEN ABS(COALESCE(thca_percentage, thc, 0) - ${product.thcaPercentage || product.thc || 0}) <= 5 THEN 2 ELSE 0 END +
            CASE WHEN effects && ${product.effects} THEN array_length(effects & ${product.effects}, 1) ELSE 0 END +
            CASE WHEN ABS(price - ${product.price}) / ${product.price} <= 0.2 THEN 1 ELSE 0 END
          ) as similarity_score
        FROM products
        WHERE id != ${productId}
        ORDER BY similarity_score DESC, review_count DESC NULLS LAST
        LIMIT ${limit}
      ` as Array<Product>;

      return relatedProducts || [];
    } catch (error) {
      console.error('Get related products error:', error);
      return [];
    }
  }

  /**
   * Fuzzy search products with similarity matching
   */
  async fuzzySearch(query: string, threshold: number = 0.3): Promise<Product[]> {
    try {
      if (!sql || !query || query.trim() === '') {
        return [];
      }

      // Use PostgreSQL's similarity functions
      const products = await sql`
        SELECT *,
          similarity(name, ${query}) as name_similarity,
          similarity(description, ${query}) as desc_similarity
        FROM products
        WHERE 
          similarity(name, ${query}) > ${threshold}
          OR similarity(description, ${query}) > ${threshold}
          OR name ILIKE ${`%${query}%`}
          OR description ILIKE ${`%${query}%`}
        ORDER BY 
          GREATEST(similarity(name, ${query}), similarity(description, ${query})) DESC,
          name ASC
      ` as Array<Product>;

      return products || [];
    } catch (error) {
      console.error('Fuzzy search error:', error);
      // Fallback to basic search
      return this.search(query);
    }
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();
