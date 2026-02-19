## Current state of development

### Current Focus
**Instant budget detection + LLM clarification removal.** Budget is now detected client-side via regex before any API call. If missing, budget pills appear instantly while the taste profile LLM call runs in the background. The LLM no longer returns a `clarification` field — it always generates a complete profile + 3 search queries in a single call, eliminating the separate `generateDeepQueries` fallback.

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
- Pipeline over-fetches 16 products (enrichment pool), then PDP confidence scoring filters non-product pages, slices to 9 for display
- Product image component with loading/error fallback states and multi-image gallery
- Rich summary text with **bold** marker parsing
- Nav bar in results view with "New Search" back button and "Share" button (copies URL to clipboard)
- Session persistence: results saved to MongoDB with 7-day TTL, shareable via `/s/[id]` URLs
- Shared session view: server component with dynamic OG tags, custom 404 for expired/invalid sessions
- URL updates to `/s/[id]` after results load via `history.replaceState`
- "Start over" functionality resets all state including clarification
- Custom "Whiskey Lounge" color scheme applied via CSS variables
- Fade-up and staggered card animations
- PDP confidence scoring rejects category/editorial/collection pages after ScrapingDog enrichment
- Gift-set/bundle title filter rejects gift sets, gift boxes, sampler sets, etc. during pruning
- **Dual-source product pipeline:** taste profile + query generation (single LLM call, always generates 3 queries) → 2 Amazon queries + 1 Google Shopping query (parallel) → dedup → prune → enrich (only Google products via Immersive Product, Amazon skips) + pills + reaction lines (parallel) → PDP scoring → top 9 display
- ScrapingDog enrichment provides real merchant URLs via store selection (Google products only)
- Amazon products pass through enrichment fallback preserving rich search data (ratings, reviews, extensions, merchantName = "Amazon")
- Two-tier pill system: LLM gift-fit pills + merchant badges (Free Shipping, Free Returns, X-Day Returns, Prime, Best Seller, Amazon's Choice)
- Amazon badge: orange pill (`#FF9900`) on Amazon-sourced products for credibility
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
- Amazon integration not yet tested live (needs push to deploy)

### Known TODOs
1. Push to master and verify Amazon integration works in production
2. Monitor credit usage to confirm ~36% savings
3. Verify Amazon affiliate tag appears in product URLs
4. Implement refinement loop (Phase 2)
5. Wire up "Adjust Preferences" button

### Recent Changes
- **Instant budget detection + LLM clarification removal** — Budget detected client-side via regex (`hasBudgetMention()`). Missing budget → budget pills appear instantly, taste profile API runs in background (`profilePromiseRef`). LLM prompt no longer has `clarification` field or clarification rules — always generates complete profile + 3 `searchQueries`. `generateTasteProfile` renamed to `generateProfileAndQueries`. `max_tokens` bumped 1700 → 1900. Eliminates `generateDeepQueries` fallback (queries always present).
- **Session persistence & shareable URLs** — Recommendation sessions saved to MongoDB `sessions` collection (7-day TTL). 10-char hex session IDs. Fire-and-forget save after pipeline. `SessionResults` component extracted from `page.js`. Share button in nav bar copies `/s/[id]` URL. Server component at `/s/[id]` with dynamic OG tags. Custom 404 for expired/invalid sessions.
- **Amazon product integration** — ScrapingDog Amazon Search API as second product source. Query split: 2 Amazon + 1 Google Shopping (was 3 Google). Amazon products carry rich data (Prime, Best Seller, Amazon's Choice, social proof, reviews). Affiliate tag `giftherai-20` appended to all Amazon URLs. Sponsored results filtered out.

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** — cluster `cached-data`, database `GiftHer`, collection `products` for shopping cache (both Google and Amazon results); broader persistence deferred to Phase 3
- **ScrapingDog active** for Google Shopping search, Amazon search, and Immersive Product enrichment (Google products only). LITE plan: 5 concurrent requests, ~2,857 uncached requests/month (up from ~1,818).
- **Deployment:** Vercel Pro ($20/mo) + Cloudflare DNS + gifther.ai domain
- **Amazon Associates** — Associate Store ID: `giftherai-20`. Requires 3 qualifying sales in 180 days. PA-API 5.0 deprecated April 2026; Creators API for future use.
- **Next step:** Push to deploy, verify live, monitor credit usage
