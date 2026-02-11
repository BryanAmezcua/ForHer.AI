## Current state of development

### Current Focus
**Phase 1 — The Conversation:** Building the landing page and core interaction loop.

### What's Working
- Landing page renders with three-phase UI (input → thinking → results)
- Text area with rotating placeholder examples
- Soft prompt hints ("What does she light up about?", etc.)
- Submit sends POST to `/api/recommendations`
- Thinking state with spinner animation
- Results page displays gift cards in a 3-column grid (responsive)
- Product image component with loading/error fallback states
- Rich summary text with **bold** marker parsing
- Nav bar in results view with "New Search" back button
- "Start over" functionality resets state
- Custom color scheme applied via CSS variables
- Fade-up and staggered card animations

### What's NOT Working / Mocked
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- No input validation or contextual follow-up questions
- Mongoose is installed but no database models or connections exist
- Falls back to mock data when fewer than 1 complete candidate is found

### Known TODOs
1. Build or integrate a curated gift database (spec calls for 200–300 hand-picked products)
2. Return personalized reasoning per recommendation (currently uses product description)
3. Implement refinement loop (Phase 2)
4. Wire up "Adjust Preferences" button
5. Conversational follow-up for missing context (budget, timeline)

### Recent Changes
- Scaffolding commit set up the Next.js project with shadcn/ui, Tailwind v4, and the full landing page UI
- Original prototype exists as `gift-finder.jsx` (standalone React component with inline styles) — the `src/app/page.js` is the active, evolved version using Tailwind
- **Integrated OpenAI (gpt-4o-mini)** for taste profile generation from user descriptions
- Added `src/lib/openai.js` (client singleton) and `src/lib/taste-profile.js` (profile extraction)
- **Added search query generator** (`src/lib/search-queries.js`) — takes taste profile, generates 10 Tavily search queries with intent labels
- **Integrated Tavily SDK for search execution** — `src/lib/tavily.js` + `src/lib/search-tavily.js` (parallel query executor with dedup)
- **Added product extraction pipeline** — `src/lib/product-candidate.js` + `src/lib/extract-products.js` (scrapes product pages via Tavily extract API)
- **Added URL filter** — `src/lib/filter-urls.js` rejects non-product URLs before sending to Tavily extract
- **Added snippet-based page classifier** — `src/lib/classify-candidates.js` scores search result titles + content for product-page signals (buy-path, prices, reviews) vs. anti-signals (listicle titles, editorial bylines, numbered lists). Runs between URL filter and extract to reduce wasted API calls.
- **Added candidate deduplication** — `src/lib/dedupe-candidates.js` collapses duplicate products after extraction
- **Added confidence-weighted reranking** — `src/lib/rerank-candidates.js` scores each candidate against the taste profile across 6 dimensions
- **Wired real candidates into API response** — All complete candidates are mapped to card schema with match scores, matched attributes, and real product URLs. Falls back to mock data if insufficient candidates.
- **Added taste profile pills** — `ProfilePill.jsx` renders category-colored capsule pills on gift cards showing which taste profile attributes matched (interests=sage, aesthetic=clay, personality=taupe)
- **Extracted components from page.js** — `ProductImage.jsx`, `RichSummary.jsx`, `GiftCard.jsx`, `ProfilePill.jsx` are now separate files in `src/components/`. `page.js` imports them instead of defining inline.
- **Match attribute tracking in reranker** — `collectMatchedAttributes()` identifies which specific taste profile terms (interests, aesthetic, personality, budget, context) matched each candidate's text

### Active Decisions / Open Questions
- **AI service decided:** OpenAI gpt-4o-mini for taste profile extraction
- Gift database approach: curated static DB vs. live product API vs. hybrid
- Whether to use Mongoose/MongoDB for Phase 1 or defer all persistence to Phase 3
- Next step: use the taste profile to drive actual gift recommendations instead of mock data
