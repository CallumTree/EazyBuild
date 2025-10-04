
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

export async function callClaude(prompt, options = {}) {
  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY is not configured. Please add it to your Replit Secrets.');
  }

  const {
    model = 'claude-3-5-sonnet-20241022',
    maxTokens = 1024,
    temperature = 1.0,
  } = options;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// Example: Generate property development insights
export async function generateDevelopmentInsights(projectData) {
  const prompt = `Analyze this UK property development project and provide insights:
  
Site Area: ${projectData.siteAreaM2}m²
Estimated Units: ${projectData.estimatedUnits}
GDV: £${projectData.gdv?.toLocaleString()}
Build Cost: £${projectData.buildCost?.toLocaleString()}

Provide brief recommendations on:
1. Viability assessment
2. Potential risks
3. Optimization opportunities`;

  return await callClaude(prompt, { maxTokens: 500 });
}
