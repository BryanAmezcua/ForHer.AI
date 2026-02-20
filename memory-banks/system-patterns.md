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
│   │   ├── s/
│   │   │   └── [id]/
│   │   │       ├── page.js         # Shared session view (server component)
│   │   │       └── not-found.js    # Custom 404 for expired/invalid sessions
│   │   └── api/
│   │       ├── taste-profile/
│   │       │   └── route.js    # POST endpoint for taste profile + clarification
│   │       └── recommendations/
│   │           └── route.js    # POST endpoint for gift recommendations
│   ├── components/
│   │   ├── SessionResults.jsx   # Reusable results view (used by / and /s/[id])
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
│       ├── taste-profile.js    # generateProfileAndQueries() — LLM taste extraction + query generation (always returns searchQueries)
│       ├── pipeline.js         # runPipeline() — orchestrates full product discovery pipeline
│       ├── search-amazon.js    # executeAmazonQueries() + getAllCachedResults() — ScrapingDog Amazon Search API + MongoDB cache + affiliate tagging
│       ├── clean-title.js      # cleanTitle() — strips e-commerce junk from product titles (brands, recipients, sizes)
│       ├── dedupe-products.js  # dedupeProducts() — Jaccard + price clustering for shopping results
│       ├── prune-products.js   # pruneProducts() — Coarse pre-filter (no image, price floor, data quality sort) → top 30 for reranker
│       ├── rerank-products.js  # rerankProducts() — LLM reranker: brand-first quality ranking, returns top 12 with giftScore + reason
│       ├── generate-pills.js   # generateProductInsights() — LLM-generated pills + reaction lines + whySheLikesIt (uses reranker reasons)
│       ├── debug.js            # Debug/logging utility
│       ├── parse-price.js      # Price string parsing utility
│       ├── strip-markdown.js   # Markdown stripping utility
│       └── models/
│           ├── shopping-cache.js # ShoppingCache Mongoose model (TTL-indexed cache)
│           └── session.js        # Session model (shareable recommendation sessions, 7-day TTL)
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
- `'clarifying'` — Budget question with 3 pill options (client-side regex detection, shown instantly when no budget mentioned)
- `'populating'` — Skeleton cards while recommendations load (messages stop cycling after "Almost there...")
- `'results'` — Gift card grid with personalized heading

**Budget Detection & Parallel Prefetch:**
- `hasBudgetMention(text)` regex detects budget keywords in user input client-side
- If no budget detected: budget pills appear instantly (`BUDGET_CLARIFICATION` static object), taste profile API runs in background (`profilePromiseRef`)
- If budget present: goes straight to thinking phase, awaits profile, then fetches recommendations
- When user picks a budget option: awaits the in-flight profile promise, patches budget in, proceeds to recommendations
- No LLM clarification — the LLM always returns a complete profile + 5 search queries

**API Communication (Two-step flow):**
1. Client POSTs `{ description }` to `/api/taste-profile`
   - Server returns `{ tasteProfile: {...} }` — always includes `searchQueries` (3 queries), never returns clarification
2. If budget missing: client shows budget pills (instant, no API wait), taste profile fetches in parallel
3. Client POSTs `{ tasteProfile }` to `/api/recommendations` (pre-built profile, skips re-generation)
   - Server returns `{ recommendations: [...], meta: { curatedFor, summary }, tasteProfile: {...} }`
- Taste profile + 5 Amazon search queries generated via a single OpenAI call from the free-text description (queries use product-category approach, never contain the word "gift")

**Product Discovery Pipeline:**
- Orchestrated by `pipeline.js` — supports both cache-only (emergency fallback) and full modes (currently full)
- Flow: taste profile → 5-6 Amazon queries → `dedupeProducts()` → `pruneProducts()` (coarse filter → ~30) → `rerankProducts()` (LLM brand-first ranking → top 12) → `assignProductsToRows()` → `generateProductInsights()` (pills + reaction lines + whySheLikesIt) → 3x3 display
- Generates 5 product-category search queries via OpenAI (4 direct + 1 adjacent/surprise, "gift" keyword banned)
- All results are Amazon-only: rich data (Prime, ratings, reviews, social proof), affiliate-tagged URLs
- Results cached in MongoDB with 24-hour TTL
- Cache keys: `sha256("amazon|US|" + normalizedQuery)`
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

