import openai from './openai';

const QUERY_GENERATION_PROMPT_V1 = `You are generating search queries for a gift recommendation system.
You will receive a structured taste profile JSON with fields like recipient, occasion, budget, interests, aesthetic, personality, constraints, and giftingContext.

Generate exactly 10 high-quality search queries for Tavily web search based on the profile.

Each query must:
- Target real purchasable products or reputable brands
- Reflect the recipient's specific interests, constraints, and personality from the profile
- Avoid generic listicles, SEO bait, and low-quality marketplaces
- Bias toward gift-ready, practical, and comfortable items
- Consider any physical constraints mentioned (pain, comfort, usability)
- Prefer premium or well-reviewed items over cheap bulk products
- Respect budget.min and budget.max if provided
- Respect avoidCategories and constraints — never generate queries for excluded items

Return a JSON object in this format:

{
  "queries": [
    {
      "q": "<search query>",
      "intent": "product"
    }
  ]
}

Query distribution (must total exactly 10):
- 10 "product" queries — specific, purchasable items derived from interests and aesthetic. Include concrete anchors such as "gift set", "boxed", "travel size", "bundle"

Rules:
- Use concrete descriptors (materials, use case, comfort, packaging)
- Never use phrases like "best gifts", "top 10", or "ideas for"
- Queries should read like what a knowledgeable shopper would type, not a gift guide headline
- Return ONLY valid JSON. No explanations.`;

/* const QUERY_GENERATION_PROMPT_V2 = `You are generating search queries for a gift recommendation system.
You will receive a structured taste profile JSON with fields like recipient, occasion, budget, interests, aesthetic, personality, constraints, and giftingContext.

Generate exactly 10 high-quality search queries for Tavily web search based on the profile.

Each query must:
- Target real purchasable products or reputable brands
- Reflect the recipient's specific interests, constraints, and personality from the profile
- Avoid generic listicles, SEO bait, and low-quality marketplaces
- Bias toward gift-ready, practical, and comfortable items
- Consider any physical constraints mentioned (pain, comfort, usability)
- Prefer premium or well-reviewed items over cheap bulk products
- Respect budget.min and budget.max if provided
- Respect avoidCategories and constraints — never generate queries for excluded items

Return a JSON object in this format:

{
  "queries": [
    {
      "q": "<search query>",
      "intent": "<one of: product | brand | validation | fallback | logistics>"
    }
  ]
}

Query distribution (must total exactly 10):
- 6 "product" queries — specific, purchasable items derived from interests and aesthetic. Include concrete anchors such as "gift set", "boxed", "travel size", "bundle"
- 2 "brand" queries — discover high-quality makers or artisan shops relevant to her taste
- 1 "validation" query — check reviews or Reddit/forum discussions for a top pick
- 1 "logistics" query — If urgency is unknown, still include 1 logistics queries optimized for fast shipping (Prime, overnight, 2-day)

Rules:
- Use concrete descriptors (materials, use case, comfort, packaging)
- Never use phrases like "best gifts", "top 10", or "ideas for"
- Queries should read like what a knowledgeable shopper would type, not a gift guide headline
- Return ONLY valid JSON. No explanations.`; */

export async function generateQueries(tasteProfile) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: QUERY_GENERATION_PROMPT_V1 },
      { role: 'user', content: JSON.stringify(tasteProfile) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0].message.content);
}
