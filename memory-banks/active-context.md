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
- Full product pipeline: query generation → Serper search (cached) → dedup → prune → enrich (Tavily) → real recommendations

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- No input validation or contextual follow-up questions
- Description quality from Tavily snippets may vary — might need LLM-generated "why this fits" later
- No personalized reasoning per recommendation yet (uses raw Tavily snippet as description)

### Known TODOs
1. Evaluate Tavily snippet quality — potentially replace with LLM-generated "why this fits" descriptions
2. Return personalized reasoning per recommendation
3. Implement refinement loop (Phase 2)
4. Wire up "Adjust Preferences" button
5. Conversational follow-up for missing context (budget, timeline)

### Recent Changes
- **Built enrichment step** — `src/lib/enrich-serper.js` uses Tavily search (1 call per product, 10 total) to resolve merchant URLs and extract descriptions
  - Searches `"[title] [source]"` with `maxResults: 1`, extracts URL + content snippet
  - Falls back to Google Shopping link if Tavily returns no result
- **Replaced mock data with real recommendations** — route.js now builds recommendations from enriched products (name, price, imageUrl from Serper; url from merchant; description from Tavily snippet)
- **Previously:** Deleted old Tavily pipeline, removed Deep Research toggle, built Serper Shopping pipeline with caching/dedup/pruning

### Active Decisions / Open Questions
- **AI service decided:** OpenAI gpt-4o-mini for taste profile extraction
- **MongoDB in use** for Serper shopping cache; broader persistence deferred to Phase 3
- **Tavily now active** for enrichment (merchant URL resolution + descriptions)
- **Description quality TBD** — Tavily snippets may need to be replaced with LLM-generated "why this fits" descriptions
- **Next step:** Test end-to-end pipeline with real data, evaluate recommendation quality
