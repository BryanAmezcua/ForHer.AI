import { generateProfileAndQueries } from '@/lib/taste-profile';
import { executeAmazonQueries, getAllCachedResults } from '@/lib/search-amazon';
import { dedupeProducts } from '@/lib/dedupe-products';
import { pruneProducts, DISPLAY_COUNT } from '@/lib/prune-products';
import { generateProductInsights } from '@/lib/generate-pills';
import { cleanTitle } from '@/lib/clean-title';
import { parsePrice } from '@/lib/parse-price';

// ── Constants ──

const ROW_SIZE = 3;
const TOTAL_ROWS = 3;

const TRENDING_QUERIES = [
  'trending products for women',
  'popular products for her',
  'top rated products for women',
  'best products for women',
];

const INTEREST_HEADINGS = [
  i => `For Her Love of ${cap(i)}`,
  i => `Since She Loves ${cap(i)}`,
  i => `You Mentioned She Likes ${cap(i)}`,
];

const TRENDING_HEADINGS = [
  r => `Popular Gifts for ${cap(r)}`,
  r => `Other Gifts She Might Love`,
];

function cap(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

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

// ── Badge derivation ──

function deriveBadge(matchScore, isFirstInRow, rowType) {
  if (isFirstInRow && rowType === 'interest') {
    if (matchScore >= 85) return { badgeLabel: 'Best Match', badgeType: 'confidence' };
    return { badgeLabel: 'Great Match', badgeType: 'confidence' };
  }
  if (isFirstInRow && rowType === 'trending') {
    return { badgeLabel: 'Trending', badgeType: 'social' };
  }
  if (matchScore >= 85) {
    return { badgeLabel: 'Great Match', badgeType: 'confidence' };
  }
  return { badgeLabel: null, badgeType: null };
}

// ── Map a product to a recommendation object ──

function buildRecommendation(product, isFirstInRow, rowType, tasteProfile, { pills, whySheLikesIt } = {}) {
  const matchScore = product._matchScore ?? null;
  const { badgeLabel, badgeType } = matchScore !== null
    ? deriveBadge(matchScore, isFirstInRow, rowType)
    : { badgeLabel: null, badgeType: null };

  const merchantBadges = extractMerchantBadges(product.extensions);
  if (product.isPrime && !merchantBadges.includes('Prime')) {
    merchantBadges.unshift('Prime');
  }

  return {
    name: cleanTitle(product.title),
    price: product.price || 'Price unavailable',
    rating: product.rating || null,
    tag: isFirstInRow ? 'TOP PICK' : null,
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

function buildMeta(tasteProfile, totalProducts) {
  const curatedFor = tasteProfile.recipient?.name
    || tasteProfile.recipient?.relationship
    || 'her';

  return {
    curatedFor,
    summary: tasteProfile.summary
      || `Based on what you told us, we found ${totalProducts} gifts she'll love.`,
  };
}

// ── Resolve the taste profile (use provided or generate from description) ──

async function resolveTasteProfile(description, providedProfile) {
  if (providedProfile) return providedProfile;
  return generateProfileAndQueries(description);
}

// ── Sort products by price descending (highest first) ──

function sortByPriceDesc(products) {
  return [...products].sort((a, b) => {
    const pa = parsePrice(a.price) ?? 0;
    const pb = parsePrice(b.price) ?? 0;
    return pb - pa;
  });
}

// ── Assign products to rows ──

function assignProductsToRows(products, tasteProfile) {
  const recipient = tasteProfile.recipient?.name
    || tasteProfile.recipient?.relationship
    || 'her';

  // Get unique interests from searchQueries (preserve order, max 3)
  const interests = [];
  const seen = new Set();
  for (const q of (tasteProfile.searchQueries || [])) {
    if (q.interest && !seen.has(q.interest)) {
      seen.add(q.interest);
      interests.push(q.interest);
    }
  }

  // Bucket products by interest
  const interestBuckets = new Map();
  for (const interest of interests) {
    interestBuckets.set(interest, []);
  }
  const trendingPool = [];

  for (const product of products) {
    if (product._sourceInterest && interestBuckets.has(product._sourceInterest)) {
      interestBuckets.get(product._sourceInterest).push(product);
    } else {
      trendingPool.push(product);
    }
  }

  // Sort trending pool by score descending
  trendingPool.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0));

  const rows = [];
  const usedProducts = new Set();

  // Interest rows
  interests.forEach((interest, idx) => {
    let bucket = interestBuckets.get(interest);
    // Sort by _matchScore descending, take top ROW_SIZE
    bucket.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0));
    let rowProducts = bucket.slice(0, ROW_SIZE);

    // Backfill from trending pool if < ROW_SIZE
    if (rowProducts.length < ROW_SIZE) {
      for (const p of trendingPool) {
        if (rowProducts.length >= ROW_SIZE) break;
        if (!usedProducts.has(p)) {
          rowProducts.push(p);
        }
      }
    }

    // Mark used
    for (const p of rowProducts) usedProducts.add(p);

    // Sort row by price descending (highest = first = top pick)
    rowProducts = sortByPriceDesc(rowProducts);

    const heading = INTEREST_HEADINGS[idx % INTEREST_HEADINGS.length](interest);
    rows.push({ heading, type: 'interest', interest, products: rowProducts });
  });

  // Trending rows: fill remaining slots from unused products
  const remainingProducts = products.filter(p => !usedProducts.has(p));
  remainingProducts.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0));

  let trendingIdx = 0;
  let remainingIdx = 0;
  while (rows.length < TOTAL_ROWS && remainingIdx < remainingProducts.length) {
    let rowProducts = [];
    while (rowProducts.length < ROW_SIZE && remainingIdx < remainingProducts.length) {
      rowProducts.push(remainingProducts[remainingIdx++]);
    }

    if (rowProducts.length > 0) {
      rowProducts = sortByPriceDesc(rowProducts);
      const heading = TRENDING_HEADINGS[trendingIdx % TRENDING_HEADINGS.length](recipient);
      rows.push({ heading, type: 'trending', interest: null, products: rowProducts });
      trendingIdx++;
    }
  }

  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE-ONLY pipeline — emergency fallback. Skips API calls to save credits.
