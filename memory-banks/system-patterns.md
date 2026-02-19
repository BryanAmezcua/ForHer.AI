## Technical architecture and decisions

### Application Architecture
- **Framework:** Next.js 15 with App Router
- **Rendering:** Client-side rendering for the main page (`'use client'` directive)
- **API:** Next.js API routes (`src/app/api/`)
- **Component Library:** shadcn/ui (new-york style, JSX not TSX)
- **Styling:** Tailwind CSS v4 with CSS variables for theming
- **Deployment:** Vercel (auto-deploy on push to master)
- **Domain:** gifther.ai (Cloudflare DNS → Vercel)

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
│   │           └── route.js    # POST endpoint for gift recommendations
│   ├── components/
│   │   ├── ProfilePill.jsx     # Taste-profile pill (category-colored capsule)
│   │   ├── ProductImage.jsx    # Product image with loading/error fallback + gallery
│   │   ├── RichSummary.jsx     # Renders summary text with **bold** markers
│   │   ├── GiftCard.jsx        # Gift card component (image, pills, badges, match ring, CTA)
│   │   ├── GiftCardSkeleton.jsx # Skeleton loading state for gift cards
│   │   ├── MatchRing.jsx       # Animated copper confidence ring (shows when matchScore >= 85)
│   │   └── ui/
│   │       ├── button.jsx      # shadcn Button component
│   │       └── textarea.jsx    # shadcn Textarea component
│   └── lib/
│       ├── utils.js            # cn() utility (clsx + tailwind-merge)
│       ├── openai.js           # OpenAI client singleton + MODEL constant
│       ├── mongoose.js         # MongoDB connection singleton (cached, targets serper-queries DB)
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction + query generation
│       ├── pipeline.js         # runPipeline() — orchestrates full product discovery pipeline
│       ├── search-scrapingdog.js  # executeScrapingDogQueries() — ScrapingDog Shopping API + MongoDB cache
│       ├── search-amazon.js    # executeAmazonQueries() — ScrapingDog Amazon Search API + MongoDB cache + affiliate tagging
│       ├── clean-title.js      # cleanTitle() — strips e-commerce junk from product titles (brands, recipients, sizes)
│       ├── dedupe-products.js  # dedupeProducts() — Jaccard + price clustering for shopping results
│       ├── prune-products.js   # pruneProducts() — Gift-set filter + score + cut to top 16 (enrichment pool)
│       ├── enrich-scrapingdog.js # enrichProducts() — ScrapingDog Immersive Product API for merchant URLs + descriptions + store selection
│       ├── generate-pills.js   # generateProductInsights() — LLM-generated pills + reaction lines
│       ├── score-pdp.js        # scorePDP() — PDP confidence scoring (URL/title/snippet signals)
│       ├── search-queries-deep.js # generateDeepQueries() — 3 broad Google queries (may be unused if merged into taste-profile)
│       ├── debug.js            # Debug/logging utility
│       ├── parse-price.js      # Price string parsing utility
│       ├── strip-markdown.js   # Markdown stripping utility
│       └── models/
│           └── shopping-cache.js # ShoppingCache Mongoose model (TTL-indexed cache)
├── public/
│   └── icon.svg                # Copper sparkle favicon (SVG)
├── memory-banks/               # Context tracking files
├── .env.local                  # API keys (OPENAI_API_KEY, SCRAPINGDOG_API_KEY, MONGODB_URI)
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
- `'populating'` — Skeleton cards while recommendations load (messages stop cycling after "Almost there...")
- `'results'` — Gift card grid with personalized heading

**API Communication (Two-step flow):**
1. Client POSTs `{ description }` to `/api/taste-profile`
   - Server returns `{ tasteProfile: {...} }` — includes `clarification` field (question + 3 options with patches) or `clarification: null`
2. If clarification needed: client shows question, user selects option, taste profile is patched client-side
3. Client POSTs `{ tasteProfile }` to `/api/recommendations` (pre-built profile, skips re-generation)
   - Server returns `{ recommendations: [...], meta: { curatedFor, summary }, tasteProfile: {...} }`
- Taste profile + search queries generated via a single OpenAI call from the free-text description

**Product Discovery Pipeline:**
- Orchestrated by `pipeline.js` — supports both cache-only and full modes (currently full)
- Flow: taste profile → query generation (merged into taste profile LLM call) → 2 Amazon queries + 1 Google Shopping query (parallel) → `dedupeProducts()` → `pruneProducts()` (gift-set filter + top 16) → `enrichProducts()` + `generateProductInsights()` (parallel) → `scorePDP()` filter → top 9 display
- Generates 3 broad, natural queries via OpenAI; first 2 go to Amazon, third to Google Shopping
- Amazon results: rich data (Prime, ratings, reviews, social proof), affiliate-tagged URLs, skip Immersive Product enrichment
- Google Shopping results: enriched via ScrapingDog Immersive Product API for merchant URLs + descriptions
- Results cached in MongoDB with 48-hour TTL
- Cache keys: `sha256("scrapingdog|US|" + normalizedQuery)` for Google, `sha256("amazon|US|" + normalizedQuery)` for Amazon
- Queries normalized: stopword removal + basic stemming + sorted

