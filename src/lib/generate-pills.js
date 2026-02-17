import openai, { MODEL } from './openai';
import { stripMarkdownFences } from './strip-markdown';
import { debugLog } from './debug';

const PILL_PROMPT = `You are a gift recommendation assistant. Given a taste profile describing a gift recipient and a list of products selected for her, generate 1-2 short pill labels per product that explain WHY each product fits her specifically.

Rules:
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

Return ONLY a JSON array of arrays. Each inner array corresponds to the product at that index and contains 1-2 pill objects. Example:
[[{"label":"Baking Enthusiast","category":"interest"}],[{"label":"Minimalist","category":"aesthetic"},{"label":"Self-Care","category":"personality"}],[{"label":"Unique Find","category":"context"}]]`;

/**
 * Generate pill labels for all products in a single LLM call.
 * Runs in parallel with enrichment — only needs product titles + taste profile.
 *
 * @param {Array} products - Pruned products (need .title at minimum)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {Array<Array<{label: string, category: string}>>} Pills per product (by index)
 */
export async function generatePillLabels(products, tasteProfile) {
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
        { role: 'system', content: PILL_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const content = response.choices[0].message.content.trim();
    const pills = JSON.parse(stripMarkdownFences(content));

    // Validate shape: must be array of arrays
    if (!Array.isArray(pills)) return products.map(() => []);

    debugLog('\n========== PILL LABELS ==========');
    products.forEach((p, i) => {
      const labels = (pills[i] || []).map(pill => `${pill.label} (${pill.category})`).join(', ');
      debugLog(`  ${p.title} → ${labels || '(none)'}`);
    });
    debugLog('=================================\n');

    // Ensure we have an array for each product, cap at 2 pills
    return products.map((_, i) => {
      const productPills = pills[i];
      if (!Array.isArray(productPills)) return [];
      return productPills
        .filter(p => p && p.label && p.category)
        .slice(0, 2);
    });
  } catch (err) {
    console.error('Pill label generation failed:', err.message);
    return products.map(() => []);
  }
}
