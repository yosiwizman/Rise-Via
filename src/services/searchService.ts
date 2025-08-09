/**
 * Search and Filter Service for Rise-Via
 * Provides advanced product search and filtering capabilities
 */

import productsData from '../data/products.json';

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

const products = productsData.products as Product[];

export class SearchService {
  private static instance: SearchService;
  private searchIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.buildSearchIndex();
  }

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Build search index for faster searching
   */
  private buildSearchIndex() {
    products.forEach(product => {
      // Index by name
      const nameTokens = this.tokenize(product.name);
      nameTokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token)!.add(product.id);
      });

      // Index by description
      const descTokens = this.tokenize(product.description);
      descTokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token)!.add(product.id);
      });

      // Index by effects
      product.effects.forEach((effect: string) => {
        const effectTokens = this.tokenize(effect);
        effectTokens.forEach(token => {
          if (!this.searchIndex.has(token)) {
            this.searchIndex.set(token, new Set());
          }
          this.searchIndex.get(token)!.add(product.id);
        });
      });

      // Index by strain type
      const strainToken = product.strainType.toLowerCase();
      if (!this.searchIndex.has(strainToken)) {
        this.searchIndex.set(strainToken, new Set());
      }
      this.searchIndex.get(strainToken)!.add(product.id);
    });
  }

  /**
   * Tokenize text for indexing
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Search products based on query
   */
  search(query: string): Product[] {
    if (!query || query.trim() === '') {
      return products;
    }

    const queryTokens = this.tokenize(query);
    const matchedProductIds = new Set<string>();

    // Find products matching any query token
    queryTokens.forEach(token => {
      if (this.searchIndex.has(token)) {
        this.searchIndex.get(token)!.forEach(id => matchedProductIds.add(id));
      }

      // Also check for partial matches
      Array.from(this.searchIndex.keys()).forEach(indexToken => {
        if (indexToken.includes(token) || token.includes(indexToken)) {
          this.searchIndex.get(indexToken)!.forEach(id => matchedProductIds.add(id));
        }
      });
    });

    // Return matched products
    return products.filter(product => matchedProductIds.has(product.id));
  }

  /**
   * Filter products based on criteria
   */
  filter(products: Product[], filters: SearchFilters): Product[] {
    let filtered = [...products];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Filter by strain type
    if (filters.strainType && filters.strainType !== 'all') {
      filtered = filtered.filter(p => 
        p.strainType.toLowerCase() === filters.strainType!.toLowerCase()
      );
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      );
    }

    // Filter by THC range
    if (filters.thcRange) {
      filtered = filtered.filter(p => {
        const thcValue = p.thc || p.thcaPercentage || 0;
        return thcValue >= filters.thcRange!.min && thcValue <= filters.thcRange!.max;
      });
    }

    // Filter by effects
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
   * Combined search, filter, and sort
   */
  searchAndFilter(filters: SearchFilters): Product[] {
    // Start with search if query exists
    let results = filters.query ? this.search(filters.query) : products;

    // Apply filters
    results = this.filter(results, filters);

    // Apply sorting
    if (filters.sortBy) {
      results = this.sort(results, filters.sortBy);
    }

    return results;
  }

  /**
   * Get product suggestions based on partial input
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Get product name suggestions
    products.forEach(product => {
      if (product.name.toLowerCase().includes(queryLower)) {
        suggestions.add(product.name);
      }
    });

    // Get effect suggestions
    products.forEach(product => {
      product.effects.forEach((effect: string) => {
        if (effect.toLowerCase().includes(queryLower)) {
          suggestions.add(effect);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get available filter options based on current products
   */
  getFilterOptions(products: Product[]): {
    categories: string[];
    strainTypes: string[];
    effects: string[];
    priceRange: { min: number; max: number };
    thcRange: { min: number; max: number };
  } {
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
  }

  /**
   * Get related products based on a product
   */
  getRelatedProducts(productId: string, limit: number = 4): Product[] {
    const product = products.find(p => p.id === productId);
    if (!product) return [];

    // Score other products based on similarity
    const scored = products
      .filter(p => p.id !== productId)
      .map(p => {
        let score = 0;

        // Same strain type
        if (p.strainType === product.strainType) score += 3;

        // Same category
        if (p.category === product.category) score += 2;

        // Similar THC level (within 5%)
        const pThc = p.thc || p.thcaPercentage || 0;
        const productThc = product.thc || product.thcaPercentage || 0;
        if (Math.abs(pThc - productThc) <= 5) score += 2;

        // Shared effects
        const sharedEffects = p.effects.filter((e: string) => product.effects.includes(e));
        score += sharedEffects.length;

        // Similar price (within 20%)
        const priceDiff = Math.abs(p.price - product.price) / product.price;
        if (priceDiff <= 0.2) score += 1;

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.product);
  }

  /**
   * Search products with fuzzy matching
   */
  fuzzySearch(query: string, threshold: number = 0.6): Product[] {
    if (!query || query.trim() === '') {
      return products;
    }

    const queryLower = query.toLowerCase();
    const results: Array<{ product: Product; score: number }> = [];

    products.forEach(product => {
      let score = 0;

      // Check name similarity
      const nameSimilarity = this.calculateSimilarity(queryLower, product.name.toLowerCase());
      if (nameSimilarity > threshold) {
        score = Math.max(score, nameSimilarity * 1.5); // Name matches are weighted higher
      }

      // Check description similarity
      const descSimilarity = this.calculateSimilarity(queryLower, product.description.toLowerCase());
      if (descSimilarity > threshold) {
        score = Math.max(score, descSimilarity);
      }

      // Check effects
      product.effects.forEach((effect: string) => {
        const effectSimilarity = this.calculateSimilarity(queryLower, effect.toLowerCase());
        if (effectSimilarity > threshold) {
          score = Math.max(score, effectSimilarity * 1.2);
        }
      });

      if (score > 0) {
        results.push({ product, score });
      }
    });

    // Sort by score and return products
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.product);
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;

    // Simple substring matching for now
    if (str2.includes(str1) || str1.includes(str2)) {
      const minLen = Math.min(str1.length, str2.length);
      return minLen / maxLen;
    }

    // Check word-by-word matching
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    let matches = 0;

    words1.forEach(word1 => {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();
