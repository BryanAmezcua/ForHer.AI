import openai from './openai';

const TASTE_PROFILE_PROMPT = `You are a gift-finding assistant. Given a free-text description of a woman written by someone shopping for her, extract a structured taste profile.

Analyze the description and return a JSON object with these fields:

{
  "recipient": {
    "name": string | null,          // Her name if mentioned
    "relationship": string | null,  // e.g. "mom", "girlfriend", "wife", "sister", "grandma", "friend"
    "age": number | null,           // Age or estimate if mentioned
    "lifestage": string | null      // e.g. "college student", "new mom", "retired", "young professional"
  },
  "occasion": {
    "event": string | null,         // e.g. "birthday", "anniversary", "christmas", "just because"
    "urgency": string | null        // "immediate" (1-3 days), "soon" (1-2 weeks), "relaxed" (2+ weeks), or null
  },
  "budget": {
    "min": number | null,           // Lower bound in USD
    "max": number | null,           // Upper bound in USD
    "flexibility": string | null    // "strict", "flexible", or "open"
  },
  "interests": string[],            // Hobbies, passions, things she loves (e.g. "gardening", "true crime podcasts", "fancy coffee")
  "aesthetic": {
    "style": string[],              // Style descriptors (e.g. "minimalist", "bohemian", "classic", "cozy")
    "avoids": string[]              // Things she dislikes or would not want
  },
  "personality": {
    "traits": string[],             // Personality read (e.g. "practical", "sentimental", "adventurous")
    "giftReceivingStyle": string | null  // How she likely receives gifts: "hard to shop for", "appreciates anything", "very specific taste", "experiences over things"
  },
  "constraints": string[],          // Hard constraints (e.g. "hates clutter", "allergic to fragrance", "doesn't wear jewelry")
  "giftingContext": {
    "previousGifts": string[],      // Anything mentioned as already given or she already owns
    "avoidCategories": string[],    // Categories to skip (e.g. "candles", "gift cards")
    "leanToward": string | null     // If the user hinted at a direction (e.g. "something experiential", "something she'd never buy herself")
  }
}

Rules:
- Only populate fields where the description provides signal. Use null for unknown scalars and empty arrays for unknown lists.
- Read between the lines. "She never buys anything for herself" implies she's practical and selfless — lean toward indulgent gifts.
- "Hates clutter" means avoid physical objects unless they're consumable or replace something she already has.
- If no budget is mentioned, leave it null — don't guess.
- Be specific with interests. "Cooking" is fine, but "baking sourdough" is better if the description supports it.
- Infer personality and aesthetic from context clues, not just explicit statements.
- Return ONLY the JSON object, no markdown fencing, no explanation.`;

export async function generateTasteProfile(description) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: TASTE_PROFILE_PROMPT },
      { role: 'user', content: description },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content.trim();

  // Strip markdown fencing if the model adds it anyway
  const cleaned = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  return JSON.parse(cleaned);
}
