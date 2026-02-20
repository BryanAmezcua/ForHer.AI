import { createHash } from 'crypto';
import { connectDB } from './mongoose';
import { ShoppingCache } from './models/shopping-cache';
import { debugLog } from './debug';

const API_KEY = process.env.SCRAPINGDOG_API_KEY;
const AMAZON_ENDPOINT = 'https://api.scrapingdog.com/amazon/search';
const AFFILIATE_TAG = 'giftherai-20';

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Stopword list for query normalization ──
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'was', 'are',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'that', 'this', 'these', 'those', 'i', 'me', 'my', 'we', 'our',
  'you', 'your', 'he', 'she', 'her', 'his', 'they', 'them', 'their',
  'who', 'whom', 'which', 'what', 'where', 'when', 'how', 'why',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very',
  'just', 'about', 'above', 'after', 'again', 'all', 'also', 'any',
  'because', 'before', 'between', 'both', 'each', 'few', 'into',
  'more', 'most', 'other', 'out', 'over', 'own', 'same', 'some',
  'such', 'up', 'down', 'off', 'only', 'under', 'until', 'while',
  'likes', 'loves', 'really', 'who',
]);

function stem(word) {
  if (word.length <= 3) return word;
  return word
    .replace(/ies$/, 'y')
    .replace(/sses$/, 'ss')
    .replace(/ness$/, '')
    .replace(/ment$/, '')
    .replace(/able$/, '')
    .replace(/ful$/, '')
    .replace(/ing$/, '')
    .replace(/tion$/, '')
    .replace(/ly$/, '')
    .replace(/ed$/, '')
    .replace(/s$/, '');
}

function normalizeQuery(raw) {
  const words = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w))
    .map(stem);

  return [...new Set(words)].sort().join(' ');
}

function computeCacheKey(normalizedQuery) {
  const input = `amazon|US|${normalizedQuery}`;
  return createHash('sha256').update(input).digest('hex');
}

// ── Append affiliate tag to Amazon URL ──
function tagAffiliateUrl(url) {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tag=${AFFILIATE_TAG}`;
}

// ── Parse review counts like "1.9K" → 1900, "12,345" → 12345 ──
function parseReviewCount(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  const kMatch = str.match(/([\d.]+)\s*K/i);
  if (kMatch) return String(Math.round(parseFloat(kMatch[1]) * 1000));
  return str.replace(/,/g, '');
}

// ── Build extensions array from Amazon item metadata ──
function buildAmazonExtensions(item) {
  const extensions = [];
  if (item.has_prime) extensions.push('Prime');
  if (item.delivery?.includes('FREE delivery')) extensions.push('Free Shipping');
  if (item.coupon_text) extensions.push(item.coupon_text);
  if (item.is_best_seller) extensions.push('Best Seller');
  if (item.is_amazon_choice) extensions.push("Amazon's Choice");
  return extensions;
}

// ── Normalize an Amazon search result to canonical shape ──
function normalizeAmazonItem(item) {
  return {
    title:          item.title,
    link:           tagAffiliateUrl(item.optimized_url),
    price:          item.price_string || item.price,
    extractedPrice: item.price ? parseFloat(String(item.price).replace('$', '')) : null,
    source:         'Amazon',
    imageUrl:       item.image,
    rating:         item.stars ? parseFloat(item.stars) : null,
    reviews:        parseReviewCount(item.total_reviews),
    extensions:     buildAmazonExtensions(item),
    productId:      item.asin,
    immersiveUrl:   null, // Amazon products skip Immersive Product enrichment
    asin:           item.asin,
    isPrime:        item.has_prime || false,
    isBestSeller:   item.is_best_seller || false,
    isAmazonChoice: item.is_amazon_choice || false,
    isLimitedDeal:  item.limited_time_deal || false,
    socialProof:    item.number_of_people_bought || null,
    couponText:     item.coupon_text || null,
    _source:        'amazon',
  };
}

// ── Save results to MongoDB ──
async function createMongoDocument(rawQuery, normalizedQuery, cacheKey, normalizedResults) {
  const now = new Date();

  const doc = {
    _id: cacheKey,
    query: {
      raw: rawQuery,
      normalized: normalizedQuery,
      locale: { country: 'US', currency: 'USD', lang: 'en' },
    },
    provider: 'amazon',
    fetchedAt: now,
    expiresAt: new Date(now.getTime() + TTL_MS),
    results: normalizedResults,
  };

  await ShoppingCache.findByIdAndUpdate(cacheKey, doc, { upsert: true });
  debugLog(`  [CACHE] Saved ${normalizedResults.length} Amazon results for "${rawQuery}"`);
}

// ── Execute a single Amazon query with cache check ──
async function executeOneQuery(rawQuery) {
  const normalized = normalizeQuery(rawQuery);
  const cacheKey = computeCacheKey(normalized);

  const cached = await ShoppingCache.findById(cacheKey).lean();
  if (cached) {
    debugLog(`  [CACHE HIT] Amazon "${rawQuery}" → ${cached.results.length} cached results`);
    return { query: rawQuery, shopping: cached.results, fromCache: true };
  }

  debugLog(`  [CACHE MISS] Amazon "${rawQuery}" → calling Amazon Search API`);

  const params = new URLSearchParams({
    api_key: API_KEY,
    domain: 'com',
    query: rawQuery,
    page: '1',
    // premium: 'true'
  });

  const response = await fetch(`${AMAZON_ENDPOINT}?${params}`);

  if (!response.ok) {
    console.error(`Amazon query failed for "${rawQuery}": ${response.status} ${response.statusText}`);
    return { query: rawQuery, shopping: [], error: response.statusText };
  }

  const data = await response.json();
  const results = (data.results || [])
    .filter(item => !item.sponsored)
    .map(normalizeAmazonItem);

  debugLog(`  [API] Amazon "${rawQuery}" → ${results.length} results`);

  await createMongoDocument(rawQuery, normalized, cacheKey, results);

  return { query: rawQuery, shopping: results, fromCache: false };
}

// ── Public: grab all cached results from MongoDB ──
export async function getAllCachedResults() {
  await connectDB();
  const docs = await ShoppingCache.find({}).lean();
  const allResults = docs.flatMap(doc => doc.results || []);
  debugLog(`\n========== CACHE-ONLY MODE ==========`);
  debugLog(`Loaded ${allResults.length} products from ${docs.length} cached queries`);
  debugLog(`=====================================\n`);
  return [{ query: '(cached)', shopping: allResults, fromCache: true }];
}

// ── Public: execute Amazon queries ──
export async function executeAmazonQueries(deepQueries) {
  const { queries } = deepQueries;

  debugLog('\n========== AMAZON QUERIES ==========');
  debugLog(queries.map(q => q.q));
  debugLog('====================================\n');

  await connectDB();

  const results = await Promise.all(
    queries.map(query => executeOneQuery(query.q))
  );

  return results;
}
