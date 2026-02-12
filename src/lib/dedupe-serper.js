// ── Junk words that retailers pad into shopping titles ──
const JUNK_WORDS = new Set([
  'free', 'shipping', 'sale', 'new', 'best', 'seller', 'bestseller',
  'hot', 'deal', 'deals', 'limited', 'edition', 'exclusive', 'official',
  'authentic', 'genuine', 'original', 'buy', 'shop', 'online', 'store',
  'fast', 'delivery', 'prime', 'walmart', 'target', 'amazon', 'ebay',
]);

// ── Synonym map for common abbreviations ──
const SYNONYMS = new Map([
  ['qt', 'quart'],
  ['oz', 'ounce'],
  ['pc', 'piece'],
  ['pcs', 'piece'],
  ['pk', 'pack'],
  ['ct', 'count'],
  ['sm', 'small'],
  ['md', 'medium'],
  ['lg', 'large'],
  ['xl', 'extra large'],
  ['in', 'inch'],
  ['ft', 'foot'],
  ['lb', 'pound'],
  ['lbs', 'pound'],
  ['w', 'with'],
  ['&', 'and'],
]);

// ── Normalize a shopping title into clean tokens ──
function normalizeTitle(raw) {
  if (!raw) return [];

  const cleaned = raw
    .toLowerCase()
    .replace(/[®™©]/g, '')                      // strip trademark symbols
    .replace(/\s*[|–—-]\s*[^|–—-]*$/, '')        // strip trailing store-name suffix
    .replace(/[^a-z0-9\s]/g, ' ')                // punctuation → space
    .replace(/\s+/g, ' ')                         // collapse whitespace
    .trim();

  return cleaned
    .split(' ')
    .filter(w => w && !JUNK_WORDS.has(w))
    .map(w => SYNONYMS.get(w) || w);
}

// ── Parse price string to number ──
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// ── Jaccard similarity: shared tokens / total unique tokens ──
function jaccardSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let shared = 0;
  for (const token of setA) {
    if (setB.has(token)) shared++;
  }

  const union = new Set([...setA, ...setB]).size;
  return shared / union;
}

// ── Check if two prices are within 30% of each other ──
function pricesAreClose(priceA, priceB) {
  if (priceA === null || priceB === null) return true; // no price = can't disqualify
  const ratio = Math.max(priceA, priceB) / Math.min(priceA, priceB);
  return ratio <= 1.3;
}

// ── Score a listing for winner selection (lower price wins, image preferred) ──
function scoreListing(item, priceValue) {
  let score = 0;
  if (item.imageUrl) score += 1000;
  // Invert price so lower price = higher score (cap at 500 to avoid dominating)
  if (priceValue !== null) score += Math.max(0, 500 - priceValue);
  return score;
}

/**
 * Deduplicates Serper shopping results across all queries.
 * Flattens results from all queries, clusters by title similarity + price proximity,
 * and returns one winner per cluster.
 *
 * @param {Array} serperResults - Array of { query, shopping: [...], fromCache }
 * @returns {Array} Deduplicated flat array of shopping items
 */
export function dedupeSerperResults(serperResults) {
  // Step 1: Flatten all shopping results into one array
  const allItems = [];
  for (const result of serperResults) {
    if (result.error) continue;
    for (const item of (result.shopping || [])) {
      allItems.push(item);
    }
  }

  if (allItems.length === 0) return [];

  // Step 2: Pre-compute normalized tokens and price for each item
  const processed = allItems.map(item => ({
    item,
    tokens: normalizeTitle(item.title),
    priceValue: parsePrice(item.price),
  }));

  // Step 3: Cluster by Jaccard similarity + price proximity
  // Each cluster is an array of { item, tokens, priceValue }
  const clusters = [];

  for (const entry of processed) {
    let merged = false;

    for (const cluster of clusters) {
      // Compare against the cluster representative (first item)
      const rep = cluster[0];
      const similarity = jaccardSimilarity(entry.tokens, rep.tokens);

      if (similarity >= 0.55 && pricesAreClose(entry.priceValue, rep.priceValue)) {
        cluster.push(entry);
        merged = true;
        break;
      }
    }

    if (!merged) {
      clusters.push([entry]);
    }
  }

  // Step 4: Pick winner from each cluster (best image + lowest price)
  const winners = clusters.map(cluster => {
    let bestEntry = cluster[0];
    let bestScore = scoreListing(bestEntry.item, bestEntry.priceValue);

    for (let i = 1; i < cluster.length; i++) {
      const score = scoreListing(cluster[i].item, cluster[i].priceValue);
      if (score > bestScore) {
        bestEntry = cluster[i];
        bestScore = score;
      }
    }

    bestEntry.item.clusterSize = cluster.length;
    return bestEntry.item;
  });

  /* const dupes = allItems.length - winners.length;
  console.log(`\n========== SERPER DEDUP ==========`);
  console.log(`${allItems.length} total items → ${winners.length} unique products (${dupes} duplicates removed)`);
  for (const winner of winners) {
    console.log(`  - ${winner.title} | ${winner.price} (cluster: ${winner.clusterSize})`);
  }
  console.log(`==================================\n`); */

  return winners;
}
