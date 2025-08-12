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
      console.log('AI recommendation requested but API not available');
      return 'AI recommendations are currently unavailable. Please browse our product catalog or contact our support team for personalized assistance.';
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
      console.log('Product description generation requested but API not available');
      return `${productData.name} is a premium ${productData.strainType} strain with ${productData.thcPercentage}% THC. Experience the unique blend of ${productData.terpenes.join(', ')} terpenes for ${productData.effects.join(', ')} effects.`;
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

      console.log('Chat requested but API not available');
      const assistantResponse = 'Thank you for your message! Our AI chat service is currently being updated. Please contact our support team for immediate assistance with your cannabis questions.';

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
      console.log('FAQ requested but API not available');
      return 'Thank you for your question! Our AI FAQ service is currently being updated. Please contact our support team for detailed answers to your cannabis-related questions.';
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
      console.log('Sentiment analysis requested but API not available');
      
      const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing'];
      
      const lowerText = reviewText.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
      
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let score = 0.5;
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        score = Math.min(0.7 + (positiveCount * 0.1), 1.0);
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        score = Math.max(0.3 - (negativeCount * 0.1), 0.0);
      }
      
      return { sentiment, score, keywords: [...positiveWords, ...negativeWords].filter(word => lowerText.includes(word)) };
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
      console.log('Marketing copy generation requested but API not available');
      return `Premium ${productName} - Experience Quality Cannabis`;
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
