import { scorePDP, PDP_ACCEPT_THRESHOLD } from './score-pdp';
import { parsePrice } from './parse-price';
import { debugLog } from './debug';

/**
 * Enriches pruned products via ScrapingDog Immersive Product API.
 * Each product's immersiveUrl is a pre-built API URL (includes api_key + page_token).
 * Picks the best store per product using scoring heuristics.
 *
 * @param {Array} products - Pruned shopping items (must have .immersiveUrl)
 * @returns {Array} Enriched products with merchantUrl, description, brand, etc.
 */
const CONCURRENCY = 5; // ScrapingDog LITE plan allows 5 concurrent requests

export async function enrichProducts(products) {
  const enriched = [];
  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(product => enrichOne(product)));
    enriched.push(...results);
  }

  const found = enriched.filter(p => p.merchantUrl !== p.link).length;
  debugLog(`\n========== ENRICHMENT (ScrapingDog Immersive) ==========`);
  debugLog(`${enriched.length} products enriched (${found} merchant URLs found, ${enriched.length - found} fell back to Shopping link)`);
  for (const p of enriched) {
    const tag = p.merchantUrl !== p.link ? '' : ' [Shopping fallback]';
    debugLog(`  - ${p.title}`);
    debugLog(`    Store: ${p.merchantName || '(none)'}${tag}`);
    debugLog(`    URL: ${p.merchantUrl}`);
    debugLog(`    Desc: ${p.description ? p.description.substring(0, 100) + '...' : '(none)'}`);
  }
  debugLog(`========================================================\n`);

  return enriched;
}

/**
 * Pick the best store from the Immersive Product response.
 *
 * 1. Hard reject: stores with "Out of stock" in extensions
 * 2. Score remaining stores
 * 3. Tiebreak: lowest total_price
 * 4. Fallback: if no stores survive, return null
 */
function selectBestStore(stores) {
  if (!stores || stores.length === 0) return null;

  // Filter out "Out of stock" stores
  const inStock = stores.filter(store => {
    const exts = (store.extensions || []).map(e => e.toLowerCase());
    return !exts.some(e => e.includes('out of stock'));
  });

  if (inStock.length === 0) return null;

  const scored = inStock.map(store => {
    let score = 0;
    const exts = (store.extensions || []).map(e => e.toLowerCase());

    // +2 if PDP score on store.link >= 3 (known retailer domain)
    if (store.link) {
      const pdp = scorePDP({ url: store.link, title: store.title || '' });
      if (pdp >= PDP_ACCEPT_THRESHOLD) score += 2;
    }

    // +1 if store has ratings
    if (store.ratings) score += 1;

    // +1 if "In stock" in extensions
    if (exts.some(e => e.includes('in stock'))) score += 1;

    // +0.5 if "Free shipping" or "Free delivery"
    if (exts.some(e => e.includes('free shipping') || e.includes('free delivery'))) score += 0.5;

    // +0.5 if "Free returns"
    if (exts.some(e => e.includes('free returns'))) score += 0.5;

    // Parse total_price for tiebreak (lower is better)
    const totalPrice = parsePrice(store.total_price || store.price);

    return { store, score, totalPrice };
  });

  // Sort by score descending, then by total_price ascending for tiebreak
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Lower total price wins the tiebreak
    if (a.totalPrice !== null && b.totalPrice !== null) return a.totalPrice - b.totalPrice;
    if (a.totalPrice !== null) return -1;
    if (b.totalPrice !== null) return 1;
    return 0;
  });

  return scored[0].store;
}

// Build a fallback enrichment result, with optional partial data from the API
function buildFallback(product, partialData = {}) {
  return {
    ...product,
    merchantUrl: product.link,
    merchantName: null,
    description: null,
    brand: null,
    imageUrls: [],
    merchantRating: null,
    merchantReviews: null,
    merchantExtensions: [],
    ...partialData,
  };
}

async function enrichOne(product) {
  if (!product.immersiveUrl) {
    return buildFallback(product);
  }

  try {
    const response = await fetch(product.immersiveUrl);

    if (!response.ok) {
      console.error(`Immersive Product failed for "${product.title}": ${response.status}`);
      return buildFallback(product);
    }

    const data = await response.json();
    const bestStore = selectBestStore(data.stores);
    const imageUrls = data.thumbnails || [];

    if (bestStore) {
      return {
        ...product,
        merchantUrl:        bestStore.link,
        merchantName:       bestStore.name,
        description:        data.about_the_product?.description || null,
        imageUrl:           imageUrls[0] || product.imageUrl,
        imageUrls,
        brand:              data.brand || null,
        merchantRating:     bestStore.ratings || null,
        merchantReviews:    bestStore.reviews || null,
        merchantExtensions: bestStore.extensions || [],
      };
    }

    // No viable store — fall back but still grab description/brand/images if available
    return buildFallback(product, {
      description: data.about_the_product?.description || null,
      imageUrl: imageUrls[0] || product.imageUrl,
      imageUrls,
      brand: data.brand || null,
    });
  } catch (err) {
    console.error(`Enrichment failed for "${product.title}": ${err.message}`);
    return buildFallback(product);
  }
}
