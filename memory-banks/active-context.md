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
- Top pick card visually ranked: copper border/glow, "TOP PICK" tag, spans 2 columns on sm+
- Card hover state: subtle lift (-translate-y-1) + shadow increase
- Brand mark (copper 4-pointed sparkle) on input, thinking, and clarifying phases
- Warm radial copper glow behind input area
- Pipeline now prunes to top 5 products (down from 10) — halves Tavily enrichment cost
- Product image component with loading/error fallback states
- Rich summary text with **bold** marker parsing
- Nav bar in results view with "New Search" back button
- "Start over" functionality resets all state including clarification
- Custom color scheme applied via CSS variables
- Fade-up and staggered card animations
- Full product pipeline: taste profile → (optional clarification) → query generation → Serper search (cached) → dedup → prune → enrich (Tavily) → real recommendations

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- Description quality from Tavily snippets may vary — might need LLM-generated "why this fits" later

### Known TODOs
1. Evaluate Tavily snippet quality — potentially replace with LLM-generated "why this fits" descriptions
2. Implement refinement loop (Phase 2)
3. Wire up "Adjust Preferences" button

### Recent Changes
- **"Whiskey Lounge" dark theme overhaul** — Replaced light cream/sage/taupe palette with dark warm palette. New tokens: copper (#c8956c), warm-gray (#8a8380), warm-gray-light (#a09890), surface (#252220). Permanently dark (no light mode). All CSS variables, hardcoded colors in page.js, GiftCard, GiftCardSkeleton, ProfilePill, ProductImage, and recommendations route updated. Hearts removed, spinning sparkle replaced with pulsing ring.
- **Clarification system** — Taste profile prompt now returns an optional `clarification` field with a high-ROI follow-up question + 3 options (each with label + patch object). Only triggered when description is missing high-impact context (budget, interests, occasion).
- **New `/api/taste-profile` endpoint** — Separates taste profile generation from the full recommendation pipeline
- **Two-step submit flow** — Client calls `/api/taste-profile` first; if clarification needed, shows question + animated pills; user's selection patches the taste profile client-side; then calls `/api/recommendations` with the pre-built profile
- **`/api/recommendations` accepts pre-built taste profile** — Skips `generateTasteProfile()` when `tasteProfile` is provided in request body
- **Reduced to 5 results** — `MAX_RESULTS` in prune-serper.js changed from 10 to 5; skeleton count updated to match
- **Mobile-first clarifying UI** — Pills stack vertically on mobile (`flex-col`), horizontal on `sm:` breakpoint; comfortable touch targets (`py-3`); responsive padding throughout
- **Pill generation refactored** — Replaced token-matching pill system with LLM-generated pills. One call per request, runs in parallel with Tavily enrichment. Produces 1-2 pills per product with categories (interest, aesthetic, personality, context) for ProfilePill color mapping. Pruner simplified: `_matchMeta` removed, `aestheticOverlap` removed, `interestOverlap` returns count only (aliases still used for scoring).
- **Previously:** Built enrichment step, replaced mock data, built Serper Shopping pipeline with caching/dedup/pruning

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** for Serper shopping cache; broader persistence deferred to Phase 3
- **Tavily now active** for enrichment (merchant URL resolution + descriptions, 5 calls per request now)
- **Description quality TBD** — Tavily snippets may need to be replaced with LLM-generated "why this fits" descriptions
- **Client-side patching** — Clarification answers are patched into the taste profile client-side (no re-run of LLM). May revisit for free-text answers later.
- **Next step:** Test end-to-end pipeline with clarification flow, evaluate recommendation quality
