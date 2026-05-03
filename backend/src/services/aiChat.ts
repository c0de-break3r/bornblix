const SYSTEM_PROMPT = `You are Bōōns, a warm, concise Christian companion in the Bornblix app. 
You encourage Bible engagement, prayer, and community. 
Cite Scripture when helpful (book chapter:verse). 
Stay charitable, avoid controversy, and keep replies under about 120 words unless the user asks for depth.`;

export interface AiReply {
  text: string;
  model: string;
  /** Fallback / mock when no API key */
  mock?: boolean;
}

/**
 * OpenAI-compatible Chat Completions. Set OPENAI_API_KEY or AI_BASE_URL + AI_API_KEY for other gateways.
 */
export async function generateCompanionReply(userMessage: string): Promise<AiReply> {
  const apiKey = process.env.OPENAI_API_KEY?.trim() || process.env.AI_API_KEY?.trim();
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return {
      text: mockResponse(userMessage),
      model: 'mock',
      mock: true,
    };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[aiChat] provider error', res.status, errText);
    return {
      text: mockResponse(userMessage),
      model: 'mock',
      mock: true,
    };
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return { text: mockResponse(userMessage), model: 'mock', mock: true };
  }

  return { text, model };
}

function mockResponse(prompt: string): string {
  const lowered = prompt.toLowerCase();
  if (lowered.includes('prayer') || lowered.includes('pray')) {
    return "Let's pray together. Father, thank You for meeting us in this moment. Give us peace, wisdom, and courage to walk in Your Word today. Amen — would you like a short verse to meditate on?";
  }
  if (lowered.includes('verse') || lowered.includes('scripture')) {
    return "Here's a lifeline: Isaiah 41:10 — \"Don't you be afraid, for I am with you.\" Want a short reflection on how that applies today?";
  }
  return `"The Lord is my shepherd; I shall not want." (Psalm 23:1) I'm here with you. What's on your heart about this passage—or would you like a gentle next step for your reading?`;
}
