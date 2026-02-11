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
│   │   └── ui/
│   │       ├── button.jsx      # shadcn Button component
│   │       └── textarea.jsx    # shadcn Textarea component
│   └── lib/
│       └── utils.js            # cn() utility (clsx + tailwind-merge)
│   └── lib/
│       ├── utils.js            # cn() utility (clsx + tailwind-merge)
│       ├── openai.js           # OpenAI client singleton
│       ├── tavily.js           # Tavily client singleton
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction
│       ├── search-queries.js   # generateQueries() — Tavily search query generation
│       ├── search-tavily.js    # executeQueries() — Runs queries against Tavily API
│       ├── product-candidate.js # ProductCandidate class — normalized product data
│       ├── filter-urls.js       # filterProductUrls() — Rejects non-product URLs before extraction
│       └── extract-products.js  # extractProducts() — Scrapes URLs via Tavily extract
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
- Recommendations are still mock data (TODO: use tasteProfile to drive real recommendations)

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
- Runs synchronously between `executeQueries()` and `extractProducts()` to save Tavily extract tokens

**Product Extraction Pipeline:**
- `src/lib/product-candidate.js` — `ProductCandidate` class, normalized data container for scraped products
- `src/lib/extract-products.js` — `extractProducts(searchResults)` takes Tavily search results, scrapes each URL via `tvly.extract()`, merges data into `ProductCandidate[]`
- Batches URLs (10 per batch), extracts in parallel, gracefully degrades on failure (creates candidate from search data alone)
- Helpers: price regex extraction (contextual → decimal → whole dollar), image filtering (no logos/icons/svg/gif), domain extraction

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
- Custom inline components for domain-specific UI (ProductImage, RichSummary)
- Tailwind utility classes for all styling — no separate CSS modules

**Recommendation Card Schema:**
Each recommendation object contains:
```js
{
  name: string,       // Product name
  price: string,      // Display price
  why: string,        // Personalized reasoning
  tag: string,        // Category label (e.g., "NEW MATCH", "TIMELESS CHOICE")
  ctaText: string,    // Button text (e.g., "Explore Collection")
  ctaColor: string,   // Hex color for CTA button
  giftReady: boolean, // Whether it arrives gift-wrapped
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

### Animations
- `fade-up` — Entry animation for sections (opacity + translateY)
- `spin-slow` — 3s rotation for thinking indicator
- Staggered `animationDelay` on gift cards for sequential reveal
