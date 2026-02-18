## Current state of development

### Current Focus
**Phase 1 — Deployed.** App is live at gifther.ai. Next focus: Amazon product integration and affiliate revenue setup.

### What's Working
- Landing page renders with five-phase UI (input → thinking → clarifying → populating → results)
- Text area with rotating placeholder examples
- Soft prompt hints ("What does she light up about?", etc.)
- Submit sends POST to `/api/taste-profile` first, then `/api/recommendations`
- Thinking state with multi-step progress indicator (stops cycling after "Almost there...")
- Clarification phase: LLM-generated follow-up question with 3 pill options (only when description is vague)
- Client-side taste profile patching from clarification answers
- Results page displays gift cards in responsive grid (1-col mobile, 2-col tablet, 3-col desktop)
- Top pick card visually ranked: enhanced copper border/glow with ring accent
- Card hover state: subtle lift (-translate-y-1) + shadow increase
- Brand mark (copper 4-pointed sparkle) on input, thinking, and clarifying phases
- Warm radial copper glow behind input area
- Pipeline over-fetches 16 products (enrichment pool), then PDP confidence scoring filters non-product pages, slices to 9 for display
- Product image component with loading/error fallback states and multi-image gallery
- Rich summary text with **bold** marker parsing
- Nav bar in results view with "New Search" back button
- "Start over" functionality resets all state including clarification
- Custom "Whiskey Lounge" color scheme applied via CSS variables
- Fade-up and staggered card animations
- PDP confidence scoring rejects category/editorial/collection pages after ScrapingDog enrichment
- Gift-set/bundle title filter rejects gift sets, gift boxes, sampler sets, etc. during pruning
- Full product pipeline: taste profile + query generation (single LLM call) → ScrapingDog Shopping search (cached) → dedup → prune → enrich (ScrapingDog Immersive Product, batched 5) + pills + reaction lines (parallel) → PDP scoring → top 9 display
- ScrapingDog enrichment provides real merchant URLs via store selection
- Two-tier pill system: LLM gift-fit pills + merchant badges (Free Shipping, Free Returns, X-Day Returns)
- Star ratings displayed on cards (prefers merchant rating, falls back to Google aggregate)
- MatchRing component: animated copper ring for products with matchScore >= 85
- Badge system: confidence (sparkle), social (heart), occasion (gift) icons with colored labels
- Reaction lines: LLM-generated predicted recipient reactions displayed as italic quotes
- Mobile responsive layout
- Deployed to Vercel with auto-deploy on push to master
- DNS configured via Cloudflare → Vercel

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- No affiliate links (Amazon Associates not yet set up)
- Error handling is basic (resets to input on failure)

### Known TODOs
1. Sign up for Amazon Associates (requires live URL — now available)
2. Integrate ScrapingDog Amazon Search API as second product source
3. Append affiliate tags to Amazon product URLs
4. Implement refinement loop (Phase 2)
5. Wire up "Adjust Preferences" button

### Recent Changes
- **Deployed to production** — App live at gifther.ai via Vercel, DNS via Cloudflare
- **Full pipeline enabled** — CACHE_ONLY set to false, ScrapingDog Shopping + Immersive Product APIs active
- **Query generation merged into taste profile** — Single LLM call generates both taste profile and search queries (was two separate calls)
- **Mobile responsiveness** — Layout, cards, and interactions tested for mobile
- **Loading UX** — Populating messages stop cycling after "Almost there..."
- **MatchRing + badges + reaction lines** — Backend computes matchScore (from prune scoring), badgeLabel/badgeType (rule-based), reactionLine (LLM-generated). Frontend renders them.
- **Pipeline refactor** — Route logic extracted to `pipeline.js`. Files renamed: `dedupe-serper.js` → `dedupe-products.js`, `prune-serper.js` → `prune-products.js`. New utilities: `debug.js`, `parse-price.js`, `strip-markdown.js`.
- **API contract** — `memory-banks/api-contract.md` defines shared frontend/backend interface. All initial pending items completed.

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** for ScrapingDog shopping cache; broader persistence deferred to Phase 3
- **ScrapingDog active** for product search (Shopping API) and enrichment (Immersive Product API). LITE plan: 5 concurrent requests, ~2,000 requests/month.
- **Deployment:** Vercel Pro ($20/mo) + Cloudflare DNS + gifther.ai domain
- **Amazon integration planned** — ScrapingDog Amazon Search API (1 credit/search) as second product source. Rich data: Prime status, Best Seller, Amazon's Choice, social proof, review counts. No enrichment needed (saves ~5 credits/product). Affiliate links via ASIN: `amazon.com/dp/{ASIN}?tag=yourTag`
- **Amazon Associates** — Requires 3 qualifying sales in 180 days to activate API access. PA-API 5.0 deprecated April 2026; new projects should use Creators API.
- **Next step:** Sign up for Amazon Associates, begin Amazon product integration
