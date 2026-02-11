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
│       ├── taste-profile.js    # generateTasteProfile() — LLM taste extraction
│       └── search-queries.js   # generateQueries() — Tavily search query generation
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
