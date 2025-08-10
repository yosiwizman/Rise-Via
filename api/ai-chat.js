// Vercel Serverless Function for AI Chat
// This runs on the server, keeping your API key secure

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the OpenAI API key from server environment (NOT VITE_ prefixed)
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not configured on server');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    const { message, type = 'chat' } = req.body;

    // Make the OpenAI API call on the server
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable cannabis consultant for Rise-Via. Provide helpful, compliant information about cannabis products.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Unable to generate response';

    // Return the response to the client
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process your request. Please try again.' 
    });
  }
}
