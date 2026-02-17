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
- Full product pipeline: taste profile → (optional clarification) → query generation → ScrapingDog Shopping search (cached) → dedup → prune (gift-set filter + rating/review scoring → top 16 pool) → enrich (ScrapingDog Immersive Product, batched 5 at a time) + pills (parallel) → PDP scoring → top 9 display
- ScrapingDog enrichment provides real merchant URLs via store selection (picks best store per product based on PDP score, stock status, ratings, shipping)
- Two-tier pill system on gift cards: LLM-generated gift-fit pills (interest, aesthetic, personality, context) + merchant badges (Free Shipping, Free Returns, X-Day Returns) extracted from store extensions
- Star ratings displayed on cards (amber star + rating number, no review counts — avoids mismatched Google aggregates)
- LLM pill prompt requires at least 1 pill per product (no more empty pill rows)

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop

### Known TODOs
1. Implement refinement loop (Phase 2)
2. Wire up "Adjust Preferences" button

### Recent Changes
- **Multi-image product gallery** — ProductImage now supports a swipeable/clickable gallery when `imageUrls` (from ScrapingDog `thumbnails[]`) has 2+ images. Dot indicators at bottom, chevron arrows on desktop hover, touch swipe on mobile. Preloads adjacent images. Degrades gracefully to single-image mode when only 1 image available. Data flows: `enrich-scrapingdog.js` passes `imageUrls: data.thumbnails || []`, route passes `imageUrls` only when 2+ images exist.
- **Star ratings on cards** — GiftCard now shows `★ 4.7` when rating data exists. Prefers merchant-level rating from Immersive Product, falls back to Google aggregate. Review counts removed entirely to avoid showing misleading Google aggregate counts that don't match what the user sees on the merchant page.
- **Two-tier pill system** — Gift cards now show two types of pills: (1) LLM-generated gift-fit pills explaining why the product matches the recipient, and (2) merchant badges extracted from store extensions (Free Shipping, Free Returns, X-Day Returns). Merchant pills use a muted sage-green style to visually distinguish from gift-fit pills. LLM prompt updated to require at least 1 pill per product.
- **ScrapingDog enrichment batching** — Immersive Product API calls batched 5 at a time (LITE plan concurrency limit) instead of all-at-once, preventing rate limit failures.
- **ScrapingDog migration** — Replaced Serper Shopping + Tavily enrichment with ScrapingDog Shopping API + Immersive Product API. New files: `search-scrapingdog.js`, `enrich-scrapingdog.js`. Deleted: `search-serper.js`, `enrich-serper.js`, `tavily.js`, `search-tavily.js`. Enrichment now uses store selection to pick best merchant per product (scoring on PDP signals, stock, ratings, shipping). Prune scoring enhanced with rating/reviews (confidence score replaces pure cluster size, new review volume component). Pool size 14→16. Cache schema updated with new fields (extractedPrice, rating, reviews, extensions, productId, immersiveUrl).
- **Previously:** "Whiskey Lounge" dark theme, clarification system, two-step submit flow, enrichment pool + PDP scoring, mobile-first clarifying UI, LLM pill generation

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** for ScrapingDog shopping cache; broader persistence deferred to Phase 3
- **ScrapingDog active** for product search (Shopping API) and enrichment (Immersive Product API for merchant URLs + descriptions + store data). LITE plan: 5 concurrent requests, ~2,000 requests/month.
- **Client-side patching** — Clarification answers are patched into the taste profile client-side (no re-run of LLM). May revisit for free-text answers later.
- **Next step:** Test end-to-end pipeline quality with ScrapingDog data, evaluate card UI polish
