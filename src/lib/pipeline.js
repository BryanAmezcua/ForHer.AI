import { generateProfileAndQueries } from '@/lib/taste-profile';
import { executeAmazonQueries, getAllCachedResults } from '@/lib/search-amazon';
import { dedupeProducts } from '@/lib/dedupe-products';
import { pruneProducts, DISPLAY_COUNT } from '@/lib/prune-products';
import { generateProductInsights } from '@/lib/generate-pills';
import { cleanTitle } from '@/lib/clean-title';

// ── Merchant badge extraction ──

const BADGE_PATTERNS = [
  { re: /^Prime$/i,          label: 'Prime' },
  { re: /best seller/i,      label: 'Best Seller' },
  { re: /amazon.s choice/i,  label: "Amazon's Choice" },
  { re: /free shipping/i,    label: 'Free Shipping' },
  { re: /free delivery/i,    label: 'Free Shipping' },
  { re: /free returns?/i,    label: 'Free Returns' },
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

// ── Badge derivation from matchScore + taste profile ──

function deriveBadge(matchScore, index, tasteProfile) {
  if (index === 0 && matchScore >= 85) {
    return { badgeLabel: 'Best Match', badgeType: 'confidence' };
  }
  if (matchScore >= 85) {
    return { badgeLabel: 'Great Match', badgeType: 'confidence' };
  }

  const occasion = tasteProfile.occasion?.event;
  if (occasion && occasion !== 'just because') {
    const capitalized = occasion.charAt(0).toUpperCase() + occasion.slice(1);
    return { badgeLabel: `Perfect for ${capitalized}`, badgeType: 'occasion' };
  }

  return { badgeLabel: "She'll Love This", badgeType: 'social' };
}

// ── Map a product to a recommendation object ──

function buildRecommendation(product, index, tasteProfile, { pills, whySheLikesIt } = {}) {
  const matchScore = product._matchScore ?? null;
  const { badgeLabel, badgeType } = matchScore !== null
    ? deriveBadge(matchScore, index, tasteProfile)
    : { badgeLabel: null, badgeType: null };

  const merchantBadges = extractMerchantBadges(product.extensions);
  if (product.isPrime && !merchantBadges.includes('Prime')) {
    merchantBadges.unshift('Prime');
  }

  return {
    name: cleanTitle(product.title),
    price: product.price || 'Price unavailable',
    rating: product.rating || null,
    tag: index === 0 ? 'TOP PICK' : 'GREAT FIND',
    ctaText: 'View on Amazon',
    ctaColor: '#c8956c',
    imageBg: '#252220',
    matchScore,
    badgeLabel,
    badgeType,
    description: whySheLikesIt || '',
    sourceTag: 'amazon',
    socialProof: product.socialProof || null,
    brand: null,
    url: product.link,
    imageUrl: product.imageUrl,
    imageUrls: [],
    matchedAttributes: pills || [],
    merchantBadges,
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
  if (providedProfile) return providedProfile;
  return generateProfileAndQueries(description);
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE-ONLY pipeline — emergency fallback. Skips API calls to save credits.
// Pulls all cached results from MongoDB, deduplicates, prunes, and returns.
// ═══════════════════════════════════════════════════════════════════════════

async function runCacheOnlyPipeline(tasteProfile) {
  const cachedResults = await getAllCachedResults();
  const uniqueProducts = dedupeProducts(cachedResults);
  const prunedProducts = pruneProducts(uniqueProducts, tasteProfile);
  const finalProducts = prunedProducts.slice(0, DISPLAY_COUNT);

  const recommendations = finalProducts.map((p, i) =>
    buildRecommendation(p, i, tasteProfile)
  );

  return { recommendations, meta: buildMeta(tasteProfile, recommendations.length) };
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL pipeline — sends all queries to Amazon, deduplicates, prunes,
// generates insights (pills + whySheLikesIt), and builds
// recommendation objects.
// ═══════════════════════════════════════════════════════════════════════════

async function runFullPipeline(tasteProfile) {
  // Step 1: Send all 5 queries to Amazon
  const searchResults = await executeAmazonQueries({ queries: tasteProfile.searchQueries });

  // Step 2: Deduplicate across queries
  const uniqueProducts = dedupeProducts(searchResults);

  // Step 3: Prune to top 16
  const prunedProducts = pruneProducts(uniqueProducts, tasteProfile);

  // Step 4: Generate insights (pills + whySheLikesIt)
  const insights = await generateProductInsights(prunedProducts, tasteProfile);

  // Step 5: Slice to display count
  const finalProducts = prunedProducts.slice(0, DISPLAY_COUNT);

  // Step 6: Build recommendation objects
  const recommendations = finalProducts.map((p, i) =>
    buildRecommendation(p, i, tasteProfile, {
      pills: insights.pills[i] || [],
      whySheLikesIt: insights.whySheLikesIt[i] || null,
    })
  );

  return { recommendations, meta: buildMeta(tasteProfile, recommendations.length) };
}

// ═══════════════════════════════════════════════════════════════════════════
// Public entry point — switch between cache-only and full pipeline here.
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_ONLY = false;

export async function runPipeline({ description, tasteProfile: providedProfile }) {
  const tasteProfile = await resolveTasteProfile(description, providedProfile);

  const { recommendations, meta } = CACHE_ONLY
    ? await runCacheOnlyPipeline(tasteProfile)
    : await runFullPipeline(tasteProfile);

  return { recommendations, meta, tasteProfile };
}