**Title Cleaning:**
- `src/lib/clean-title.js` — `cleanTitle(raw)` strips e-commerce junk from product titles
- Strips: ALL-CAPS brand prefixes, trailing parenthesized content, recipient lists, size/dimension specs, brand suffixes
- Truncates to ~60 chars at word boundary; collapses whitespace

**Shopping Deduplication:**
- `src/lib/dedupe-products.js` — `dedupeProducts(results)` collapses duplicate products across all queries
- Title normalization: lowercase, strip `®™©`, remove trailing store-name suffixes, drop junk words
- Clustering: Jaccard similarity (>= 0.55) on normalized word tokens + price proximity (within 30%)
- Winner selection: prefer listings with image, then lowest price
- Attaches `clusterSize` to each winner for downstream scoring

**Shopping Pruning:**
- `src/lib/prune-products.js` — `pruneProducts(products, tasteProfile)` scores and cuts to top 16
- Hard filters: drop items with no image, drop gift sets/bundles (title regex patterns)
- Weighted scoring: interest relevance (30%), budget fit (25%), confidence (20%), price sanity (10%), data completeness (10%), review volume (5%)
- Attaches `_pruneScore` to each product for downstream matchScore calculation
- Sorts descending, returns top 16 (ENRICH_POOL_SIZE); exports DISPLAY_COUNT = 9

**PDP Confidence Scoring:**
- `src/lib/score-pdp.js` — `scorePDP({ url, title, price, snippet })` returns numeric confidence score
- Thresholds: >= +3 accept, <= -2 reject, -1 to +2 pass as-is
- Runs after ScrapingDog enrichment, before final assembly; trims to DISPLAY_COUNT (9)

**Product Enrichment (ScrapingDog Immersive Product):**
- `src/lib/enrich-scrapingdog.js` — `enrichProducts(products)` resolves merchant URLs and descriptions
- Store selection algorithm picks best store: reject out-of-stock, score on PDP signals, ratings, stock, shipping
- Batched 5 at a time (ScrapingDog LITE plan concurrency limit)
- Amazon products (`_source === 'amazon'`) skip enrichment (no `immersiveUrl`), fall through to `buildFallback()` which preserves their rich search data (rating, reviews, extensions, merchantName = "Amazon")

**Product Insights (LLM):**
- `src/lib/generate-pills.js` — `generateProductInsights()` generates pills + reaction lines in a single LLM call
- Returns: matchedAttributes (1-2 pills per product) + reactionLine (predicted recipient reaction)

**Pipeline Output (buildRecommendation):**
- `pipeline.js` maps products to recommendation objects with all fields
- matchScore: derived from prune scoring (0-1 → 0-100)
- badgeLabel + badgeType: rule-based (>=85 → confidence, occasion present → occasion, else → social)
- reactionLine: from LLM insights (null in cache-only mode)

**Shopping Cache (MongoDB):**
- Connection: `src/lib/mongoose.js` — cached singleton, database `serper-queries`
- Model: `src/lib/models/shopping-cache.js` — collection `shopping-cache`
- TTL index on `expiresAt` — MongoDB auto-deletes expired documents

**Recommendation Card Schema:**
Each recommendation object contains:
```js
{
  name: string,              // Product name (cleaned via cleanTitle())
  price: string,             // Display price
  description: string,       // Product description from Immersive Product
  brand: string|null,        // Brand name
  rating: string|null,       // e.g. "4.7" (prefers merchant-level, falls back to Google/Amazon aggregate)
  tag: string,               // Category label (e.g., "TOP PICK", "GREAT FIND")
  matchScore: number|null,   // 0-100 match confidence (MatchRing shows at >= 85)
  badgeLabel: string|null,   // e.g., "Best Match", "She'll Love This"
  badgeType: string|null,    // "confidence" | "social" | "occasion"
  reactionLine: string|null, // LLM-generated predicted reaction quote
  matchedAttributes: [{ label: string, category: string }], // LLM gift-fit pills
  merchantBadges: string[],  // e.g. ["Prime", "Free Shipping", "Best Seller", "30-Day Returns"]
  ctaText: string,           // Button text
  ctaColor: string,          // Hex color for CTA
  url: string,               // Purchase link (merchant URL, Amazon affiliate link, or Google Shopping fallback)
  imageUrl: string,          // Primary product image
  imageUrls: string[],       // Thumbnail gallery (empty if ≤1 image)
  imageBg: string,           // Fallback background color
  sourceTag: string|null,    // "amazon" or null — drives Amazon badge on frontend
  socialProof: string|null,  // e.g. "50+ bought in past month" — Amazon social proof
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
| `amazon` | orange/12 | Amazon orange (#FF9900) |

### Animations
- `fade-up` — Entry animation for sections (opacity + translateY)
- `card-entrance` — Card entry animation
- `badge-pop` — Badge pop-in animation
- `pulse-ring` — 1.8s pulsing ring for thinking indicator
- `confidence-ring-pulse` — Subtle pulse for high-confidence MatchRing (score >= 90)
- `spin-slow` — 3s rotation (retained for potential use)
- Staggered `animationDelay` on gift cards for sequential reveal
