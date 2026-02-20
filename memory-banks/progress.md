## Project status and tracking

### Overall Status: Phase 1 — Complete (Deployed)

### Deployment
- **Live at:** https://gifther.ai
- **Hosting:** Vercel (Pro plan, $20/mo)
- **Domain:** gifther.ai (registered via Cloudflare, DNS pointed to Vercel)
- **Auto-deploy:** Pushes to `master` on GitHub trigger automatic Vercel deploys

### Phase 1 Checklist

#### Landing Page UI
- [x] Clean, calming single-page layout
- [x] Headline that communicates warmth and confidence
- [x] Large text input: "Tell us about her..."
- [x] Helper text with example prompts (rotating placeholders)
- [x] Soft prompt hints displayed below textarea
- [x] Submit button with disabled state
- [x] Reassurance text ("No sign-up. No spam. Just a good gift.")
- [x] Thinking/loading state with animated spinner
- [x] Results display: gift cards with name, why it fits, price
- [x] Results nav bar with back navigation
- [x] Product image component with fallback handling
- [x] Rich summary with bold text parsing
- [x] Staggered fade-up animations on cards
- [x] Custom brand color scheme applied
- [x] Mobile responsiveness
- [x] MatchRing component (animated copper ring for high-confidence matches)
- [x] Badge system (confidence/social/occasion icons replacing generic tags)
- [x] Reaction line (LLM-generated predicted recipient reactions)
- [x] GiftCardSkeleton loading state

#### Backend
- [x] Two API endpoints: POST `/api/taste-profile` + POST `/api/recommendations`
- [x] AI processes free-text input to extract profile attributes (taste profile via OpenAI)
- [x] ScrapingDog Shopping API integration (3 broad queries, ~40+ results each)
- [x] MongoDB caching for shopping results (48h TTL, stopword+stemming normalization)
- [x] Shopping deduplication (Jaccard similarity + price clustering, cluster size tracking)
- [x] Shopping pruning (weighted scoring on 6 dimensions incl. rating/reviews, top 16 cutoff)
- [x] Real product data wired into recommendations
- [x] Two-tier pill system: LLM gift-fit pills + merchant badges
- [x] Star ratings on gift cards
- [x] Multi-image product gallery
- [x] Pipeline refactored into `pipeline.js` (extracted from route.js)
- [x] File renames: `dedupe-serper.js` → `dedupe-products.js`, `prune-serper.js` → `prune-products.js`
- [x] New utilities: `debug.js`, `parse-price.js`, `strip-markdown.js`
- [x] matchScore, badgeLabel, badgeType, reactionLine computed by backend
- [x] Query generation merged into taste profile LLM call
- [x] Full pipeline enabled (CACHE_ONLY = false)

#### Polish & UX
- [x] Mobile responsive testing
- [x] Loading UX improvements (populating messages stop cycling after "Almost there...")
- [ ] Error handling for API failures (basic — resets to input)
- [ ] Input validation / minimum length guidance

### Phase 1.5 — Amazon Integration (Complete)
- [x] Amazon product integration via ScrapingDog Amazon Search API
- [x] Amazon Associates affiliate link tagging (`?tag=giftherai-20`)
- [x] Title cleaning utility (`clean-title.js`)
- [x] Favicon, apple-touch-icon, and OG image
- [ ] Verify Amazon-only pipeline live in production
- [ ] Monitor credit savings (~50 credits/request)
- [ ] Affiliate revenue tracking

### Phase 1.6 — Amazon-Only Migration (Complete)
- [x] Migrated from dual-source (2 Amazon + 1 Google Shopping) to Amazon-only (5 Amazon queries)
- [x] Removed Google Shopping search (`search-scrapingdog.js`)
- [x] Removed Immersive Product enrichment (`enrich-scrapingdog.js`)
- [x] Removed PDP confidence scoring (`score-pdp.js`)
- [x] Removed unused `search-queries-deep.js`
- [x] Added `whySheLikesIt` LLM field (personalized product descriptions)
- [x] Added `getAllCachedResults()` to `search-amazon.js`
- [x] Reduced cache TTL from 48h to 24h
- [x] Removed Amazon pill from frontend (all products are Amazon now)
- [x] CTA changed to "View on Amazon"
- [x] Updated memory-bank files
- [ ] Verify in production

### Session Persistence & Shareable URLs (Complete)
- [x] Session Mongoose model (`src/lib/models/session.js`) with 7-day TTL
- [x] Session saving in recommendations route (fire-and-forget)
- [x] `sessionId` returned in API response
- [x] `SessionResults` component extracted from `page.js`
- [x] Share button in nav bar (copies URL to clipboard with "Copied!" feedback)
- [x] URL updates to `/s/[id]` via `history.replaceState` after results load
- [x] Shared session route (`/s/[id]`) — server component with dynamic OG tags
- [x] Custom 404 for expired/invalid sessions
- [x] "New Search" resets URL back to `/`
- [ ] Verify live in production

### Instant Budget Detection & LLM Simplification (Complete)
- [x] Client-side budget regex (`hasBudgetMention()`) in `page.js`
- [x] Static `BUDGET_CLARIFICATION` object (instant budget pills, no LLM round-trip)
- [x] Parallel prefetch: taste profile API runs in background while user picks budget (`profilePromiseRef`)
- [x] Removed `clarification` field and all clarification rules from LLM prompt
- [x] LLM always generates 3 `searchQueries` (no conditional, eliminates `generateDeepQueries` fallback)
- [x] Renamed `generateTasteProfile` → `generateProfileAndQueries`
- [x] Bumped `max_tokens` 1700 → 1900
- [x] Updated imports in `route.js` and `pipeline.js`
- [x] Removed `clarification: undefined` stripping from `resolveTasteProfile()`

### Phase 2 — Not Started
- [ ] Reject a pick and say why
- [ ] System returns alternatives informed by rejection
- [ ] Follow-up questions for missing context
- [ ] Conversational back-and-forth without leaving the page
- [ ] Wire up "Adjust Preferences" button

### Phase 3 — Not Started
- [ ] User accounts (email or Google auth)
- [ ] Save recipient as named profile
- [ ] Profile accumulates past gifts, preferences, rejection reasons
- [ ] Agent loads full recipient context on return
- [ ] Gift history prevents repeats

### Phase 4 — Not Started
- [ ] Occasion reminders
- [ ] Trending gift integration
- [ ] Expanded product database
- [ ] Affiliate monetization
- [ ] Seasonal curation
