## Current state of development

### Current Focus
**Gift recommendation quality overhaul complete.** Major changes: (1) Query generation rewired — "gift" keyword banned from all search queries, now uses product-category approach (4 direct + 1 adjacent/surprise queries), (2) New LLM reranker step between prune and row assignment — brand-first quality ranking surfaces recognizable brands over junk, (3) Pruning simplified to coarse pre-filter (min price raised to $20, gift-set ban removed, 6-factor scoring removed), (4) Rows sorted by match score instead of price, (5) Trending queries reduced to 1 backup. Net result: same API cost, dramatically better quality products.

### What's Working
- Landing page renders with five-phase UI (input → thinking → clarifying → populating → results)
- Text area with rotating placeholder examples
- Soft prompt hints ("What does she light up about?", etc.)
- Submit sends POST to `/api/taste-profile` first, then `/api/recommendations`
- Thinking state with multi-step progress indicator (stops cycling after "Almost there...")
- Clarification phase: instant budget question with 3 pill options (client-side regex detection, no LLM involvement)
- Client-side taste profile patching from clarification answers
- Budget prefetch: taste profile API call runs in background while user picks budget
- Results page displays gift cards in responsive grid (1-col mobile, 2-col tablet, 3-col desktop)
- Top pick card visually ranked: enhanced copper border/glow with ring accent
- Card hover state: subtle lift (-translate-y-1) + shadow increase
- Brand mark (copper 4-pointed sparkle) on input, thinking, and clarifying phases
- Warm radial copper glow behind input area
- Pipeline: coarse prune (~30) → LLM reranker (top 12) → row assignment (3x3) → generate insights (pills + reaction lines + whySheLikesIt)
- Product image component with loading/error fallback states and multi-image gallery
- Rich summary text with **bold** marker parsing
- Nav bar in results view with "New Search" back button and "Share" button (copies URL to clipboard)
- Session persistence: results saved to MongoDB with 7-day TTL, shareable via `/s/[id]` URLs
- Shared session view: server component with dynamic OG tags, custom 404 for expired/invalid sessions
- URL updates to `/s/[id]` after results load via `history.replaceState`
- "Start over" functionality resets all state including clarification
- Custom "Whiskey Lounge" color scheme applied via CSS variables
- Fade-up and staggered card animations
- **Amazon-only product pipeline:** taste profile + query generation (single LLM call, 5 product-category queries, "gift" banned) → 5-6 Amazon queries → dedup → coarse prune (~30) → LLM rerank (brand-first, top 12) → row assignment (3x3) → generate insights → display
- Two-tier pill system: LLM gift-fit pills + merchant badges (Free Shipping, Free Returns, X-Day Returns, Prime, Best Seller, Amazon's Choice)
- "Why she'll like it" descriptions: LLM-generated personalized 1-2 sentence descriptions connecting product to recipient
- Social proof display: Amazon "50+ bought in past month" text rendered on cards
- Affiliate links: Amazon product URLs contain `?tag=giftherai-20`
- Title cleaning: `cleanTitle()` strips ALL-CAPS brand prefixes, trailing recipients/sizes/brand suffixes, truncates to ~60 chars
- Star ratings displayed on cards (prefers merchant rating, falls back to Google/Amazon aggregate)
- MatchRing component: animated copper ring for products with matchScore >= 85
- Badge system: confidence (sparkle), social (heart), occasion (gift) icons with colored labels
- Reaction lines: LLM-generated predicted recipient reactions displayed as italic quotes
- Favicon, apple-touch-icon, and OG image for link previews
- Mobile responsive layout
- Deployed to Vercel with auto-deploy on push to master
- DNS configured via Cloudflare → Vercel

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- Error handling is basic (resets to input on failure)

### Known TODOs
1. Push to master and verify recommendation quality overhaul in production
2. Confirm no queries contain "gift" in debug logs
3. Confirm quality products (known brands, no slogan socks/novelty junk)
4. Monitor credit usage — same ~50 Amazon credits + ~$0.001 reranker per request
5. Implement refinement loop (Phase 2)
6. Wire up "Adjust Preferences" button

### Recent Changes
- **Gift recommendation quality overhaul** — Rewrote query generation to ban "gift" keyword and use product-category approach (4 direct + 1 adjacent/surprise queries). Added LLM reranker (`rerank-products.js`) with brand-first quality ranking. Simplified pruning to coarse pre-filter (raised min price $5→$20, removed gift set ban, removed 6-factor scoring). Rows sorted by matchScore instead of price. Trending queries reduced to 1 backup with better text. Reranker reasons passed to insight generation for more specific descriptions.
- **Amazon-only migration** — Removed Google Shopping (search-scrapingdog.js), Immersive Product enrichment (enrich-scrapingdog.js), PDP scoring (score-pdp.js), and unused search-queries-deep.js. All 5 queries now go to Amazon Search API. Added `whySheLikesIt` LLM field (personalized descriptions). Removed Amazon pill from frontend. CTA changed to "View on Amazon". Cache TTL reduced from 48h to 24h. Credit usage cut from ~70 to ~50 per request.
- **Session persistence & shareable URLs** — Recommendation sessions saved to MongoDB `sessions` collection (7-day TTL). 10-char hex session IDs. Fire-and-forget save after pipeline. `SessionResults` component extracted from `page.js`. Share button in nav bar copies `/s/[id]` URL. Server component at `/s/[id]` with dynamic OG tags. Custom 404 for expired/invalid sessions.

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** — cluster `cached-data`, database `GiftHer`, collection `products` for shopping cache (Amazon results only, 24h TTL); broader persistence deferred to Phase 3
- **ScrapingDog active** for Amazon Search API only. LITE plan: ~50 credits per uncached request, ~4,000 uncached requests/month.
- **Deployment:** Vercel Pro ($20/mo) + Cloudflare DNS + gifther.ai domain
- **Amazon Associates** — Associate Store ID: `giftherai-20`. Requires 3 qualifying sales in 180 days. PA-API 5.0 deprecated April 2026; Creators API for future use.
- **Next step:** Push to deploy, verify Amazon-only pipeline live, monitor credit usage
