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
│       ├── tavily.js           # Tavily client singleton (retained for future enrichment)
│       ├── search-tavily.js    # executeQueries() — Tavily search executor (retained for future enrichment)
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction
│       ├── search-queries-deep.js # generateDeepQueries() — 3 broad Google queries
│       ├── search-serper.js    # executeSerperQueries() — Serper Shopping API + MongoDB cache
│       ├── dedupe-serper.js    # dedupeSerperResults() — Jaccard + price clustering for shopping results
│       ├── prune-serper.js     # pruneSerperResults() — Score + cut to top 10 products
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
- Client POSTs `{ description }` to `/api/recommendations`
- Server returns `{ recommendations: [...], meta: { curatedFor, summary }, tasteProfile: {...} }`
- Taste profile is generated via OpenAI (gpt-4o-mini) from the free-text description

**Product Discovery Pipeline (Serper Shopping):**
- Single pipeline, no toggle — Serper Shopping is the only data fetching strategy
- Flow: taste profile → `generateDeepQueries()` → `executeSerperQueries()` → `dedupeSerperResults()` → `pruneSerperResults()` → (enrichment TBD)
- Generates 3 broad, natural Google-style queries via OpenAI gpt-4o-mini
- Executes queries against Serper.dev Shopping API (10 results per query)
- Results cached in MongoDB with 48-hour TTL
- Cache key: `sha256("serper|US|" + normalizedQuery)` — queries normalized (stopword removal + basic stemming + sorted)
- Currently returns mock data while enrichment step is built

**Serper Shopping Deduplication:**
- `src/lib/dedupe-serper.js` — `dedupeSerperResults(serperResults)` collapses duplicate products across all queries
- Title normalization: lowercase, strip `®™©`, remove trailing store-name suffixes, drop junk words (retailer names, "free shipping", "sale", etc.), standardize synonyms (`qt`→`quart`, `oz`→`ounce`, etc.)
- Clustering: Jaccard similarity (>= 0.55) on normalized word tokens + price proximity (within 30%)
- Winner selection: prefer listings with image, then lowest price
- Attaches `clusterSize` to each winner for downstream scoring
- Runs after `executeSerperQueries()`, before pruning

**Serper Shopping Pruning:**
- `src/lib/prune-serper.js` — `pruneSerperResults(products, tasteProfile)` scores and cuts to top 10
- Hard filter: drop items with no image
- Weighted scoring: interest relevance (35%), budget fit (25%), cluster size (20%), price sanity (10%), data completeness (10%)
- Budget fit: 1.0 if within range, 0.5 if within 20% grace zone, 0 if way outside
- Cluster size: 3+ = 1.0, 2 = 0.5, 1 = 0.2
- Interest relevance: token overlap between product title and taste profile interests array
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
- LLM extracts: recipient info, occasion, budget, interests, aesthetic, personality, constraints, gifting context
- Uses low temperature (0.3) for consistent structured output

**Tavily (Retained for Enrichment):**
- `src/lib/tavily.js` — Tavily client singleton, uses `TAVILY_API_KEY` env var
- `src/lib/search-tavily.js` — `executeQueries(giftQueries)` runs queries in parallel via `Promise.all`
- Not currently called in the pipeline — kept for planned enrichment step

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
