## Current state of development

### Current Focus
**Phase 1 — The Conversation:** Building the landing page and core interaction loop.

### What's Working
- Landing page renders with five-phase UI (input → thinking → clarifying → populating → results)
- Text area with rotating placeholder examples
- Soft prompt hints ("What does she light up about?", etc.)
- Submit sends POST to `/api/taste-profile` first, then `/api/recommendations`
- Thinking state with multi-step progress indicator (3 pulsing rings that advance on timers)
- Clarification phase: LLM-generated follow-up question with 3 pill options (only when description is vague)
- Client-side taste profile patching from clarification answers
- Results page displays gift cards in responsive grid (1-col mobile, 2-col tablet, 3-col desktop)
- Top pick card visually ranked: enhanced copper border/glow with ring accent, same size as other cards (no col-span)
- Card hover state: subtle lift (-translate-y-1) + shadow increase
- Brand mark (copper 4-pointed sparkle) on input, thinking, and clarifying phases
- Warm radial copper glow behind input area
- Pipeline over-fetches 16 products (enrichment pool), then PDP confidence scoring filters non-product pages, slices to 9 for display
- Product image component with loading/error fallback states
- Rich summary text with **bold** marker parsing
- Nav bar in results view with "New Search" back button
- "Start over" functionality resets all state including clarification
- Custom color scheme applied via CSS variables
- Fade-up and staggered card animations
- PDP confidence scoring rejects category/editorial/collection pages after ScrapingDog enrichment
- Gift-set/bundle title filter rejects gift sets, gift boxes, sampler sets, etc. during pruning
- Full product pipeline: taste profile → (optional clarification) → query generation → ScrapingDog Shopping search (cached) → dedup → prune (gift-set filter + rating/review scoring → top 16 pool) → enrich (ScrapingDog Immersive Product) + pills (parallel) → PDP scoring → top 9 display
- ScrapingDog enrichment provides real merchant URLs via store selection (picks best store per product based on PDP score, stock status, ratings, shipping)

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- Frontend does not yet display brand, rating, or reviews fields from enrichment (data is available in API response)

### Known TODOs
1. Build UI for rating/reviews display on gift cards
2. Implement refinement loop (Phase 2)
3. Wire up "Adjust Preferences" button

### Recent Changes
- **ScrapingDog migration** — Replaced Serper Shopping + Tavily enrichment with ScrapingDog Shopping API + Immersive Product API. New files: `search-scrapingdog.js`, `enrich-scrapingdog.js`. Deleted: `search-serper.js`, `enrich-serper.js`, `tavily.js`, `search-tavily.js`. Enrichment now uses store selection to pick best merchant per product (scoring on PDP signals, stock, ratings, shipping). Prune scoring enhanced with rating/reviews (confidence score replaces pure cluster size, new review volume component). Pool size 14→16. Cache schema updated with new fields (extractedPrice, rating, reviews, extensions, productId, immersiveUrl). Recommendation response now includes brand, rating, reviews fields.
- **"Whiskey Lounge" dark theme overhaul** — Replaced light cream/sage/taupe palette with dark warm palette. New tokens: copper (#c8956c), warm-gray (#8a8380), warm-gray-light (#a09890), surface (#252220). Permanently dark (no light mode). All CSS variables, hardcoded colors in page.js, GiftCard, GiftCardSkeleton, ProfilePill, ProductImage, and recommendations route updated. Hearts removed, spinning sparkle replaced with pulsing ring.
- **Clarification system** — Taste profile prompt now returns an optional `clarification` field with a high-ROI follow-up question + 3 options (each with label + patch object). Only triggered when description is missing high-impact context (budget, interests, occasion).
- **New `/api/taste-profile` endpoint** — Separates taste profile generation from the full recommendation pipeline
- **Two-step submit flow** — Client calls `/api/taste-profile` first; if clarification needed, shows question + animated pills; user's selection patches the taste profile client-side; then calls `/api/recommendations` with the pre-built profile
- **`/api/recommendations` accepts pre-built taste profile** — Skips `generateTasteProfile()` when `tasteProfile` is provided in request body
- **Enrichment pool + PDP scoring** — `ENRICH_POOL_SIZE = 16` in prune-serper.js (over-fetch for enrichment buffer); PDP confidence scoring in score-pdp.js filters non-product pages; `DISPLAY_COUNT = 9` final results; gift-set title rejection added to pruner
- **Mobile-first clarifying UI** — Pills stack vertically on mobile (`flex-col`), horizontal on `sm:` breakpoint; comfortable touch targets (`py-3`); responsive padding throughout
- **Pill generation refactored** — Replaced token-matching pill system with LLM-generated pills. One call per request, runs in parallel with ScrapingDog enrichment. Produces 1-2 pills per product with categories (interest, aesthetic, personality, context) for ProfilePill color mapping. Pruner simplified: `_matchMeta` removed, `aestheticOverlap` removed, `interestOverlap` returns count only (aliases still used for scoring).

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** for ScrapingDog shopping cache; broader persistence deferred to Phase 3
- **ScrapingDog active** for product search (Shopping API) and enrichment (Immersive Product API for merchant URLs + descriptions + store data)
- **Client-side patching** — Clarification answers are patched into the taste profile client-side (no re-run of LLM). May revisit for free-text answers later.
- **Next step:** Build UI for ratings/reviews, test end-to-end pipeline quality with ScrapingDog data
