import openai, { MODEL } from './openai';

const DEEP_QUERY_PROMPT = `You are generating broad Google search queries for a gift recommendation system.
You will receive a structured taste profile JSON with fields like recipient, occasion, budget, interests, aesthetic, personality, constraints, and giftingContext.

Generate exactly 3 broad, natural Google search queries that a real person would type to find gifts based on this profile.

Each query should:
- Be broad and natural — like what someone would actually type into Google
- Focus on one distinct angle or interest from the profile
- Target gift discovery, not a specific product
- Use simple, everyday language
- Incorporate the recipient relationship and key interests

Examples of good queries:
- "gifts for girlfriend who likes cooking"
- "cute gym gifts for women"
- "body oil gift set women"
- "cozy gifts for homebody girlfriend"
- "unique birthday gifts for wife who loves yoga"

Examples of BAD queries (too specific, too SEO-y):
- "artisan hand-thrown ceramic pour-over dripper gift set"
- "best luxury organic body oil premium gift box 2024"
- "top 10 gym accessories women fitness"

Return a JSON object in this format:
{
  "queries": [
    { "q": "<search query>" },
    { "q": "<search query>" },
    { "q": "<search query>" }
  ]
}

Rules:
- Each query should explore a DIFFERENT angle/interest from the profile
- Keep queries under 8 words when possible
- Respect avoidCategories and constraints — never generate queries for excluded items
- Return ONLY valid JSON. No explanations.`;

export async function generateDeepQueries(tasteProfile) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: DEEP_QUERY_PROMPT },
      { role: 'user', content: JSON.stringify(tasteProfile) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content);
}
