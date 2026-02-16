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
│       ├── openai.js           # OpenAI client singleton
│       ├── mongoose.js         # MongoDB connection singleton (cached, targets serper-queries DB)
│       ├── tavily.js           # Tavily client singleton (retained for future enrichment)
│       ├── search-tavily.js    # executeQueries() — Tavily search executor (retained for future enrichment)
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction
│       ├── search-queries-deep.js # generateDeepQueries() — 3 broad Google queries
│       ├── search-serper.js    # executeSerperQueries() — Serper Shopping API + MongoDB cache
│       ├── dedupe-serper.js    # dedupeSerperResults() — Jaccard + price clustering for shopping results
│       ├── prune-serper.js     # pruneSerperResults() — Score + cut to top 5 products
│       ├── generate-pills.js  # generatePillLabels() — LLM-generated "why this fits" pills (1-2 per product)
│       ├── enrich-serper.js   # enrichProducts() — Tavily search to resolve merchant URLs + descriptions
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
- Taste profile is generated via OpenAI (gpt-4o-mini) from the free-text description

**Product Discovery Pipeline (Serper Shopping):**
- Single pipeline, no toggle — Serper Shopping is the only data fetching strategy
- Flow: taste profile → `generateDeepQueries()` → `executeSerperQueries()` → `dedupeSerperResults()` → `pruneSerperResults()` → `enrichProducts()` → recommendations
- Generates 3 broad, natural Google-style queries via OpenAI gpt-4o-mini
- Executes queries against Serper.dev Shopping API (10 results per query)
- Results cached in MongoDB with 48-hour TTL
- Cache key: `sha256("serper|US|" + normalizedQuery)` — queries normalized (stopword removal + basic stemming + sorted)
- Pipeline now returns real product data (no more mock recommendations)

**Serper Shopping Deduplication:**
- `src/lib/dedupe-serper.js` — `dedupeSerperResults(serperResults)` collapses duplicate products across all queries
- Title normalization: lowercase, strip `®™©`, remove trailing store-name suffixes, drop junk words (retailer names, "free shipping", "sale", etc.), standardize synonyms (`qt`→`quart`, `oz`→`ounce`, etc.)
- Clustering: Jaccard similarity (>= 0.55) on normalized word tokens + price proximity (within 30%)
- Winner selection: prefer listings with image, then lowest price
- Attaches `clusterSize` to each winner for downstream scoring
- Runs after `executeSerperQueries()`, before pruning

**Serper Shopping Pruning:**
- `src/lib/prune-serper.js` — `pruneSerperResults(products, tasteProfile)` scores and cuts to top 5
- Hard filter: drop items with no image
- Weighted scoring: interest relevance (35%), budget fit (25%), cluster size (20%), price sanity (10%), data completeness (10%)
- Budget fit: 1.0 if within range, 0.5 if within 20% grace zone, 0 if way outside
- Cluster size: 3+ = 1.0, 2 = 0.5, 1 = 0.2
- Interest relevance: token overlap between product title and taste profile interests array (with alias fallback from interestAliases)
- Pill labels generated by a separate LLM call (gpt-4o-mini), run in parallel with Tavily enrichment
- Sorts descending, returns top 10
- Runs after `dedupeSerperResults()`, before enrichment

**Serper Shopping Cache (MongoDB):**
- Connection: `src/lib/mongoose.js` — cached singleton, database `serper-queries`
- Model: `src/lib/models/shopping-cache.js` — collection `shopping-cache`
- Document schema: `{ _id (cacheKey), query: { raw, normalized, locale }, provider, fetchedAt, expiresAt (TTL), results[] }`
- Results stored as strings (price kept as `"$29.99"` to avoid type conversions)
- TTL index on `expiresAt` — MongoDB auto-deletes expired documents

**Taste Profile Pipeline:**
- `src/lib/openai.js` — OpenAI client singleton
- `src/lib/taste-profile.js` — `generateTasteProfile(description)` sends user input to LLM, returns structured JSON
- LLM extracts: recipient info, occasion, budget, interests, interestAliases (~10 shopping tokens per interest), aesthetic, personality, constraints, gifting context
- Uses low temperature (0.3) for consistent structured output

**Product Enrichment (Tavily):**
- `src/lib/enrich-serper.js` — `enrichProducts(products)` resolves merchant URLs and descriptions for pruned products
- Uses `src/lib/tavily.js` (SDK singleton) to run 1 Tavily search per product in parallel
- Search query: `"[product title] [source/retailer]"` with `maxResults: 1`
- From top result: extracts merchant URL (from `result.url`) and description (from `result.content`)
- Fallback: if Tavily returns no result or errors, keeps the Google Shopping link and sets description to null
- Cost: 5 Tavily API calls per user request (1 per pruned product)
- `src/lib/search-tavily.js` — generic Tavily query executor, retained but not directly used in current pipeline

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

### Animations
- `fade-up` — Entry animation for sections (opacity + translateY)
- `pulse-ring` — 1.8s pulsing ring for thinking indicator (replaced spinning sparkle)
- `spin-slow` — 3s rotation (retained for potential use)
- Staggered `animationDelay` on gift cards for sequential reveal
