/**
 * AI Service for Rise-Via Cannabis E-commerce
 * Provides intelligent product recommendations and customer support
 */


export interface UserPreferences {
  desiredEffects?: string[];
  medicalConditions?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  preferredStrainType?: 'sativa' | 'indica' | 'hybrid';
  thcTolerance?: 'low' | 'medium' | 'high';
  priceRange?: { min: number; max: number };
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  reason: string;
  matchScore: number;
  effects: string[];
  thcLevel: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export class AIService {
  private static conversationHistory: ChatMessage[] = [];

  /**
   * Get personalized strain recommendations
   */
  static async getStrainRecommendation(userPreferences: UserPreferences): Promise<string> {
    try {
      const prompt = `Based on the following cannabis preferences, recommend suitable THCA strains:
      
Desired Effects: ${userPreferences.desiredEffects?.join(', ') || 'Not specified'}
Experience Level: ${userPreferences.experienceLevel || 'Not specified'}
Preferred Strain Type: ${userPreferences.preferredStrainType || 'Any'}
THC Tolerance: ${userPreferences.thcTolerance || 'Unknown'}
Price Range: ${userPreferences.priceRange ? `$${userPreferences.priceRange.min}-$${userPreferences.priceRange.max}` : 'Any'}
Medical Conditions: ${userPreferences.medicalConditions?.join(', ') || 'None specified'}

Please recommend 3 specific strains and explain why each would be suitable. Focus on effects, terpene profiles, and user experience. Keep recommendations compliant and educational.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          type: 'recommendation'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Unable to generate recommendations at this time.';
    } catch (error) {
      console.error('AI recommendation error:', error);
      return 'Recommendation service temporarily unavailable. Please try again later or contact our support team.';
    }
  }

  /**
   * Generate product descriptions
   */
  static async generateProductDescription(productData: {
    name: string;
    strainType: string;
    thcPercentage: number;
    cbdPercentage: number;
    terpenes: string[];
    effects: string[];
  }): Promise<string> {
    try {

      const prompt = `Create a compelling, SEO-friendly product description for:
      
Product: ${productData.name}
Strain Type: ${productData.strainType}
THC: ${productData.thcPercentage}%
CBD: ${productData.cbdPercentage}%
Terpenes: ${productData.terpenes.join(', ')}
Effects: ${productData.effects.join(', ')}

Create a 150-word description that highlights the unique characteristics, effects, and experience. Make it engaging and informative while maintaining compliance.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          type: 'description'
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Product description generation error:', error);
      return '';
    }
  }

  /**
   * Chat conversation handler
   */
  static async chat(message: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Keep conversation history limited to last 10 messages
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          type: 'chat'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.response || 'I apologize, but I couldn\'t process your request. Please try again.';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      });

      return assistantResponse;
    } catch (error) {
      console.error('Chat error:', error);
      return 'I\'m having trouble connecting right now. Please try again in a moment or contact our support team for assistance.';
    }
  }

  /**
   * Answer frequently asked questions
   */
  static async answerFAQ(question: string): Promise<string> {
    try {
      const prompt = `Answer this cannabis-related question concisely and accurately:
      
Question: ${question}

Provide a helpful, educational response that maintains compliance with cannabis regulations. If it's a medical question, remind them to consult a healthcare provider.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          type: 'faq'
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.response || 'Unable to answer at this time.';
    } catch (error) {
      console.error('FAQ answer error:', error);
      return 'Unable to process your question. Please contact our support team.';
    }
  }

  /**
   * Analyze customer sentiment from reviews
   */
  static async analyzeSentiment(reviewText: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    keywords: string[];
  }> {
    try {
      const prompt = `Analyze the sentiment of this cannabis product review:
      
"${reviewText}"

Return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: 0-1 (0 = very negative, 1 = very positive)
- keywords: array of key phrases that indicate the sentiment`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          type: 'sentiment'
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      if (data.response) {
        try {
          return JSON.parse(data.response);
        } catch {
          // Fallback if JSON parsing fails
          return { sentiment: 'neutral', score: 0.5, keywords: [] };
        }
      }

      return { sentiment: 'neutral', score: 0.5, keywords: [] };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', score: 0.5, keywords: [] };
    }
  }

  /**
   * Generate compliance-aware marketing copy
   */
  static async generateMarketingCopy(productName: string, targetAudience: string): Promise<string> {
    try {
      const prompt = `Create a short, engaging marketing tagline for:
      
Product: ${productName}
Target Audience: ${targetAudience}

Requirements:
- Maximum 15 words
- Compliance-friendly (no medical claims)
- Focus on experience and quality
- Engaging and memorable`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          type: 'marketing'
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Marketing copy generation error:', error);
      return '';
    }
  }

  /**
   * Clear conversation history
   */
  static clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  static getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

// Export singleton instance methods for convenience
export const aiService = {
  getRecommendation: AIService.getStrainRecommendation,
  generateDescription: AIService.generateProductDescription,
  generateProductDescription: AIService.generateProductDescription, // alias for compatibility
  chat: AIService.chat,
  answerFAQ: AIService.answerFAQ,
  analyzeSentiment: AIService.analyzeSentiment,
  generateCopy: AIService.generateMarketingCopy,
  clearHistory: AIService.clearHistory,
  getHistory: AIService.getHistory,
  // Add missing methods with basic implementations
  generateBlogPost: async (data: { topic: string; keywords: string[]; targetLength: number; tone: string }) => {
    const prompt = `Write a ${data.targetLength}-word ${data.tone} blog post about ${data.topic}. Include these keywords: ${data.keywords.join(', ')}. Focus on cannabis education and compliance.`;
    return AIService.answerFAQ(prompt);
  }
};
