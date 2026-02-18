# Backend Task: Integrate Amazon Search into Product Pipeline

Read `memory-banks/api-contract.md` first — it defines two new fields (`sourceTag`, `socialProof`) you must emit on the recommendation object.

---

## 1. Create `src/lib/search-amazon.js`

New file — Amazon search module. Mirrors `search-scrapingdog.js` structure.

**Function:** `executeAmazonQueries({ queries })` — same return shape as `executeScrapingDogQueries`

- Accepts `{ queries: [{ q }] }` (same format as existing pipeline)
- Per query:
  - Normalize query string (reuse the same normalization logic from `search-scrapingdog.js` — stopwords, stemming, sort)
  - Hash cache key: `sha256("amazon|US|" + normalizedQuery)`
  - Check `ShoppingCache.findById(cacheKey)` — return on hit
  - On miss: `GET https://api.scrapingdog.com/amazon/search?api_key=${key}&domain=com&query=${query}`
  - Map results through `normalizeAmazonItem()` (see below)
  - Save to ShoppingCache with `provider: 'amazon'`, 48h TTL
- Return `Array<{ query, shopping: [...normalizedItems], fromCache }>`

**`normalizeAmazonItem(item)` output:**
```js
{
  title:          item.title,
  link:           item.optimized_url,             // clean Amazon URL — append affiliate tag
  price:          item.price_string || item.price,
  extractedPrice: parseFloat(item.price?.replace('$','')),
  source:         'Amazon',
  imageUrl:       item.image,
  rating:         item.stars ? parseFloat(item.stars) : null,
  reviews:        parseReviewCount(item.total_reviews), // "1.9K" → 1900
  extensions:     buildAmazonExtensions(item),
  productId:      item.asin,
  immersiveUrl:   null,                           // Amazon products skip Immersive Product enrichment
  asin:           item.asin,
  isPrime:        item.has_prime,
  isBestSeller:   item.is_best_seller,
  isAmazonChoice: item.is_amazon_choice,
  isLimitedDeal:  item.limited_time_deal,
  socialProof:    item.number_of_people_bought,   // "50+ bought in past month"
  couponText:     item.coupon_text,
  isSponsored:    item.sponsored,
  _source:        'amazon',                       // internal source tag for pipeline logic
}
```

**`buildAmazonExtensions(item)`:**
```js
const extensions = [];
if (item.has_prime) extensions.push('Prime');
if (item.delivery?.includes('FREE delivery')) extensions.push('Free Shipping');
if (item.coupon_text) extensions.push(item.coupon_text);
if (item.is_best_seller) extensions.push('Best Seller');
if (item.is_amazon_choice) extensions.push("Amazon's Choice");
return extensions;
```

**Filter out sponsored results:** Skip items where `item.sponsored === true`.

**Affiliate link tagging:** Append `?tag=giftherai-20` to the `optimized_url`. If URL already has query params, use `&tag=giftherai-20`.

---

## 2. Modify `src/lib/pipeline.js`

**In `runFullPipeline()`:**

Change the query split. Currently generates 3 queries and sends all 3 to Google Shopping. New behavior:

```js
const allQueries = tasteProfile.searchQueries
  ? { queries: tasteProfile.searchQueries }
  : await generateDeepQueries(tasteProfile);

// Split: first 2 → Amazon, third → Google Shopping
const amazonQueries = { queries: allQueries.queries.slice(0, 2) };
const googleQueries = { queries: allQueries.queries.slice(2, 3) };

// Execute in parallel
const [googleResults, amazonResults] = await Promise.all([
  executeScrapingDogQueries(googleQueries),
  executeAmazonQueries(amazonQueries),
]);

// Merge results before dedup
const searchResults = [...googleResults, ...amazonResults];
```

Everything from `dedupeProducts()` onward stays the same.

**In `buildRecommendation()`:**

Add `_source` passthrough and Amazon-specific fields per the API contract:

```js
// After building the base recommendation object, before returning:
if (product._source === 'amazon') {
  rec.sourceTag = 'amazon';
  rec.merchantBadges = extractMerchantBadges(product.extensions || []);
  if (product.isPrime && !rec.merchantBadges.includes('Prime')) {
    rec.merchantBadges.unshift('Prime');
  }
  if (product.socialProof) rec.socialProof = product.socialProof;
}
```

**In `BADGE_PATTERNS` array** — add Amazon-specific patterns at the top:
```js
{ re: /^Prime$/i,          label: 'Prime' },
{ re: /best seller/i,      label: 'Best Seller' },
{ re: /amazon.s choice/i,  label: "Amazon's Choice" },
```

---

## 3. Modify `src/lib/enrich-scrapingdog.js`

Amazon products fall through to `buildFallback()` because `immersiveUrl` is null. Update `buildFallback()` to preserve Amazon's rich search data instead of nulling it out:

```js
function buildFallback(product, partialData = {}) {
  return {
    ...product,
    merchantUrl: product.link,
    merchantName: product._source === 'amazon' ? 'Amazon' : null,
    description: null,
    brand: null,
    imageUrls: [],
    merchantRating: product._source === 'amazon' ? product.rating : null,
    merchantReviews: product._source === 'amazon' ? product.reviews : null,
    merchantExtensions: product._source === 'amazon' ? (product.extensions || []) : [],
    ...partialData,
  };
}
```

## 4. No changes needed to:
- `taste-profile.js`, `search-queries-deep.js`, `dedupe-products.js`, `prune-products.js`, `generate-pills.js`, `score-pdp.js`, `models/shopping-cache.js`
