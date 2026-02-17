import { generateTasteProfile } from '@/lib/taste-profile';
import { generateDeepQueries } from '@/lib/search-queries-deep';
import { executeScrapingDogQueries, getAllCachedResults } from '@/lib/search-scrapingdog';
import { dedupeProducts } from '@/lib/dedupe-products';
import { pruneProducts, DISPLAY_COUNT } from '@/lib/prune-products';
import { enrichProducts } from '@/lib/enrich-scrapingdog';
import { generatePillLabels } from '@/lib/generate-pills';
import { scorePDP, PDP_REJECT_THRESHOLD } from '@/lib/score-pdp';

// ── Merchant badge extraction ──

const BADGE_PATTERNS = [
  { re: /free shipping/i,   label: 'Free Shipping' },
  { re: /free delivery/i,   label: 'Free Shipping' },
  { re: /free returns?/i,   label: 'Free Returns' },
  { re: /(\d+)[- ]day returns?/i, label: match => `${match[1]}-Day Returns` },
];

function extractMerchantBadges(extensions) {
  if (!extensions || extensions.length === 0) return [];
  const badges = [];
  const seen = new Set();
  for (const ext of extensions) {
    for (const { re, label } of BADGE_PATTERNS) {
      const match = ext.match(re);
      if (match) {
        const text = typeof label === 'function' ? label(match) : label;
        if (!seen.has(text)) {
          seen.add(text);
          badges.push(text);
        }
        break;
      }
    }
  }
  return badges;
}

// ── Map a product to a recommendation object ──

function buildRecommendation(product, index, { pills, isEnriched } = {}) {
  const base = {
    name: product.title,
    price: product.price || 'Price unavailable',
    rating: product.rating || null,
    tag: index === 0 ? 'TOP PICK' : 'GREAT FIND',
    ctaText: 'View Product',
    ctaColor: '#c8956c',
    imageBg: '#252220',
  };

  if (isEnriched) {
    return {
      ...base,
      description: product.description || '',
      brand: product.brand || null,
      rating: product.merchantRating || product.rating || null,
      url: product.merchantUrl,
      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls?.length > 1 ? product.imageUrls : [],
      matchedAttributes: pills || [],
      merchantBadges: extractMerchantBadges(product.merchantExtensions),
    };
  }

  return {
    ...base,
    description: '',
    brand: null,
    url: product.link,
    imageUrl: product.imageUrl,
    imageUrls: [],
    matchedAttributes: [],
    merchantBadges: extractMerchantBadges(product.extensions),
  };
}

// ── Build the meta object from a taste profile ──

function buildMeta(tasteProfile, recommendationCount) {
  const curatedFor = tasteProfile.recipient?.name
    || tasteProfile.recipient?.relationship
    || 'her';

  return {
    curatedFor,
    summary: tasteProfile.summary
      || `Based on what you told us, we found ${recommendationCount} gifts she'll love.`,
  };
}

// ── Resolve the taste profile (use provided or generate from description) ──

async function resolveTasteProfile(description, providedProfile) {
  if (providedProfile) {
    return { ...providedProfile, clarification: undefined };
  }
  return generateTasteProfile(description);
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE-ONLY pipeline — skips ScrapingDog API calls to save credits.
// Pulls all cached results from MongoDB, deduplicates, prunes, and returns.
// ═══════════════════════════════════════════════════════════════════════════

async function runCacheOnlyPipeline(tasteProfile) {
  const cachedResults = await getAllCachedResults();
  const uniqueProducts = dedupeProducts(cachedResults);
  const prunedProducts = pruneProducts(uniqueProducts, tasteProfile);
  const finalProducts = prunedProducts.slice(0, DISPLAY_COUNT);

  const recommendations = finalProducts.map((p, i) =>
    buildRecommendation(p, i, { isEnriched: false })
  );

  return { recommendations, meta: buildMeta(tasteProfile, recommendations.length) };
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL pipeline — generates queries, searches via ScrapingDog, deduplicates,
// prunes, enriches products, generates pill labels, and applies PDP scoring.
// ═══════════════════════════════════════════════════════════════════════════

async function runFullPipeline(tasteProfile) {
  // Step 1: Generate broad queries from taste profile
  const deepQueries = await generateDeepQueries(tasteProfile);

  // Step 2: Execute queries via ScrapingDog Shopping API (with caching)
  const searchResults = await executeScrapingDogQueries(deepQueries);

  // Step 3: Deduplicate across queries
  const uniqueProducts = dedupeProducts(searchResults);

  // Step 4: Prune to enrichment pool
  const prunedProducts = pruneProducts(uniqueProducts, tasteProfile);

  // Step 5: Enrich products + generate pill labels in parallel
  const [enrichedProducts, pillLabels] = await Promise.all([
    enrichProducts(prunedProducts),
    generatePillLabels(prunedProducts, tasteProfile),
  ]);

  // Step 6: PDP confidence scoring — reject non-product pages
  const pdpScored = enrichedProducts.map((p, i) => ({
    ...p,
    _originalIndex: i,
    _pdpScore: scorePDP({ url: p.merchantUrl, title: p.title, price: p.price, snippet: p.description }),
  }));

  const pdpPassed = pdpScored.filter(p => p._pdpScore > PDP_REJECT_THRESHOLD);
  const finalProducts = pdpPassed.slice(0, DISPLAY_COUNT);

  // Step 7: Build recommendation objects
  const recommendations = finalProducts.map((p, i) =>
    buildRecommendation(p, i, {
      pills: pillLabels[p._originalIndex] || [],
      isEnriched: true,
    })
  );

  return { recommendations, meta: buildMeta(tasteProfile, recommendations.length) };
}

// ═══════════════════════════════════════════════════════════════════════════
// Public entry point — switch between cache-only and full pipeline here.
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_ONLY = true; // Set to false to restore full ScrapingDog pipeline

export async function runPipeline({ description, tasteProfile: providedProfile }) {
  const tasteProfile = await resolveTasteProfile(description, providedProfile);

  const { recommendations, meta } = CACHE_ONLY
    ? await runCacheOnlyPipeline(tasteProfile)
    : await runFullPipeline(tasteProfile);

  return { recommendations, meta, tasteProfile };
}
