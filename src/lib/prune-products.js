import { parsePrice } from './parse-price';
import { debugLog } from './debug';

const COARSE_POOL_SIZE = 30; // Candidates sent to LLM reranker
export const DISPLAY_COUNT = 9; // Final display count
const MIN_PRICE = 15; // Items under $15 are usually junk

/**
 * Coarse pre-filter for the LLM reranker.
 * Applies hard filters (no image, price floor) and soft-sorts
 * remaining candidates by data quality signals.
 * The LLM reranker handles actual quality/relevance judgment.
 *
 * @param {Array} products - Deduplicated shopping items
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {Array} Top ~30 candidates for reranking
 */
export function pruneProducts(products, tasteProfile) {
  const { budget } = tasteProfile;

  // Hard filter: drop items with no image
  const withImages = products.filter(p => !!p.imageUrl);
  const droppedNoImage = products.length - withImages.length;

  // Hard filter: drop items under minimum price (unless budget max is below threshold)
  const budgetMax = budget?.max || Infinity;
  const effectiveMinPrice = budgetMax < MIN_PRICE ? budgetMax * 0.5 : MIN_PRICE;

  const aboveMinPrice = withImages.filter(p => {
    const price = parsePrice(p.price);
    if (price === null) return true; // keep items with unknown price
    return price >= effectiveMinPrice;
  });
  const droppedCheap = withImages.length - aboveMinPrice.length;

  // Soft sort: prioritize items with good data signals for the reranker
  const sorted = aboveMinPrice.map(product => {
    const price = parsePrice(product.price);
    const rating = parseFloat(product.rating) || 0;
    const reviewCount = parseInt((product.reviews || '0').replace(/,/g, ''), 10);

    let score = 0;

    // Rating quality (0-3 points)
    if (rating >= 4.5) score += 3;
    else if (rating >= 4.0) score += 2;
    else if (rating >= 3.5) score += 1;

    // Review volume (0-3 points)
    if (reviewCount >= 1000) score += 3;
    else if (reviewCount >= 100) score += 2;
    else if (reviewCount >= 50) score += 1;

    // Has price info (1 point)
    if (price !== null) score += 1;

    // Budget fit bonus (0-2 points)
    if (price !== null && budget?.max) {
      if (price >= (budget.min || 0) && price <= budget.max) score += 2;
      else if (price <= budget.max * 1.2) score += 1;
    }

    return { product, score };
  });

  sorted.sort((a, b) => b.score - a.score);
  const pruned = sorted.slice(0, COARSE_POOL_SIZE);

  debugLog('\n========== COARSE PRE-FILTER ==========');
  debugLog(`${products.length} products → ${withImages.length} with images → ${aboveMinPrice.length} above $${effectiveMinPrice} min → top ${pruned.length} for reranker`);
  if (droppedNoImage > 0) debugLog(`  (${droppedNoImage} dropped for missing image)`);
  if (droppedCheap > 0) debugLog(`  (${droppedCheap} dropped below $${effectiveMinPrice} min price)`);
  for (const { product, score } of pruned.slice(0, 10)) {
    debugLog(`  [${score}] ${product.title} | ${product.price} | ${product.rating}★ | ${product.reviews} reviews`);
  }
  if (pruned.length > 10) debugLog(`  ... and ${pruned.length - 10} more`);
  debugLog('=======================================\n');

  return pruned.map(({ product }) => product);
}
