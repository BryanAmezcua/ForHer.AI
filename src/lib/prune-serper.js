const ENRICH_POOL_SIZE = 16; // Pre-enrichment pool — over-fetch to allow PDP filtering
export const DISPLAY_COUNT = 9; // Final display count after PDP scoring
const MIN_PRICE = 5; // Items under $5 are probably not real gifts
const MIN_TOKEN_LENGTH = 3;

const GIFT_SET_PATTERNS = [
  /gift\s*set/i, /gift\s*box/i, /gift\s*basket/i, /gift\s*kit/i,
  /care\s*package/i, /variety\s*pack/i, /sampler\s*set/i,
  /assortment/i, /bundle\s*set/i, /spa\s*set/i,
  /gift\s*collection/i, /gift\s*pack/i,
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'as', 'be', 'was',
  'are', 'been', 'has', 'had', 'do', 'did', 'not', 'no', 'so', 'if',
  'she', 'her', 'he', 'his', 'they', 'them', 'we', 'us', 'my', 'our',
  'set', 'new', 'all', 'get', 'got', 'can', 'one', 'two', 'also',
]);

// ── Parse price string to number ──
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// ── Normalize text for token matching ──
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

// ── Filter out stopwords and short tokens ──
function meaningfulTokens(tokens) {
  return tokens.filter(t => t.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(t));
}

// ── Count how many interests overlap with the product title ──
// Checks raw interest tokens first, then falls back to alias tokens.
// Used for pruning scores only — pill labels are generated separately via LLM.
function interestOverlap(titleTokens, interests, interestAliases) {
  if (!interests || interests.length === 0) return 0;

  const titleSet = new Set(meaningfulTokens(titleTokens));
  let hits = 0;

  for (const interest of interests) {
    const interestTokens = meaningfulTokens(tokenize(interest));
    let hit = false;
    for (const token of interestTokens) {
      if (titleSet.has(token)) {
        hit = true;
        break;
      }
    }

    // Fall back to alias tokens if no direct hit
    if (!hit && interestAliases) {
      const aliases = interestAliases[interest] || [];
      for (const alias of aliases) {
        const aliasTokens = meaningfulTokens(tokenize(alias));
        for (const token of aliasTokens) {
          if (titleSet.has(token)) {
            hit = true;
            break;
          }
        }
        if (hit) break;
      }
    }

    if (hit) hits++;
  }

  return hits;
}

// ── Check if price falls within budget range ──
function budgetFitScore(priceValue, budget) {
  if (priceValue === null) return 0.3; // unknown price = neutral
  if (!budget || (budget.min === null && budget.max === null)) return 0.5; // no budget = neutral

  const min = budget.min || 0;
  const max = budget.max || Infinity;

  if (priceValue >= min && priceValue <= max) return 1.0; // perfect fit

  // Within 20% over/under = partial credit
  const lowerBound = min * 0.8;
  const upperBound = max === Infinity ? Infinity : max * 1.2;
  if (priceValue >= lowerBound && priceValue <= upperBound) return 0.5;

  return 0; // way outside budget
}

/**
 * Scores and prunes deduplicated Serper shopping results.
 * Drops items without images and gift sets/bundles, scores remainder on
 * budget fit, cluster size, interest relevance, data completeness, and price sanity.
 * Returns the top 14 (enrichment pool — PDP scoring trims to 9 downstream).
 *
 * @param {Array} products - Deduplicated shopping items (with clusterSize attached)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {Array} Top 14 pruned products (enrichment pool)
 */
export function pruneSerperResults(products, tasteProfile) {
  const { budget, interests, interestAliases } = tasteProfile;

  // Hard filter: drop items with no image
  const withImages = products.filter(p => !!p.imageUrl);
  const droppedNoImage = products.length - withImages.length;

  // Hard filter: drop gift sets / bundles
  const noGiftSets = withImages.filter(p => !GIFT_SET_PATTERNS.some(rx => rx.test(p.title)));
  const droppedGiftSets = withImages.length - noGiftSets.length;

  // Score each product
  const scored = noGiftSets.map(product => {
    const priceValue = parsePrice(product.price);
    const titleTokens = tokenize(product.title);

    // 1. Interest relevance (weight 30%)
    const interestHits = interestOverlap(titleTokens, interests, interestAliases);
    const interestScore = interests && interests.length > 0
      ? Math.min(interestHits / Math.min(interests.length, 3), 1.0)
      : 0.5;

    // 2. Budget fit (weight 25%)
    const budgetFit = budgetFitScore(priceValue, budget);

    // 3. Confidence — cluster size + rating boost (weight 20%)
    const clusterSize = product.clusterSize || 1;
    let confidence = clusterSize >= 3 ? 1.0 : clusterSize === 2 ? 0.5 : 0.2;
    if (product.rating && product.rating >= 4.0) confidence = Math.min(confidence + 0.3, 1.0);
    else if (product.rating && product.rating >= 3.0) confidence = Math.min(confidence + 0.1, 1.0);

    // 4. Price sanity (weight 10%)
    let priceScore = 0.5;
    if (priceValue !== null) {
      priceScore = priceValue >= MIN_PRICE ? 1.0 : 0;
    }

    // 5. Data completeness — price + rating + reviews (weight 10%)
    let completenessScore = 0;
    if (priceValue !== null) completenessScore += 0.5;
    if (product.rating) completenessScore += 0.25;
    if (product.reviews) completenessScore += 0.25;

    // 6. Review volume (weight 5%)
    const reviewCount = parseInt((product.reviews || '0').replace(/,/g, ''), 10);
    const reviewScore = reviewCount >= 100 ? 1.0 : reviewCount >= 10 ? 0.5 : 0.1;

    // Weighted total
    const total =
      interestScore * 0.30 +
      budgetFit * 0.25 +
      confidence * 0.20 +
      priceScore * 0.10 +
      completenessScore * 0.10 +
      reviewScore * 0.05;

    return { product, total, budgetFit, confidence, interestScore, priceScore, completenessScore, reviewScore };
  });

  // Sort descending by score, take top N (enrichment pool)
  scored.sort((a, b) => b.total - a.total);
  const pruned = scored.slice(0, ENRICH_POOL_SIZE);

  console.log(`\n========== SERPER PRUNE ==========`);
  console.log(`${products.length} products → ${withImages.length} with images → ${noGiftSets.length} after gift-set filter → top ${pruned.length} kept (pool for enrichment)`);
  if (droppedNoImage > 0) {
    console.log(`  (${droppedNoImage} dropped for missing image)`);
  }
  if (droppedGiftSets > 0) {
    console.log(`  (${droppedGiftSets} dropped for gift set/bundle title)`);
  }
  for (const { product, total, budgetFit, confidence, interestScore, reviewScore } of pruned) {
    console.log(`  [${total.toFixed(2)}] ${product.title} | ${product.price} (budget:${budgetFit.toFixed(1)} conf:${confidence.toFixed(1)} interest:${interestScore.toFixed(1)} reviews:${reviewScore.toFixed(1)})`);
  }
  console.log(`==================================\n`);

  return pruned.map(({ product }) => product);
}
