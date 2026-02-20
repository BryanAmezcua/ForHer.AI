import openai, { MODEL } from './openai';
import { stripMarkdownFences } from './strip-markdown';
import { debugLog } from './debug';

const RERANK_LIMIT = 12;

const RERANK_PROMPT = `You are curating a luxury gift recommendation experience. Every product you select should make the user think "this app has great taste." Your job is to evaluate candidate products and select the best ones as gifts.

You will receive:
- A taste profile describing the gift recipient
- A list of candidate products with title, price, rating, and review count

Rank the candidates from best to worst gift, then return the top ${RERANK_LIMIT}.

Ranking hierarchy (in strict priority order):
1. RECOGNIZED, REPUTABLE BRANDS — Le Creuset, Yeti, Stanley, Lululemon, Dyson, Kindle, Apple, JBL, KitchenAid, Moleskine, Hydro Flask, Cuisinart, Bose, Sony, Samsung, Nespresso, Staub, Lodge, Anthropologie, Rifle Paper Co, etc. Known brands signal quality and taste. If a recognized brand appears, it should almost always rank above unbranded/unknown items.
2. PREMIUM/ARTISAN BRANDS — Smaller but well-regarded brands (Burt's Bees, Mrs. Meyer's, Herbivore Botanicals, Voluspa, Uncommon Goods, etc.) that signal curation quality.
3. WELL-REVIEWED UNBRANDED — 4.5+ stars with 500+ reviews can compensate for lack of brand recognition.
4. HARD REJECT — Novelty/slogan items ("BEST MOM EVER" socks), cheap generic bundles, no-name items with few reviews, anything that looks like dollar-store quality, "funny" gifts, gift baskets full of random items, products explicitly marketed to men (men's, for him, for dad, for boyfriend, masculine-branded items) — this app recommends gifts for women only. These should NEVER appear in results.

Additional ranking signals (after brand quality):
- Relevance to the recipient's specific interests and personality
- Price appropriateness for the occasion and relationship
- Product quality indicators (rating, review count)

For each selected product, provide:
- "index": the 0-based index from the candidate list
- "giftScore": 0-100 quality score (90+ = recognized brand + relevant, 70-89 = good quality, 50-69 = acceptable, below 50 = reject)
- "reason": max 10 words explaining why this is a good pick

Return ONLY a JSON array of objects, ordered best to worst:
[{"index":0,"giftScore":95,"reason":"Premium brand, perfect for her cooking hobby"},{"index":5,"giftScore":82,"reason":"Well-reviewed, matches her minimalist style"}]

Return at most ${RERANK_LIMIT} products. If fewer than ${RERANK_LIMIT} candidates are worthy, return fewer. Hard-reject novelty and junk — it's better to return 8 great products than 12 mediocre ones.`;

/**
 * LLM reranker — evaluates ~25-30 candidates and returns the top 12
 * ranked by gift quality, with brand recognition as the #1 signal.
 *
 * @param {Array} candidates - Coarse-filtered products (from pruneProducts)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {Array} Reranked products with _matchScore and _rerankerReason attached
 */
export async function rerankProducts(candidates, tasteProfile) {
  if (candidates.length === 0) return [];

  // Build compact profile summary
  const profileSummary = {
    interests: tasteProfile.interests,
    aesthetic: tasteProfile.aesthetic,
    personality: tasteProfile.personality,
    occasion: tasteProfile.occasion,
    relationship: tasteProfile.recipient?.relationship,
    budget: tasteProfile.budget,
  };

  // Build candidate list for the prompt
  const candidateList = candidates.map((p, i) => {
    const parts = [`${i}. "${p.title}"`];
    if (p.price) parts.push(`$${p.price}`);
    if (p.rating) parts.push(`${p.rating}★`);
    if (p.reviews) parts.push(`${p.reviews} reviews`);
    return parts.join(' | ');
  }).join('\n');

  const userMessage = `Taste profile:\n${JSON.stringify(profileSummary, null, 2)}\n\nCandidates:\n${candidateList}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: RERANK_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content.trim();
    const ranked = JSON.parse(stripMarkdownFences(content));

    if (!Array.isArray(ranked)) {
      console.error('Reranker returned non-array, falling back to input order');
      return fallback(candidates);
    }

    // Map ranked results back to products
    const reranked = [];
    for (const entry of ranked) {
      const idx = entry.index;
      if (idx == null || idx < 0 || idx >= candidates.length) continue;

      const product = candidates[idx];
      product._matchScore = Math.max(0, Math.min(100, entry.giftScore || 0));
      product._rerankerReason = entry.reason || null;
      reranked.push(product);
    }

    debugLog('\n========== LLM RERANK ==========');
    for (const p of reranked) {
      debugLog(`  [${p._matchScore}] ${p.title} — ${p._rerankerReason}`);
    }
    debugLog(`  ${candidates.length} candidates → ${reranked.length} reranked`);
    debugLog('================================\n');

    return reranked.length > 0 ? reranked : fallback(candidates);
  } catch (err) {
    console.error('Reranker failed, falling back to input order:', err.message);
    return fallback(candidates);
  }
}

/**
 * Fallback: return candidates as-is with default scores
 */
function fallback(candidates) {
  return candidates.slice(0, RERANK_LIMIT).map((p, i) => {
    p._matchScore = Math.max(50, 80 - i * 3);
    p._rerankerReason = null;
    return p;
  });
}
