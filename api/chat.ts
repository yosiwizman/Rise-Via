import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// This runs on Vercel's servers, not in the browser
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // No VITE_ prefix!
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { message, type } = await request.json();

    let response;
    
    switch (type) {
      case 'chat': {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a cannabis consultant...' },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
        });
        response = completion.choices[0]?.message?.content;
        break;
      }
        
      case 'recommendation':
        // Handle product recommendations
        break;
        
      default:
        response = 'Invalid request type';
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