// ═══════════════════════════════════════════════════════════════════════════

async function runCacheOnlyPipeline(tasteProfile) {
  const cachedResults = await getAllCachedResults();
  const uniqueProducts = dedupeProducts(cachedResults);
  const prunedProducts = pruneProducts(uniqueProducts, tasteProfile);
  const finalProducts = prunedProducts.slice(0, DISPLAY_COUNT);

  // Single trending row as fallback
  const recipient = tasteProfile.recipient?.name
    || tasteProfile.recipient?.relationship
    || 'her';
  const sortedProducts = sortByPriceDesc(finalProducts);
  const rows = [{
    heading: `Popular Gifts for ${cap(recipient)}`,
    type: 'trending',
    interest: null,
    recommendations: sortedProducts.map((p, i) =>
      buildRecommendation(p, i === 0, 'trending', tasteProfile)
    ),
  }];

  return { rows, meta: buildMeta(tasteProfile, finalProducts.length) };
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL pipeline — sends queries to Amazon, deduplicates, prunes,
// assigns to rows, generates insights, and builds recommendation objects.
// ═══════════════════════════════════════════════════════════════════════════

async function runFullPipeline(tasteProfile) {
  // Step 1: Build query list — interest queries + trending to reach 5 total
  const interestQueries = (tasteProfile.searchQueries || []).map(q => ({
    q: q.q,
    interest: q.interest || null,
  }));

  const allQueries = [...interestQueries];
  let trendingIdx = 0;
  while (allQueries.length < 5 && trendingIdx < TRENDING_QUERIES.length) {
    allQueries.push({ q: TRENDING_QUERIES[trendingIdx], interest: null });
    trendingIdx++;
  }

  // Step 2: Execute all queries via Amazon
  const searchResults = await executeAmazonQueries({ queries: allQueries });

  // Step 3: Tag results with _sourceInterest
  for (let i = 0; i < searchResults.length; i++) {
    const interest = allQueries[i].interest;
    if (!searchResults[i].error && searchResults[i].shopping) {
      for (const item of searchResults[i].shopping) {
        item._sourceInterest = interest;
      }
    }
  }

  // Step 4: Deduplicate across queries (preserves _sourceInterest)
  const uniqueProducts = dedupeProducts(searchResults);

  // Step 5: Prune to top 20
  const prunedProducts = pruneProducts(uniqueProducts, tasteProfile);

  // Step 6: Assign to rows (4 rows of 3)
  const productRows = assignProductsToRows(prunedProducts, tasteProfile);

  // Step 7: Generate insights for all products across rows
  const allProducts = productRows.flatMap(row => row.products);
  const insights = await generateProductInsights(allProducts, tasteProfile);

  // Step 8: Build recommendation objects within each row
  let globalIdx = 0;
  const rows = productRows.map(row => {
    const recommendations = row.products.map((p, j) => {
      const rec = buildRecommendation(p, j === 0, row.type, tasteProfile, {
        pills: insights.pills[globalIdx] || [],
        whySheLikesIt: insights.whySheLikesIt[globalIdx] || null,
      });
      globalIdx++;
      return rec;
    });

    return {
      heading: row.heading,
      type: row.type,
      interest: row.interest,
      recommendations,
    };
  });

  const totalProducts = rows.reduce((sum, r) => sum + r.recommendations.length, 0);
  return { rows, meta: buildMeta(tasteProfile, totalProducts) };
}

// ═══════════════════════════════════════════════════════════════════════════
// Public entry point — switch between cache-only and full pipeline here.
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_ONLY = false;

export async function runPipeline({ description, tasteProfile: providedProfile }) {
  const tasteProfile = await resolveTasteProfile(description, providedProfile);

  const { rows, meta } = CACHE_ONLY
    ? await runCacheOnlyPipeline(tasteProfile)
    : await runFullPipeline(tasteProfile);

  return { rows, meta, tasteProfile };
}
