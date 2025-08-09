import OpenAI from 'openai';
import productsData from '../data/products.json';

const openaiApiKey = import.meta.env?.VITE_OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('VITE_OPENAI_API_KEY not provided - AI features will be limited');
}

export const aiService = {
  client: openaiApiKey ? new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true
  }) : null,

  async getCannabisInfo(query: string): Promise<string> {
    if (!this.client) throw new Error('AI service not configured');
    
    const strainInfo = productsData.products.map(p => 
      `${p.name} (${p.strainType}, ${p.thcaPercentage}% THCA): ${p.description}`
    ).join('\n');

    const prompt = `You are a cannabis expert assistant for RiseViA. Answer questions about cannabis, THCA, strains, and effects.
Always include legal disclaimers and compliance information.

Available strains:
${strainInfo}

Question: ${query}

Answer with accurate, compliant information:`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.';
  },

  async getStrainRecommendation(preferences: {
    effects?: string[];
    strainType?: string;
    potencyRange?: [number, number];
  }): Promise<any[]> {
    const { effects, strainType, potencyRange } = preferences;
    
    let filtered = productsData.products.filter(product => {
      if (strainType && product.strainType !== strainType) return false;
      if (potencyRange && (product.thcaPercentage < potencyRange[0] || product.thcaPercentage > potencyRange[1])) return false;
      if (effects && !effects.some(effect => product.effects.includes(effect))) return false;
      return true;
    });

    return filtered.slice(0, 3);
  },

  async generateProductDescription(productName: string, strainType: string, effects: string[]): Promise<string> {
    if (!this.client) throw new Error('AI service not configured');
    
    const prompt = `Generate a compliant product description for a cannabis strain with these details:
- Name: ${productName}
- Type: ${strainType}
- Effects: ${effects.join(', ')}

Requirements:
- No medical claims
- Include legal disclaimers
- Age-appropriate content
- Professional tone
- 2-3 sentences maximum

Description:`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0]?.message?.content || 'Unable to generate description at this time.';
  },

  async generateBlogPost(topic: string, keywords: string[]): Promise<{ title: string; content: string }> {
    if (!this.client) throw new Error('AI service not configured');
    
    const prompt = `Create a compliant blog post about: ${topic}
Keywords to include: ${keywords.join(', ')}

Requirements:
- Educational content only
- No medical claims
- Include legal disclaimers
- SEO-friendly
- 300-500 words

Format as JSON with "title" and "content" fields:`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    const result = response.choices[0]?.message?.content || '';
    
    try {
      return JSON.parse(result);
    } catch {
      return {
        title: `Understanding ${topic}`,
        content: result
      };
    }
  }
};
