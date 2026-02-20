import openai, { MODEL } from './openai';
import { stripMarkdownFences } from './strip-markdown';

const TASTE_PROFILE_PROMPT = `You are a gift-finding assistant. Given a free-text description of a woman written by someone shopping for her, extract a structured taste profile.

Analyze the description and return a JSON object with these fields:

{
  "recipient": {
    "name": string | null,
    "relationship": string | null,  // e.g. "mom", "girlfriend", "wife", "sister", "grandma", "friend"
    "age": number | null,
    "lifestage": string | null      // e.g. "college student", "new mom", "retired", "young professional"
  },
  "occasion": {
    "event": string | null,         // e.g. "birthday", "anniversary", "christmas", "just because"
    "urgency": string | null        // "immediate", "soon", "relaxed", or null
  },
  "budget": {
    "min": number | null,
    "max": number | null,
    "flexibility": string | null    // "strict", "flexible", or "open"
  },
  "interests": string[],            // Hobbies, passions, things she loves (e.g. "gardening", "true crime podcasts", "fancy coffee")
  "interestAliases": {              // Shopping-oriented synonym expansion for each interest
    "[interest]": string[]          // ~10 tokens per interest — product terms, synonyms, and related words likely to appear in shopping titles
  },
  "aesthetic": {
    "style": string[],              // e.g. "minimalist", "bohemian", "classic", "cozy"
    "avoids": string[]
  },
  "personality": {
    "traits": string[],             // e.g. "practical", "sentimental", "adventurous"
    "giftReceivingStyle": string | null  // "hard to shop for", "appreciates anything", "very specific taste", "experiences over things"
  },
  "constraints": string[],
  "giftingContext": {
    "previousGifts": string[],
    "avoidCategories": string[],
    "leanToward": string | null
  },
  "searchQueries": [                // 5 broad Amazon search queries — ALWAYS generate these
    { "q": string },
    { "q": string },
    { "q": string },
    { "q": string },
    { "q": string }
  ]
}

Rules:
- Only populate fields where the description provides signal. Use null for unknown scalars and empty arrays for unknown lists.
- Read between the lines. "She never buys anything for herself" implies she's practical and selfless — lean toward indulgent gifts.
- "Hates clutter" means avoid physical objects unless they're consumable or replace something she already has.
- If no budget is mentioned, leave it null — don't guess.
- Be specific with interests. "Cooking" is fine, but "baking sourdough" is better if the description supports it.
- Infer personality and aesthetic from context clues, not just explicit statements.
- For interestAliases: generate ~10 shopping-relevant tokens per interest. These should be product names, brand-neutral terms, synonyms, and related words that would appear in Amazon product titles. Example: "fancy coffee" → ["espresso", "pour-over", "latte", "barista", "grinder", "french press", "cold brew", "drip", "moka", "chemex"]. Focus on commercial/product language, not abstract concepts. Every interest in the interests array must have a corresponding entry in interestAliases.
- ALWAYS generate exactly 5 searchQueries. Never omit them.

Search query rules:
- Generate exactly 5 gift-oriented Amazon search queries. Frame every query around gift discovery, NOT raw supplies or equipment.
- Each query should explore a DIFFERENT angle/interest from the profile.
- Keep queries under 8 words when possible. Use simple, everyday language.
- Use "top", "top rated", or "best" to lead queries — these surface popular, well-reviewed products on Amazon.
- Connect the recipient relationship + interest: "top gifts for [relationship] who loves [interest]"
- Good: "top gifts for girlfriend who loves cooking", "best gifts for mom who likes gardening", "top rated yoga gifts for wife", "top gifts for her self care", "best cozy gifts for homebody girlfriend"
- Bad (raw supplies, not gifts): "knitting supplies for women", "workout gear for girlfriend", "baking tools kitchen"
- Bad (too specific/SEO-y): "artisan hand-thrown ceramic pour-over dripper gift set", "best luxury organic body oil premium gift box 2024"
- Respect avoidCategories and constraints — never generate queries for excluded items.
- Return ONLY the JSON object, no markdown fencing, no explanation.`;

export async function generateProfileAndQueries(description) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: TASTE_PROFILE_PROMPT },
      { role: 'user', content: description },
    ],
    temperature: 0.3,
    max_tokens: 2100,
  });

  const content = response.choices[0].message.content.trim();

  return JSON.parse(stripMarkdownFences(content));
}
