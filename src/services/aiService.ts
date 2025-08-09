import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import productsData from '../data/products.json';

const openaiApiKey = import.meta.env?.VITE_OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('VITE_OPENAI_API_KEY not provided - AI features will be limited');
}

export const aiService = {
  model: openaiApiKey ? new ChatOpenAI({
    openAIApiKey: openaiApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  }) : null,

  async getCannabisInfo(query: string): Promise<string> {
    if (!this.model) throw new Error('AI service not configured');
    
    const template = PromptTemplate.fromTemplate(`
      You are a cannabis expert assistant for RiseViA. Answer questions about cannabis, THCA, strains, and effects.
      Always include legal disclaimers and compliance information.
      
      Available strains: {strains}
      
      Question: {question}
      
      Answer with accurate, compliant information:
    `);

    const chain = template.pipe(this.model).pipe(new StringOutputParser());
    
    const strainInfo = productsData.products.map(p => 
      `${p.name} (${p.strainType}, ${p.thcaPercentage}% THCA): ${p.description}`
    ).join('\n');

    return await chain.invoke({
      strains: strainInfo,
      question: query
    });
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
    if (!this.model) throw new Error('AI service not configured');
    
    const template = PromptTemplate.fromTemplate(`
      Generate a compliant product description for a cannabis strain with these details:
      - Name: {name}
      - Type: {type}
      - Effects: {effects}
      
      Requirements:
      - No medical claims
      - Include legal disclaimers
      - Age-appropriate content
      - Professional tone
      - 2-3 sentences maximum
      
      Description:
    `);

    const chain = template.pipe(this.model).pipe(new StringOutputParser());
    
    return await chain.invoke({
      name: productName,
      type: strainType,
      effects: effects.join(', ')
    });
  },

  async generateBlogPost(topic: string, keywords: string[]): Promise<{ title: string; content: string }> {
    if (!this.model) throw new Error('AI service not configured');
    
    const template = PromptTemplate.fromTemplate(`
      Create a compliant blog post about: {topic}
      Keywords to include: {keywords}
      
      Requirements:
      - Educational content only
      - No medical claims
      - Include legal disclaimers
      - SEO-friendly
      - 300-500 words
      
      Format as JSON with "title" and "content" fields:
    `);

    const chain = template.pipe(this.model).pipe(new StringOutputParser());
    
    const result = await chain.invoke({
      topic,
      keywords: keywords.join(', ')
    });

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