**Shopping Pruning (Coarse Pre-filter):**
- `src/lib/prune-products.js` — `pruneProducts(products, tasteProfile)` applies hard filters and soft-sorts for the reranker
- Hard filters: drop items with no image, drop items under $20 (adaptive if budget max is below threshold)
- Soft sort by data quality: rating, review volume, price info, budget fit
- Returns top ~30 candidates (COARSE_POOL_SIZE) for the LLM reranker; exports DISPLAY_COUNT = 9

**LLM Reranking:**
- `src/lib/rerank-products.js` — `rerankProducts(candidates, tasteProfile)` evaluates ~30 candidates via LLM
- Brand-first ranking hierarchy: recognized brands > premium/artisan brands > well-reviewed unbranded > hard reject (novelty/slogan items)
- Returns top 12 products with `_matchScore` (0-100 giftScore) and `_rerankerReason` (10-word explanation)
- Graceful fallback: on LLM failure, returns candidates in input order with default scores
- Cost: ~$0.001/request (gpt-4o-mini, small payload)

**Product Insights (LLM):**
- `src/lib/generate-pills.js` — `generateProductInsights()` generates pills + reaction lines + whySheLikesIt in a single LLM call
- Returns: matchedAttributes (1-2 pills per product) + reactionLine (predicted recipient reaction) + whySheLikesIt (1-2 sentence personalized description, max ~30 words)

**Pipeline Output (buildRecommendation):**
- `pipeline.js` maps products to recommendation objects with all fields
- matchScore: derived from prune scoring (0-1 → 0-100)
- badgeLabel + badgeType: rule-based (>=85 → confidence, occasion present → occasion, else → social)
- reactionLine: from LLM insights (null in cache-only mode)

**Shopping Cache (MongoDB):**
- Connection: `src/lib/mongoose.js` — cached singleton, cluster `cached-data`, database `GiftHer`
- Model: `src/lib/models/shopping-cache.js` — collection `products`
- TTL index on `expiresAt` — MongoDB auto-deletes expired documents (24-hour TTL)

**Session Persistence (MongoDB):**
- Model: `src/lib/models/session.js` — collection `sessions`
- Schema: `_id` (10-char hex string), `recommendations` (Mixed), `meta` ({ curatedFor, summary }), `tasteProfile` (Mixed), `createdAt` (Date), `expiresAt` (Date, TTL index)
- 7-day TTL — MongoDB auto-deletes expired sessions
- Session ID generated via `crypto.randomUUID()` (first 10 hex chars)
- Saved fire-and-forget after pipeline completes (no await, `.catch()` logs errors)
- Shared view at `/s/[id]` — server component loads session from DB, renders `SessionResults`
- Share button copies URL to clipboard with "Copied!" feedback
- On main page, URL updates to `/s/[id]` via `history.replaceState` after results load
- Graceful degradation: if save fails, user still gets results (just no shareable URL)

**Recommendation Card Schema:**
Each recommendation object contains:
```js
{
  name: string,              // Product name (cleaned via cleanTitle())
  price: string,             // Display price
  description: string,       // "Why she'll like it" — LLM-generated personalized description
  brand: string|null,        // Brand name
  rating: string|null,       // e.g. "4.7" (Amazon aggregate)
  tag: string,               // Category label (e.g., "TOP PICK", "GREAT FIND")
  matchScore: number|null,   // 0-100 match confidence (MatchRing shows at >= 85)
  badgeLabel: string|null,   // e.g., "Best Match", "She'll Love This"
  badgeType: string|null,    // "confidence" | "social" | "occasion"
  reactionLine: string|null, // LLM-generated predicted reaction quote
  matchedAttributes: [{ label: string, category: string }], // LLM gift-fit pills
  merchantBadges: string[],  // e.g. ["Prime", "Free Shipping", "Best Seller", "30-Day Returns"]
  ctaText: string,           // "View on Amazon"
  ctaColor: string,          // Hex color for CTA
  url: string,               // Amazon affiliate link
  imageUrl: string,          // Primary product image
  imageUrls: string[],       // Thumbnail gallery (empty if ≤1 image)
  imageBg: string,           // Fallback background color
  sourceTag: string,         // Always "amazon"
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

### Animations
- `fade-up` — Entry animation for sections (opacity + translateY)
- `card-entrance` — Card entry animation
- `badge-pop` — Badge pop-in animation
- `pulse-ring` — 1.8s pulsing ring for thinking indicator
- `confidence-ring-pulse` — Subtle pulse for high-confidence MatchRing (score >= 90)
- `spin-slow` — 3s rotation (retained for potential use)
- Staggered `animationDelay` on gift cards for sequential reveal
