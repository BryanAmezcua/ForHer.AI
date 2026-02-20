import openai, { MODEL } from './openai';
import { stripMarkdownFences } from './strip-markdown';
import { debugLog } from './debug';

const SYSTEM_PROMPT = `You are a gift recommendation assistant. Given a taste profile describing a gift recipient and a list of products selected for her, generate two things per product:

1. **pills** — 1-2 short pill labels explaining WHY this product fits her specifically.
2. **whySheLikesIt** — A 1-2 sentence personalized description (max ~30 words) connecting this product to her interests, personality, or the occasion. Write as if explaining to the gift-giver why this is a great pick for her.

Pill rules:
- Each pill has a "label" (2-4 words) and a "category" (one of: "interest", "aesthetic", "personality", "context")
- Use "interest" when connecting to a specific hobby, passion, or interest from the profile
- Use "aesthetic" when it matches her style or aesthetic preferences
- Use "personality" when it reflects her personality traits or gifting context
- Use "context" for quality signals like "Handmade" or "Small-Batch", occasion fit, or general gifting appeal (e.g. "Thoughtful Gift", "Unique Find", "Crowd Pleaser")
- Do NOT restate the product name or its obvious category (e.g. don't say "Coffee Lover" for a coffee maker, or "Bath" for a bath product)
- Each pill should add context the user can't already see from the product name
- Prefer connecting pills to something specific in the taste profile, but if the connection is weak you may use a "context" pill that highlights the product's gifting appeal
- Every product MUST have at least 1 pill — always find something meaningful to say
- Keep labels concise and title-cased (e.g. "Baking Enthusiast", "Minimalist", "Self-Care")

For whySheLikesIt:
- If a "rerankerReason" is provided for a product, use it as a starting signal for WHY this product was selected — but rewrite it into a natural, gift-giver-friendly sentence
- Focus on connecting the product to HER specifically, not generic product praise

Return ONLY a JSON array of objects. Each object corresponds to the product at that index:
[{"pills":[{"label":"Baking Enthusiast","category":"interest"}],"whySheLikesIt":"Perfect for her weekend baking sessions — she'll love experimenting with new recipes."},{"pills":[{"label":"Minimalist","category":"aesthetic"},{"label":"Self-Care","category":"personality"}],"whySheLikesIt":"Matches her minimalist style and gives her the self-care moment she deserves."}]`;

/**
 * Generate pill labels and "why she'll like it" descriptions for all products in a single LLM call.
 *
 * @param {Array} products - Products (need .title at minimum, may have ._rerankerReason)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {{ pills: Array<Array<{label: string, category: string}>>, whySheLikesIt: string[] }}
 */
export async function generateProductInsights(products, tasteProfile) {
  const empty = { pills: products.map(() => []), whySheLikesIt: products.map(() => null) };

  // Build a compact profile summary for the prompt
  const profileSummary = {
    interests: tasteProfile.interests,
    aesthetic: tasteProfile.aesthetic,
    personality: tasteProfile.personality,
    giftingContext: tasteProfile.giftingContext,
    occasion: tasteProfile.occasion,
  };

  const productList = products.map((p, i) => {
    let line = `${i + 1}. "${p.title}"`;
    if (p._rerankerReason) line += ` (rerankerReason: "${p._rerankerReason}")`;
    return line;
  }).join('\n');

  const userMessage = `Taste profile:\n${JSON.stringify(profileSummary, null, 2)}\n\nProducts:\n${productList}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1100,
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(stripMarkdownFences(content));

    // Validate shape: must be array of objects
    if (!Array.isArray(parsed)) return empty;

    debugLog('\n========== PRODUCT INSIGHTS ==========');
    products.forEach((p, i) => {
      const entry = parsed[i] || {};
      const labels = (entry.pills || []).map(pill => `${pill.label} (${pill.category})`).join(', ');
      debugLog(`  ${p.title} → ${labels || '(none)'}`);
    });
    debugLog('======================================\n');

    const pills = products.map((_, i) => {
      const entry = parsed[i];
      if (!entry || !Array.isArray(entry.pills)) return [];
      return entry.pills
        .filter(p => p && p.label && p.category)
        .slice(0, 2);
    });

    const whySheLikesIt = products.map((_, i) => {
      const entry = parsed[i];
      return (entry && typeof entry.whySheLikesIt === 'string') ? entry.whySheLikesIt : null;
    });

    return { pills, whySheLikesIt };
  } catch (err) {
    console.error('Product insight generation failed:', err.message);
    return empty;
  }
}
