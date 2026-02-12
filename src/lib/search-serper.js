import { createHash } from 'crypto';
import { connectDB } from './mongoose';
import { ShoppingCache } from './models/shopping-cache';

const SERPER_API_KEY = process.env.Serper_API_KEY;
const SERPER_ENDPOINT = 'https://google.serper.dev/shopping';

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
  const input = `serper|US|${normalizedQuery}`;
  return createHash('sha256').update(input).digest('hex');
}

// ── Save results to MongoDB ──
async function createMongoDocument(rawQuery, normalizedQuery, cacheKey, shoppingResults) {
  const now = new Date();

  const doc = {
    _id: cacheKey,
    query: {
      raw: rawQuery,
      normalized: normalizedQuery,
      locale: { country: 'US', currency: 'USD', lang: 'en' },
    },
    provider: 'serper',
    fetchedAt: now,
    expiresAt: new Date(now.getTime() + TTL_MS),
    results: shoppingResults.map(item => ({
      title: item.title,
      link: item.link,
      price: item.price,
      source: item.source,
      imageUrl: item.imageUrl,
    })),
  };

  await ShoppingCache.findByIdAndUpdate(cacheKey, doc, { upsert: true });
  console.log(`  [CACHE] Saved ${shoppingResults.length} results for "${rawQuery}"`);
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

  // Cache miss — call Serper
  console.log(`  [CACHE MISS] "${rawQuery}" → calling Serper API`);
  const response = await fetch(SERPER_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: rawQuery,
      num: 10,
    }),
  });

  if (!response.ok) {
    console.error(`Serper query failed for "${rawQuery}": ${response.status} ${response.statusText}`);
    return { query: rawQuery, shopping: [], error: response.statusText };
  }

  const data = await response.json();
  const shoppingResults = data.shopping || [];

  // Save to MongoDB
  await createMongoDocument(rawQuery, normalized, cacheKey, shoppingResults);

  return { query: rawQuery, shopping: shoppingResults, fromCache: false };
}

// ── Public: execute all deep queries ──
export async function executeSerperQueries(deepQueries) {
  const { queries } = deepQueries;

  console.log('\n========== SERPER QUERIES ==========');
  console.log(queries.map(q => q.q));
  console.log('====================================\n');

  await connectDB();

  const results = await Promise.all(
    queries.map(query => executeOneQuery(query.q))
  );

  console.log('\n========== SERPER RESULTS ==========');
  for (const result of results) {
    const tag = result.fromCache ? ' (from cache)' : '';
    console.log(`\n--- Query: "${result.query}"${tag} ---`);
    if (result.error) {
      console.log(`  ERROR: ${result.error}`);
      continue;
    }
    const shopping = result.shopping || [];
    console.log(`  ${shopping.length} shopping results:`);
    for (const item of shopping) {
      console.log(`Title: ${item.title}`);
      console.log(`Link: ${item.link}`);
      console.log(`Price: ${item.price}`);
      console.log(`Image: ${item.imageUrl}`);
    }
  }
  console.log('\n====================================\n');

  return results;
}
