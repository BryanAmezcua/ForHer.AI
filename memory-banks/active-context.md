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
- Serper Shopping pipeline: query generation → search (cached) → dedup → prune to top 10

### What's NOT Working / Mocked
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- No input validation or contextual follow-up questions
- Pipeline returns mock recommendations — enrichment step not yet built
- Serper results are fetched, cached, deduplicated, and pruned but not yet converted into ranked recommendations

### Known TODOs
1. Build enrichment step to process pruned Serper products into real recommendations
2. Return personalized reasoning per recommendation
3. Implement refinement loop (Phase 2)
4. Wire up "Adjust Preferences" button
5. Conversational follow-up for missing context (budget, timeline)

### Recent Changes
- **Deleted old Tavily pipeline** — Removed `standard-pipeline.js`, `search-queries.js`, `filter-urls.js`, `classify-candidates.js`, `extract-products.js`, `dedupe-candidates.js`, `rerank-candidates.js`, `product-candidate.js`
- **Retained Tavily singleton files** — `tavily.js` (SDK init) and `search-tavily.js` (query executor) kept for planned enrichment step
- **Removed Deep Research toggle** — Serper Shopping is now the only data fetching strategy (no toggle, no branching)
- **Simplified route.js** — single linear pipeline: taste profile → deep queries → Serper search → dedup → prune → (enrichment TBD) → mock data
- **Simplified page.js** — removed `deepResearch` state, toggle UI, and flag from API request
- **Previously built:** Serper Shopping API integration with MongoDB caching (48h TTL), Jaccard-based deduplication with cluster size tracking, weighted pruning to top 10

### Active Decisions / Open Questions
- **AI service decided:** OpenAI gpt-4o-mini for taste profile extraction
- **MongoDB in use** for Serper shopping cache; broader persistence deferred to Phase 3
- **Tavily retained** for enrichment — will be used to scrape product pages from Serper results
- **Next step:** Build enrichment step to convert pruned Serper products into ranked recommendations (replace mock data)
