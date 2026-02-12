## Technical architecture and decisions

### Application Architecture
- **Framework:** Next.js 15 with App Router
- **Rendering:** Client-side rendering for the main page (`'use client'` directive)
- **API:** Next.js API routes (`src/app/api/`)
- **Component Library:** shadcn/ui (new-york style, JSX not TSX)
- **Styling:** Tailwind CSS v4 with CSS variables for theming

### Project Structure
```
ForHer.AI/
├── src/
│   ├── app/
│   │   ├── page.js            # Main landing page (client component)
│   │   ├── layout.js          # Root layout with Manrope font
│   │   ├── globals.css         # Tailwind + CSS variables + animations
│   │   └── api/
│   │       └── recommendations/
│   │           └── route.js    # POST endpoint for gift recommendations
│   ├── components/
│   │   ├── ProfilePill.jsx     # Taste-profile pill (category-colored capsule)
│   │   ├── ProductImage.jsx    # Product image with loading/error fallback
│   │   ├── RichSummary.jsx     # Renders summary text with **bold** markers
│   │   ├── GiftCard.jsx        # Gift card component (image, pills, CTA)
│   │   └── ui/
│   │       ├── button.jsx      # shadcn Button component
│   │       └── textarea.jsx    # shadcn Textarea component
│   └── lib/
│       ├── utils.js            # cn() utility (clsx + tailwind-merge)
│       ├── openai.js           # OpenAI client singleton
│       ├── mongoose.js         # MongoDB connection singleton (cached, targets serper-queries DB)
│       ├── tavily.js           # Tavily client singleton
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction
│       ├── search-queries.js   # generateQueries() — Tavily search query generation
│       ├── search-queries-deep.js # generateDeepQueries() — 3 broad Google queries for deep research mode
│       ├── search-tavily.js    # executeQueries() — Runs queries against Tavily API
│       ├── search-serper.js    # executeSerperQueries() — Serper Shopping API + MongoDB cache
│       ├── standard-pipeline.js # runStandardPipeline() — Full Tavily pipeline in a single function call
│       ├── product-candidate.js # ProductCandidate class — normalized product data
│       ├── filter-urls.js       # filterProductUrls() — Rejects non-product URLs before extraction
│       ├── classify-candidates.js # classifyCandidates() — Snippet-based page classifier (pre-extract)
│       ├── extract-products.js  # extractProducts() — Scrapes URLs via Tavily extract
│       ├── dedupe-candidates.js # deduplicateCandidates() — Collapses duplicate product candidates
│       ├── rerank-candidates.js # rerankCandidates() — Confidence-weighted scoring against taste profile
│       └── models/
│           └── shopping-cache.js # ShoppingCache Mongoose model (TTL-indexed cache)
├── gift-finder.jsx             # Original standalone prototype (not used in app)
├── memory-banks/               # Context tracking files
├── .env.local                  # API keys (OPENAI_API_KEY, etc.)
├── CLAUDE.md                   # Project specs and instructions
├── package.json
├── next.config.mjs
├── jsconfig.json               # Path aliases (@/* → ./src/*)
├── components.json             # shadcn/ui configuration
└── postcss.config.mjs
```

### Key Patterns

**State Machine (Phase-based UI):**
The main page uses a `phase` state to switch between three views:
- `'input'` — Text area for describing the recipient
- `'thinking'` — Loading animation while fetching recommendations
- `'results'` — Gift card grid with personalized heading

**API Communication:**
- Client POSTs `{ description, deepResearch }` to `/api/recommendations`
- `deepResearch` (boolean, default `true`) toggles between deep research mode (Serper) and standard mode (Tavily-only)
- Server returns `{ recommendations: [...], meta: { curatedFor, summary }, tasteProfile: {...} }`
- Taste profile is generated via OpenAI (gpt-4o-mini) from the free-text description

