import openai, { MODEL } from './openai';
import { stripMarkdownFences } from './strip-markdown';
import { debugLog } from './debug';

const SYSTEM_PROMPT = `You are a gift recommendation assistant. Given a taste profile describing a gift recipient and a list of products selected for her, generate two things per product:

1. **pills** — 1-2 short pill labels explaining WHY this product fits her specifically.
2. **reactionLine** — A short, warm predicted reaction from the recipient (6-12 words).

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

Reaction line rules:
- Write as if predicting what the recipient would say or feel when receiving this gift
- Keep it warm, specific, and conversational — not generic
- 6-12 words, no quotes around it
- Examples: "She'll use this every single morning", "This is so her style", "She's been eyeing something like this"
- Avoid generic lines like "She'll love it" — connect to something specific about her or the product

Return ONLY a JSON array of objects. Each object corresponds to the product at that index:
[{"pills":[{"label":"Baking Enthusiast","category":"interest"}],"reactionLine":"She'll want to bake every weekend"},{"pills":[{"label":"Minimalist","category":"aesthetic"},{"label":"Self-Care","category":"personality"}],"reactionLine":"This is exactly her vibe"}]`;

/**
 * Generate pill labels and reaction lines for all products in a single LLM call.
 * Runs in parallel with enrichment — only needs product titles + taste profile.
 *
 * @param {Array} products - Pruned products (need .title at minimum)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {{ pills: Array<Array<{label: string, category: string}>>, reactionLines: string[] }}
 */
export async function generateProductInsights(products, tasteProfile) {
  const empty = { pills: products.map(() => []), reactionLines: products.map(() => null) };

  // Build a compact profile summary for the prompt (no aliases or clarification needed)
  const profileSummary = {
    interests: tasteProfile.interests,
    aesthetic: tasteProfile.aesthetic,
    personality: tasteProfile.personality,
    giftingContext: tasteProfile.giftingContext,
    occasion: tasteProfile.occasion,
  };

  const productList = products.map((p, i) => `${i + 1}. "${p.title}"`).join('\n');

  const userMessage = `Taste profile:\n${JSON.stringify(profileSummary, null, 2)}\n\nProducts:\n${productList}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 900,
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(stripMarkdownFences(content));

    // Validate shape: must be array of objects
    if (!Array.isArray(parsed)) return empty;

    debugLog('\n========== PRODUCT INSIGHTS ==========');
    products.forEach((p, i) => {
      const entry = parsed[i] || {};
      const labels = (entry.pills || []).map(pill => `${pill.label} (${pill.category})`).join(', ');
      debugLog(`  ${p.title} → ${labels || '(none)'} | "${entry.reactionLine || '(none)'}"`);
    });
    debugLog('======================================\n');

    const pills = products.map((_, i) => {
      const entry = parsed[i];
      if (!entry || !Array.isArray(entry.pills)) return [];
      return entry.pills
        .filter(p => p && p.label && p.category)
        .slice(0, 2);
    });

    const reactionLines = products.map((_, i) => {
      const entry = parsed[i];
      return (entry && typeof entry.reactionLine === 'string') ? entry.reactionLine : null;
    });

    return { pills, reactionLines };
  } catch (err) {
    console.error('Product insight generation failed:', err.message);
    return empty;
  }
}
