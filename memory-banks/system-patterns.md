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
│   │       ├── taste-profile/
│   │       │   └── route.js    # POST endpoint for taste profile + clarification
│   │       └── recommendations/
│   │           └── route.js    # POST endpoint for gift recommendations (accepts pre-built taste profile)
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
│       ├── openai.js           # OpenAI client singleton + MODEL constant
│       ├── mongoose.js         # MongoDB connection singleton (cached, targets serper-queries DB)
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction
│       ├── search-queries-deep.js # generateDeepQueries() — 3 broad Google queries
│       ├── search-scrapingdog.js  # executeScrapingDogQueries() — ScrapingDog Shopping API + MongoDB cache
│       ├── dedupe-serper.js    # dedupeSerperResults() — Jaccard + price clustering for shopping results
│       ├── score-pdp.js        # scorePDP() — PDP confidence scoring (URL/title/snippet signals)
│       ├── prune-serper.js     # pruneSerperResults() — Gift-set filter + score + cut to top 16 (enrichment pool)
│       ├── generate-pills.js  # generatePillLabels() — LLM-generated "why this fits" pills (1-2 per product)
│       ├── enrich-scrapingdog.js # enrichProducts() — ScrapingDog Immersive Product API for merchant URLs + descriptions + store selection
│       └── models/
│           └── shopping-cache.js # ShoppingCache Mongoose model (TTL-indexed cache)
├── gift-finder.jsx             # Original standalone prototype (not used in app)
├── memory-banks/               # Context tracking files
├── .env.local                  # API keys (OPENAI_API_KEY, SCRAPINGDOG_API_KEY, etc.)
├── CLAUDE.md                   # Project specs and instructions
├── package.json
├── next.config.mjs
├── jsconfig.json               # Path aliases (@/* → ./src/*)
├── components.json             # shadcn/ui configuration
└── postcss.config.mjs
```

### Key Patterns

**State Machine (Phase-based UI):**
The main page uses a `phase` state to switch between five views:
- `'input'` — Text area for describing the recipient
- `'thinking'` — Loading animation while generating taste profile or fetching recommendations
- `'clarifying'` — Follow-up question with 3 pill options (only shown when description is vague)
- `'populating'` — Skeleton cards while recommendations load
- `'results'` — Gift card grid with personalized heading

**API Communication (Two-step flow):**
1. Client POSTs `{ description }` to `/api/taste-profile`
   - Server returns `{ tasteProfile: {...} }` — includes `clarification` field (question + 3 options with patches) or `clarification: null`
2. If clarification needed: client shows question, user selects option, taste profile is patched client-side
3. Client POSTs `{ tasteProfile }` to `/api/recommendations` (pre-built profile, skips re-generation)
   - Server returns `{ recommendations: [...], meta: { curatedFor, summary }, tasteProfile: {...} }`
- Taste profile is generated via OpenAI from the free-text description (model set in `src/lib/openai.js`)

**Product Discovery Pipeline (ScrapingDog Shopping):**
- Single pipeline, no toggle — ScrapingDog Shopping is the only data fetching strategy
- Flow: taste profile → `generateDeepQueries()` → `executeScrapingDogQueries()` → `dedupeSerperResults()` → `pruneSerperResults()` (gift-set filter + top 16) → `enrichProducts()` + `generatePillLabels()` (parallel) → `scorePDP()` filter → top 9 display
- Generates 3 broad, natural Google-style queries via OpenAI
- Executes queries against ScrapingDog Google Shopping API (~40+ results per query)
- Results cached in MongoDB with 48-hour TTL
- Cache key: `sha256("scrapingdog|US|" + normalizedQuery)` — queries normalized (stopword removal + basic stemming + sorted)
- ScrapingDog returns richer data than Serper: ratings, reviews, extensions, extracted_price, product IDs, immersive product links

**Shopping Deduplication:**
- `src/lib/dedupe-serper.js` — `dedupeSerperResults(serperResults)` collapses duplicate products across all queries
- Title normalization: lowercase, strip `®™©`, remove trailing store-name suffixes, drop junk words (retailer names, "free shipping", "sale", etc.), standardize synonyms (`qt`→`quart`, `oz`→`ounce`, etc.)
- Clustering: Jaccard similarity (>= 0.55) on normalized word tokens + price proximity (within 30%)
- Winner selection: prefer listings with image, then lowest price
- Attaches `clusterSize` to each winner for downstream scoring
- Runs after `executeScrapingDogQueries()`, before pruning

**Shopping Pruning:**
- `src/lib/prune-serper.js` — `pruneSerperResults(products, tasteProfile)` scores and cuts to top 16 (enrichment pool)
- Hard filters: drop items with no image, drop gift sets/bundles (title regex patterns)
- Weighted scoring: interest relevance (30%), budget fit (25%), confidence (20%), price sanity (10%), data completeness (10%), review volume (5%)
- Budget fit: 1.0 if within range, 0.5 if within 20% grace zone, 0 if way outside
- Confidence: combines cluster size (3+ = 1.0, 2 = 0.5, 1 = 0.2) + rating boost (+0.3 for 4.0+, +0.1 for 3.0+)
- Review volume: reviewCount >= 100 → 1.0, >= 10 → 0.5, else 0.1
- Data completeness: price (+0.5), rating (+0.25), reviews (+0.25)
- Interest relevance: token overlap between product title and taste profile interests array (with alias fallback from interestAliases)
- Pill labels generated by a separate LLM call, run in parallel with ScrapingDog enrichment
- Sorts descending, returns top 16 (ENRICH_POOL_SIZE); exports DISPLAY_COUNT = 9
- Runs after `dedupeSerperResults()`, before enrichment

**PDP Confidence Scoring:**
- `src/lib/score-pdp.js` — `scorePDP({ url, title, price, snippet })` returns numeric confidence score
- URL path signals: +1 product paths, -1 search/browse paths, -1 search query params
- Shopify: +2 /products/, +1 /collections/.../products/, -2 /collections/ without /products/
- Domain rules (+3): Amazon /dp/, Walmart /ip/, Target /p/, BestBuy /site/, Etsy /listing/
- Title/snippet: +1 price symbol, +1 size/model indicators, -1 editorial terms
- Editorial paths: -2 for /gift-guide/, /best-sellers/, /top-10/, /ideas/, /edit/
- Thresholds: >= +3 accept, <= -2 reject, -1 to +2 pass as-is
- Runs after ScrapingDog enrichment, before final assembly; trims to DISPLAY_COUNT (9)

**Product Enrichment (ScrapingDog Immersive Product):**
- `src/lib/enrich-scrapingdog.js` — `enrichProducts(products)` resolves merchant URLs and descriptions via ScrapingDog Immersive Product API
- Each product has an `immersiveUrl` (pre-built API URL with api_key and page_token from Shopping response)
- Response includes `stores[]` array with real merchant URLs, ratings, reviews, extensions, prices
- Store selection algorithm picks best store: reject out-of-stock, score on PDP signals (+2), ratings (+1), in-stock (+1), free shipping (+0.5), free returns (+0.5), tiebreak by lowest total_price
- Also extracts: product description, brand, thumbnail URLs
- Fallback: if no stores survive or API fails, keeps Google Shopping link + null description
- Batched 5 at a time (ScrapingDog LITE plan concurrency limit)
- Cost: ~5 credits per Immersive Product call (16 calls = 80 credits per request)

**Shopping Cache (MongoDB):**
- Connection: `src/lib/mongoose.js` — cached singleton, database `serper-queries`
- Model: `src/lib/models/shopping-cache.js` — collection `shopping-cache`
- Document schema: `{ _id (cacheKey), query: { raw, normalized, locale }, provider, fetchedAt, expiresAt (TTL), results[] }`
- Results include: title, link, price, extractedPrice, source, imageUrl, rating, reviews, extensions, productId, immersiveUrl
- TTL index on `expiresAt` — MongoDB auto-deletes expired documents

**Taste Profile Pipeline:**
- `src/lib/openai.js` — OpenAI client singleton
- `src/lib/taste-profile.js` — `generateTasteProfile(description)` sends user input to LLM, returns structured JSON
- LLM extracts: recipient info, occasion, budget, interests, interestAliases (~10 shopping tokens per interest), aesthetic, personality, constraints, gifting context
- Uses low temperature (0.3) for consistent structured output

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
  description: string,// Product description from Immersive Product
  brand: string|null, // Brand name
  rating: string|null,// e.g. "4.7/5" (prefers merchant-level, falls back to Google aggregate)
  tag: string,        // Category label (e.g., "TOP PICK", "GREAT FIND")
  matchedAttributes: [{ label: string, category: string }], // Up to 2 LLM-generated gift-fit pills
  merchantBadges: string[],  // e.g. ["Free Shipping", "30-Day Returns"] — from store extensions
  ctaText: string,    // Button text (e.g., "View Product")
  ctaColor: string,   // Hex color for CTA button
  url: string,        // Purchase link (real merchant URL from store selection)
  imageUrl: string,   // Product image URL (primary/hero)
  imageUrls: string[],// All product thumbnails (empty if ≤1 image; gallery triggers at 2+)
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
Theme: "Whiskey Lounge" — dark warm palette, permanently dark (no light mode toggle).

Defined in `globals.css`:
- `--background: #1a1816` (Warm near-black page bg)
- `--foreground: #f0ebe5` (Warm off-white primary text)
- `--card: rgba(255,255,255,0.05)` (Card glass surface)
- `--primary / --accent: #c8956c` (Copper — CTAs, highlights, focus rings)
- `--muted: #252220` (Dark warm surface)
- `--muted-foreground: #8a8380` (Warm gray secondary text)
- `--border / --input: rgba(255,255,255,0.08)` (Subtle light borders)
- `--ring: #c8956c` (Focus ring — copper)

Brand color aliases:
- `--color-copper: #c8956c`
- `--color-warm-gray: #8a8380`
- `--color-warm-gray-light: #a09890`
- `--color-surface: #252220`
- `--color-surface-light: #2a2725`
- Font: Manrope via `next/font/google`

**ProfilePill Color Mapping:**
| Category | Background | Text |
|----------|-----------|------|
| `interest` | copper/12 | copper (#c8956c) |
| `aesthetic` | warm-gray-light/12 | warm-gray-light (#a09890) |
| `personality` | sage/12 | sage (#8fa38a) |
| `budget` | warm-gray/12 | warm-gray (#8a8380) |
| `context` | white/6 | warm-gray (#8a8380) |
| `merchant` | sage-green/10 | muted sage (#7a9a7a) |

### Animations
- `fade-up` — Entry animation for sections (opacity + translateY)
- `pulse-ring` — 1.8s pulsing ring for thinking indicator (replaced spinning sparkle)
- `spin-slow` — 3s rotation (retained for potential use)
- Staggered `animationDelay` on gift cards for sequential reveal
