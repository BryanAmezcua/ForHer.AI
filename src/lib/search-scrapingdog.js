import { createHash } from 'crypto';
import { connectDB } from './mongoose';
import { ShoppingCache } from './models/shopping-cache';

const API_KEY = process.env.SCRAPINGDOG_API_KEY;
const SCRAPINGDOG_ENDPOINT = 'https://api.scrapingdog.com/google_shopping';

const TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

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

// ── Basic suffix stemming ──
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

// ── Normalize query: lowercase, remove stopwords, stem, sort, dedupe ──
function normalizeQuery(raw) {
  const words = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w))
    .map(stem);

  return [...new Set(words)].sort().join(' ');
}

// ── Compute deterministic cache key ──
function computeCacheKey(normalizedQuery) {
  const input = `scrapingdog|US|${normalizedQuery}`;
  return createHash('sha256').update(input).digest('hex');
}

// ── Normalize a ScrapingDog shopping item to canonical shape ──
function normalizeItem(item) {
  return {
    title:          item.title,
    link:           item.product_link || item.product_url,
    price:          item.price,
    extractedPrice: item.extracted_price ?? null,
    source:         item.source,
    imageUrl:       item.thumbnail,
    rating:         item.rating || null,
    reviews:        item.reviews || null,
    extensions:     item.extensions || [],
    productId:      item.product_id,
    immersiveUrl:   item.scrapingdog_immersive_product_link,
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
    provider: 'scrapingdog',
    fetchedAt: now,
    expiresAt: new Date(now.getTime() + TTL_MS),
    results: normalizedResults.map(item => ({
      title: item.title,
      link: item.link,
      price: item.price,
      extractedPrice: item.extractedPrice,
      source: item.source,
      imageUrl: item.imageUrl,
      rating: item.rating,
      reviews: item.reviews,
      extensions: item.extensions,
      productId: item.productId,
      immersiveUrl: item.immersiveUrl,
    })),
  };

  await ShoppingCache.findByIdAndUpdate(cacheKey, doc, { upsert: true });
  console.log(`  [CACHE] Saved ${normalizedResults.length} results for "${rawQuery}"`);
}

// ── Execute a single query with cache check ──
async function executeOneQuery(rawQuery) {
  const normalized = normalizeQuery(rawQuery);
  const cacheKey = computeCacheKey(normalized);

  // Check cache first
  const cached = await ShoppingCache.findById(cacheKey).lean();
  if (cached) {
    console.log(`  [CACHE HIT] "${rawQuery}" → ${cached.results.length} cached results`);
    return { query: rawQuery, shopping: cached.results, fromCache: true };
  }

  // Cache miss — call ScrapingDog
  console.log(`  [CACHE MISS] "${rawQuery}" → calling ScrapingDog API`);

  const params = new URLSearchParams({
    api_key: API_KEY,
    query: rawQuery,
    country: 'us',
    language: 'en',
  });

  const response = await fetch(`${SCRAPINGDOG_ENDPOINT}?${params}`);

  if (!response.ok) {
    console.error(`ScrapingDog query failed for "${rawQuery}": ${response.status} ${response.statusText}`);
    return { query: rawQuery, shopping: [], error: response.statusText };
  }

  const data = await response.json();
  const shoppingResults = (data.shopping_results || []).map(normalizeItem);

  console.log(`  [API] "${rawQuery}" → ${shoppingResults.length} results`);

  // Save to MongoDB
  await createMongoDocument(rawQuery, normalized, cacheKey, shoppingResults);

  return { query: rawQuery, shopping: shoppingResults, fromCache: false };
}

// ── Public: execute all deep queries ──
export async function executeScrapingDogQueries(deepQueries) {
  const { queries } = deepQueries;

  console.log('\n========== SCRAPINGDOG QUERIES ==========');
  console.log(queries.map(q => q.q));
  console.log('==========================================\n');

  await connectDB();

  const results = await Promise.all(
    queries.map(query => executeOneQuery(query.q))
  );

  return results;
}