**Deep Research Mode:**
- Toggled via a switch in the input phase UI (checked by default)
- Generates 3 broad, natural Google-style queries via `generateDeepQueries()` (OpenAI gpt-4o-mini)
- Executes queries against Serper.dev Shopping API (10 results per query)
- Results cached in MongoDB (`shopping-cache` collection) with 48-hour TTL to avoid redundant API calls
- Cache key: `sha256("serper|US|" + normalizedQuery)` — queries are normalized (stopword removal + basic stemming + sorted) for dedup
- Currently returns mock data while Serper integration is developed; standard pipeline commented out to save Tavily tokens

**Serper Shopping Cache (MongoDB):**
- Connection: `src/lib/mongoose.js` — cached singleton, database `serper-queries`
- Model: `src/lib/models/shopping-cache.js` — collection `shopping-cache`
- Document schema: `{ _id (cacheKey), query: { raw, normalized, locale }, provider, fetchedAt, expiresAt (TTL), results[] }`
- Results stored as strings (price kept as `"$29.99"` to avoid type conversions)
- TTL index on `expiresAt` — MongoDB auto-deletes expired documents

**Taste Profile Pipeline:**
- `src/lib/openai.js` — OpenAI client singleton
- `src/lib/taste-profile.js` — `generateTasteProfile(description)` sends user input to LLM, returns structured JSON
- LLM extracts: recipient info, occasion, budget, interests, aesthetic, personality, constraints, gifting context
- Uses low temperature (0.3) for consistent structured output

**Search Query Pipeline:**
- `src/lib/search-queries.js` — `generateQueries(tasteProfile)` takes the taste profile object and generates 10 Tavily search queries
- Each query has an intent: product (6), brand (2), validation (1), fallback/logistics (1)
- Uses OpenAI JSON mode (`response_format: { type: 'json_object' }`) for guaranteed valid JSON
- Respects budget, constraints, and avoidCategories from the taste profile

**Tavily Search Execution:**
- `src/lib/tavily.js` — Tavily client singleton (mirrors `openai.js` pattern), uses `TAVILY_API_KEY` env var
- `src/lib/search-tavily.js` — `executeQueries(giftQueries)` runs all 10 queries in parallel via `Promise.all`
- Per query: `tvly.search(query.q, { searchDepth: 'basic', maxResults: 3 })`
- Results are deduplicated by URL (highest score wins), sorted by score descending
- Returns array of `{ title, url, content, score }` objects

**URL Filtering:**
- `src/lib/filter-urls.js` — `filterProductUrls(searchResults)` rejects non-product URLs before extraction
- Blocks category pages, blog posts, gift guides, search pages, editorial content, etc.
- Matches against path segments (e.g. `/collections/`, `/blog/`) and query params (`?q=`, `?search=`)
- Runs synchronously between `executeQueries()` and `classifyCandidates()` to save Tavily extract tokens

**Snippet-Based Page Classification:**
- `src/lib/classify-candidates.js` — `classifyCandidates(searchResults)` scores search results by title + content signals
- Runs between `filterProductUrls()` and `extractProducts()` — uses free Tavily search snippets to avoid expensive extract calls
- Weighted signal scoring: positive signals (buy-path language, prices, product structure) vs. negative signals (listicle titles, editorial content, numbered lists, multiple prices)
- Net score >= 0 → keep (benefit of the doubt for sparse snippets), < 0 → reject
- Same input/output shape as filterProductUrls: `[{ title, url, content, score }]` → filtered subset

**Product Extraction Pipeline:**
- `src/lib/product-candidate.js` — `ProductCandidate` class, normalized data container for scraped products
- `src/lib/extract-products.js` — `extractProducts(searchResults)` takes Tavily search results, scrapes each URL via `tvly.extract()`, merges data into `ProductCandidate[]`
- Batches URLs (10 per batch), extracts in parallel, gracefully degrades on failure (creates candidate from search data alone)
- Helpers: price regex extraction (contextual → decimal → whole dollar), image filtering (no logos/icons/svg/gif), domain extraction

**Candidate Deduplication:**
- `src/lib/dedupe-candidates.js` — `deduplicateCandidates(candidates)` collapses duplicate ProductCandidates after extraction
- Deduplicates by canonicalized URL (strips tracking params like utm_*, fbclid, gclid; normalizes hostname; sorts query params) and by normalized title (strips store-name suffixes, removes non-alphanumeric chars)
- When duplicates collide, keeps the most complete candidate (scored by isComplete, hasPrice, searchScore)
- Runs in O(n) via two Maps (canonicalUrlMap, normalizedTitleMap)

