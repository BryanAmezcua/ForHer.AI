const MAX_RESULTS = 5;
const MIN_PRICE = 5; // Items under $5 are probably not real gifts
const MIN_TOKEN_LENGTH = 3;

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

// ── Return { count, matched } for interest overlap with title ──
// Checks raw interest tokens first, then falls back to alias tokens
function interestOverlap(titleTokens, interests, interestAliases) {
  if (!interests || interests.length === 0) return { count: 0, matched: [] };

  const titleSet = new Set(meaningfulTokens(titleTokens));
  let count = 0;
  const matched = [];

  for (const interest of interests) {
    // Try raw interest tokens first
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

    if (hit) {
      count++;
      matched.push(interest);
    }
  }

  return { count, matched };
}

// ── Return which aesthetic style terms overlap with the title ──
function aestheticOverlap(titleTokens, aesthetic) {
  if (!aesthetic || !aesthetic.style || aesthetic.style.length === 0) return [];

  const titleSet = new Set(meaningfulTokens(titleTokens));
  const matched = [];

  for (const style of aesthetic.style) {
    const styleTokens = meaningfulTokens(tokenize(style));
    for (const token of styleTokens) {
      if (titleSet.has(token)) {
        matched.push(style);
        break;
      }
    }
  }

  return matched;
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
 * Drops items without images, scores remainder on budget fit,
 * cluster size, interest relevance, data completeness, and price sanity.
 * Returns the top 10.
 *
 * @param {Array} products - Deduplicated shopping items (with clusterSize attached)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {Array} Top 10 pruned products
 */
export function pruneSerperResults(products, tasteProfile) {
  const { budget, interests, interestAliases, aesthetic } = tasteProfile;

  // Hard filter: drop items with no image
  const withImages = products.filter(p => !!p.imageUrl);
  const droppedNoImage = products.length - withImages.length;

  // Score each product
  const scored = withImages.map(product => {
    const priceValue = parsePrice(product.price);
    const titleTokens = tokenize(product.title);

    // 1. Budget fit (0–1, weight 25%)
    const budgetFit = budgetFitScore(priceValue, budget);

    // 2. Cluster size — more retailers = more confidence (weight 20%)
    // Normalize: 1 listing = 0.2, 2 = 0.5, 3+ = 1.0
    const clusterSize = product.clusterSize || 1;
    const clusterScore = clusterSize >= 3 ? 1.0 : clusterSize === 2 ? 0.5 : 0.2;

    // 3. Interest relevance — token overlap with interests (weight 35%)
    const { count: interestHits, matched: matchedInterests } = interestOverlap(titleTokens, interests, interestAliases);
    const matchedAesthetics = aestheticOverlap(titleTokens, aesthetic);
    const interestScore = interests && interests.length > 0
      ? Math.min(interestHits / Math.min(interests.length, 3), 1.0)
      : 0.5; // no interests provided = neutral

    // 4. Price sanity (weight 10%)
    let priceScore = 0.5;
    if (priceValue !== null) {
      priceScore = priceValue >= MIN_PRICE ? 1.0 : 0;
    }

    // 5. Data completeness — has price (weight 10%)
    const completenessScore = priceValue !== null ? 1.0 : 0.2;

    // Weighted total
    const total =
      budgetFit * 0.25 +
      clusterScore * 0.20 +
      interestScore * 0.35 +
      priceScore * 0.10 +
      completenessScore * 0.10;

    return {
      product, total, budgetFit, clusterScore, interestScore, priceScore, completenessScore,
      matchedInterests, matchedAesthetics, priceValue,
    };
  });

  // Sort descending by score, take top N
  scored.sort((a, b) => b.total - a.total);
  const pruned = scored.slice(0, MAX_RESULTS);

  console.log(`\n========== SERPER PRUNE ==========`);
  console.log(`${products.length} products → ${withImages.length} with images → top ${pruned.length} kept`);
  if (droppedNoImage > 0) {
    console.log(`  (${droppedNoImage} dropped for missing image)`);
  }
  for (const { product, total, budgetFit, clusterScore, interestScore } of pruned) {
    console.log(`  [${total.toFixed(2)}] ${product.title} | ${product.price} (budget:${budgetFit.toFixed(1)} cluster:${clusterScore.toFixed(1)} interest:${interestScore.toFixed(1)})`);
  }
  console.log(`==================================\n`);

  return pruned.map(({ product, matchedInterests, matchedAesthetics, budgetFit, priceValue }) => ({
    ...product,
    _matchMeta: { matchedInterests, matchedAesthetics, budgetFit, priceValue },
  }));
}
