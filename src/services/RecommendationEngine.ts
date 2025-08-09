import productsData from '../data/products.json';

interface Product {
  id: string;
  name: string;
  strainType: string;
  thcaPercentage: number;
  effects: string[];
  category: string;
  price: number;
}

export class RecommendationEngine {
  static getRecommendations(currentProduct: Product, _userHistory: string[] = []) {
    const products = productsData.products;
    
    const similarEffects = products.filter(p => 
      p.id !== currentProduct.id &&
      p.effects.some(e => currentProduct.effects.includes(e))
    ).slice(0, 4);
    
    const similarType = products.filter(p => 
      p.id !== currentProduct.id &&
      p.strainType === currentProduct.strainType
    ).slice(0, 4);
    
    const similarPotency = products.filter(p => 
      p.id !== currentProduct.id &&
      Math.abs(p.thcaPercentage - currentProduct.thcaPercentage) <= 3
    ).slice(0, 4);
    
    const boughtTogether = this.getFrequentPairs(currentProduct.id).slice(0, 4);
    
    return {
      similar: similarEffects,
      alternative: similarType,
      potency_match: similarPotency,
      pairs_well: boughtTogether
    };
  }

  static getFrequentPairs(productId: string): Product[] {
    const products = productsData.products;
    const pairings: Record<string, string[]> = {
      'blue-dream-001': ['og-kush-002', 'white-widow-006'],
      'og-kush-002': ['northern-lights-008', 'granddaddy-purple-005'],
      'sour-diesel-003': ['green-crack-007', 'jack-herer-009'],
      'purple-haze-004': ['blue-dream-001', 'sour-diesel-003'],
      'granddaddy-purple-005': ['og-kush-002', 'northern-lights-008'],
      'white-widow-006': ['blue-dream-001', 'girl-scout-cookies-010'],
      'green-crack-007': ['sour-diesel-003', 'jack-herer-009'],
      'northern-lights-008': ['og-kush-002', 'granddaddy-purple-005'],
      'jack-herer-009': ['sour-diesel-003', 'green-crack-007'],
      'girl-scout-cookies-010': ['white-widow-006', 'wedding-cake-014']
    };

    const pairedIds = pairings[productId] || [];
    return products.filter(p => pairedIds.includes(p.id));
  }

  static getPersonalizedRecommendations(userPreferences: {
    preferredEffects: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    preferredTime: 'morning' | 'afternoon' | 'evening';
    medicalVsRecreational: 'medical' | 'recreational';
    flavorPreferences: string[];
  }) {
    const products = productsData.products;
    
    const potencyFilter = {
      beginner: (p: Product) => p.thcaPercentage <= 20,
      intermediate: (p: Product) => p.thcaPercentage > 20 && p.thcaPercentage <= 25,
      expert: (p: Product) => p.thcaPercentage > 25
    };

    const timeFilter = {
      morning: (p: Product) => p.strainType === 'sativa' || p.effects.includes('Energetic'),
      afternoon: (p: Product) => p.strainType === 'hybrid',
      evening: (p: Product) => p.strainType === 'indica' || p.effects.includes('Relaxed')
    };

    let filtered = products
      .filter(potencyFilter[userPreferences.experienceLevel])
      .filter(timeFilter[userPreferences.preferredTime])
      .filter(p => p.effects.some(e => userPreferences.preferredEffects.includes(e)));

    const scored = filtered.map(product => ({
      ...product,
      score: this.calculatePreferenceScore(product, userPreferences)
    })).sort((a, b) => b.score - a.score);

    return scored.slice(0, 8);
  }

  private static calculatePreferenceScore(product: Product, preferences: any): number {
    let score = 0;
    
    const effectMatches = product.effects.filter(e => preferences.preferredEffects.includes(e)).length;
    score += effectMatches * 10;
    
    if (preferences.preferredTime === 'morning' && product.strainType === 'sativa') score += 5;
    if (preferences.preferredTime === 'evening' && product.strainType === 'indica') score += 5;
    if (preferences.preferredTime === 'afternoon' && product.strainType === 'hybrid') score += 5;
    
    return score;
  }
}