**Candidate Reranking (Confidence-Weighted):**
- `src/lib/rerank-candidates.js` — `rerankCandidates(candidates, tasteProfile)` scores and sorts candidates by taste profile relevance
- Scoring dimensions (each 0–1): budgetFit, interestMatch, aestheticMatch, searchRelevance, dataCompleteness, personalityMatch
- **Confidence-weighted:** each dimension's base weight is scaled by how much signal the taste profile provides for that field (e.g. strict budget with both bounds → confidence 1.0 → full weight; no budget → confidence 0 → weight redistributed). Explicit preferences dominate; missing fields fade out.
- Hard filter phase removes candidates matching `constraints[]` or `avoidCategories[]` entirely
- Text matching uses naive stemming + phrase decomposition (no external NLP dependency)
- Attaches `relevanceScore` (0–1) to each candidate for downstream use
- Attaches `matchedAttributes` array to each candidate — `{ label, category }` for taste profile terms found in product text
  - Categories: `interest`, `aesthetic`, `personality`, `budget`, `context`
- Base weights: budget 0.25, interest 0.25, aesthetic 0.15, search 0.15, completeness 0.10, personality 0.10

**ProductCandidate Schema:**
```js
{
  title: string,        // required — product name
  url: string,          // required — product page URL
  description: string,  // short product description (from search snippet or extracted)
  price: string,        // display price, e.g. "$68.00"
  priceValue: number,   // numeric price for budget filtering
  imageUrl: string,     // product image URL (filtered for quality)
  source: string,       // domain name, e.g. "etsy.com"
  searchScore: number,  // Tavily relevance score from search
  rawContent: string,   // full extracted page text (for future LLM ranking)
}
// Getters: isComplete (title + url + image + description), hasPrice
```

**Component Strategy:**
- shadcn/ui components for base primitives (Button, Textarea)
- Extracted domain components in `src/components/` (ProductImage, RichSummary, GiftCard, ProfilePill)
- Tailwind utility classes for all styling — no separate CSS modules

**Recommendation Card Schema:**
Each recommendation object contains:
```js
{
  name: string,       // Product name
  price: string,      // Display price
  why: string,        // Personalized reasoning
  tag: string,        // Category label (e.g., "TOP MATCH", "GREAT FIND")
  matchScore: number, // 0–100, derived from relevanceScore
  matchedAttributes: [{ label: string, category: string }], // Up to 3 taste profile pills
  ctaText: string,    // Button text (e.g., "Explore Details")
  ctaColor: string,   // Hex color for CTA button
  url: string,        // Purchase link
  imageUrl: string,   // Product image URL
  imageBg: string,    // Fallback background color
}
```

**Meta Schema:**
```js
{
  curatedFor: string,  // Recipient name/label for heading
  summary: string,     // Rich text summary (supports **bold** markers)
}
```

### Design Tokens (CSS Variables)
Defined in `globals.css`:
- `--color-sage: #8fa38a` (Soft Sage Green — primary)
- `--color-taupe: #a89a8e` (Warm Taupe)
- `--color-clay: #b68d7a` (Muted Clay — accent)
- `--color-cream: #fdfbf7` (Light airy cream — background)
- `--color-stone-soft: #7a7672`
- Font: Manrope via `next/font/google`

**ProfilePill Color Mapping:**
| Category | Background | Text |
|----------|-----------|------|
| `interest` | sage/15 | sage (#8fa38a) |
| `aesthetic` | clay/15 | clay (#b68d7a) |
| `personality` | taupe/15 | taupe (#a89a8e) |
| `budget` | stone-soft/15 | stone-soft (#7a7672) |
| `context` | muted | muted-foreground |

### Animations
- `fade-up` — Entry animation for sections (opacity + translateY)
- `spin-slow` — 3s rotation for thinking indicator
- Staggered `animationDelay` on gift cards for sequential reveal
