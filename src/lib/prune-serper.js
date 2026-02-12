const MAX_RESULTS = 10;
const MIN_PRICE = 5; // Items under $5 are probably not real gifts

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

// ── Count how many interest tokens appear in the product title ──
function interestOverlap(titleTokens, interests) {
  if (!interests || interests.length === 0) return 0;

  const titleSet = new Set(titleTokens);
  let hits = 0;

  for (const interest of interests) {
    const interestTokens = tokenize(interest);
    for (const token of interestTokens) {
      if (titleSet.has(token)) {
        hits++;
        break; // count each interest once
      }
    }
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
 * Drops items without images, scores remainder on budget fit,
 * cluster size, interest relevance, data completeness, and price sanity.
 * Returns the top 10.
 *
 * @param {Array} products - Deduplicated shopping items (with clusterSize attached)
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {Array} Top 10 pruned products
 */
export function pruneSerperResults(products, tasteProfile) {
  const { budget, interests } = tasteProfile;

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
    const interestHits = interestOverlap(titleTokens, interests);
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

    return { product, total, budgetFit, clusterScore, interestScore, priceScore, completenessScore };
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

  return pruned.map(({ product }) => product);
}
