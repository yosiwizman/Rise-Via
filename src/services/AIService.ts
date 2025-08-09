import productsData from '../data/products.json';
import { sanitizeAIResponse } from '../utils/aiCompliance';

interface ProductGenerationRequest {
  name: string;
  strainType: 'sativa' | 'indica' | 'hybrid';
  thcaPercentage: number;
  effects: string[];
  category: string;
}

interface BlogPostRequest {
  topic: string;
  keywords: string[];
  targetLength: number;
  tone: 'educational' | 'promotional' | 'informative';
}

export const aiService = {
  async generateProductDescription(productData: ProductGenerationRequest): Promise<string> {
    try {
      
      const prompt = `Generate a compliant cannabis product description for:
      Name: ${productData.name}
      Type: ${productData.strainType}
      THCA: ${productData.thcaPercentage}%
      Effects: ${productData.effects.join(', ')}
      Category: ${productData.category}
      
      Requirements:
      - No medical claims
      - Include effects and flavor profile
      - Mention THCA percentage
      - Keep under 200 words
      - Professional tone`;

      const response = await this.callFlowiseAPI('/api/v1/prediction/product-description', {
        question: prompt,
        productData
      });

      const sanitizedResponse = sanitizeAIResponse(response.text);
      return sanitizedResponse;
    } catch (error) {
      console.error('Product description generation failed:', error);
      return this.getFallbackProductDescription(productData);
    }
  },

  async generateBlogPost(request: BlogPostRequest): Promise<string> {
    try {
      
      const prompt = `Write a ${request.targetLength}-word blog post about ${request.topic}.
      Keywords to include: ${request.keywords.join(', ')}
      Tone: ${request.tone}
      
      Requirements:
      - Educational content only
      - No medical claims
      - Include legal disclaimers
      - Cannabis industry focus
      - SEO optimized`;

      const response = await this.callFlowiseAPI('/api/v1/prediction/blog-post', {
        question: prompt,
        ...request
      });

      const sanitizedResponse = sanitizeAIResponse(response.text);
      return sanitizedResponse;
    } catch (error) {
      console.error('Blog post generation failed:', error);
      return this.getFallbackBlogPost(request);
    }
  },

  async getChatResponse(message: string, context: any = {}): Promise<string> {
    try {
      const cannabisContext = this.buildCannabisContext();
      
      const prompt = `User question: ${message}
      
      Context: Cannabis e-commerce platform
      Available products: ${productsData.products.length} strains
      Knowledge base: ${JSON.stringify(cannabisContext)}
      
      Provide helpful, compliant response about:
      - Strain information and effects
      - General cannabis education
      - Product recommendations
      - Dosage guidance (general only)
      - Legal information
      
      Always include compliance disclaimer.`;

      const response = await this.callFlowiseAPI('/api/v1/prediction/chat', {
        question: prompt,
        context
      });

      const sanitizedResponse = sanitizeAIResponse(response.text);
      return sanitizedResponse;
    } catch (error) {
      console.error('Chat response failed:', error);
      return this.getFallbackChatResponse(message);
    }
  },

  async getStrainRecommendations(preferences: {
    effects?: string[];
    strainType?: string;
    thcaRange?: [number, number];
  }): Promise<any[]> {
    const products = productsData.products;
    
    let filtered = products.filter(product => {
      if (preferences.strainType && product.strainType !== preferences.strainType) {
        return false;
      }
      
      if (preferences.thcaRange) {
        const [min, max] = preferences.thcaRange;
        if (product.thcaPercentage < min || product.thcaPercentage > max) {
          return false;
        }
      }
      
      if (preferences.effects && preferences.effects.length > 0) {
        const hasMatchingEffect = preferences.effects.some(effect => 
          product.effects.some(productEffect => 
            productEffect.toLowerCase().includes(effect.toLowerCase())
          )
        );
        if (!hasMatchingEffect) return false;
      }
      
      return true;
    });

    return filtered.slice(0, 5);
  },

  async generateMetaDescription(content: string): Promise<string> {
    try {
      const prompt = `Generate an SEO meta description (150-160 characters) for this cannabis content:
      ${content.substring(0, 500)}...
      
      Requirements:
      - Include relevant keywords
      - Compelling and informative
      - Cannabis industry appropriate
      - Under 160 characters`;

      const response = await this.callFlowiseAPI('/api/v1/prediction/meta', {
        question: prompt,
        content
      });

      return response.text.substring(0, 160);
    } catch (error) {
      console.error('Meta description generation failed:', error);
      return "Premium cannabis products with lab-tested quality. Explore our selection of THCA flower, edibles, and concentrates. 21+ only.";
    }
  },

  async callFlowiseAPI(endpoint: string, data: any): Promise<any> {
    const flowiseUrl = import.meta.env.VITE_FLOWISE_URL || 'http://localhost:3000';
    const apiKey = import.meta.env.VITE_FLOWISE_API_KEY;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(`${flowiseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }

    return await response.json();
  },

  buildCannabisContext(): any {
    const cannabisKnowledge = {
      strainTypes: ['sativa', 'indica', 'hybrid'],
      commonEffects: ['relaxed', 'euphoric', 'creative', 'energetic', 'focused', 'happy', 'sleepy'],
      categories: ['flower', 'pre-rolls', 'concentrates', 'edibles'],
      thcaRange: '20-32%',
      legalAge: 21,
      complianceRequired: true,
      terpenes: ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene'],
      consumptionMethods: ['smoking', 'vaporizing', 'edibles', 'tinctures'],
      safetyGuidelines: [
        'Start low, go slow',
        'Do not drive or operate machinery',
        'Keep away from children and pets',
        'Store in cool, dry place'
      ]
    };
    
    return cannabisKnowledge;
  },

  getFallbackProductDescription(productData: ProductGenerationRequest): string {
    const effectsText = productData.effects.join(', ').toLowerCase();
    const typeDescription = {
      sativa: 'energizing and uplifting',
      indica: 'relaxing and calming', 
      hybrid: 'balanced and versatile'
    }[productData.strainType];

    return `${productData.name} is a premium ${productData.strainType} strain with ${productData.thcaPercentage}% THCA. Known for its ${typeDescription} effects including ${effectsText}. This high-quality ${productData.category} offers a distinctive experience for adult consumers. Lab-tested for purity and potency.

This product has not been evaluated by the FDA. Not for use by minors, pregnant or nursing women. Keep out of reach of children and pets.`;
  },

  getFallbackBlogPost(request: BlogPostRequest): string {
    return `# Understanding ${request.topic}

Cannabis education continues to evolve as more research becomes available. When exploring ${request.keywords.join(', ')}, it's important to understand the fundamentals.

## Key Considerations

The cannabis industry emphasizes quality, safety, and compliance. Products undergo rigorous testing to ensure purity and accurate labeling.

## Important Information

Always purchase from licensed dispensaries and follow local regulations. Cannabis affects everyone differently, so start with small amounts and wait to assess effects.

The information provided is for educational purposes only and has not been evaluated by the FDA. Cannabis products are for adult use only (21+).`;
  },

  getFallbackChatResponse(message: string): string {
    if (message.toLowerCase().includes('strain') || message.toLowerCase().includes('effect')) {
      return "I can help you learn about different cannabis strains and their general effects. Our products include sativa, indica, and hybrid varieties with various THCA percentages. Each strain has unique characteristics and effects. For specific product recommendations, browse our shop or speak with a budtender. I provide educational information only. For medical advice, consult a healthcare professional.";
    }
    
    if (message.toLowerCase().includes('dosage') || message.toLowerCase().includes('dose')) {
      return "Dosage varies greatly between individuals and products. General guidance suggests starting with small amounts and waiting to assess effects before consuming more. Factors like tolerance, body weight, and experience level all play a role. Always follow product labeling and local regulations. I provide educational information only. For medical advice, consult a healthcare professional.";
    }
    
    return "I'm here to provide educational information about cannabis products and general guidance. I can help with strain information, effects, and general cannabis education. How can I assist you today? I provide educational information only. For medical advice, consult a healthcare professional.";
  }
};
