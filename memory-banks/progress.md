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
- [x] ScrapingDog Immersive Product enrichment (merchant URLs + descriptions + store selection, batched 5 at a time)
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

### Phase 1.5 — Planned (Pre-Phase 2)
- [ ] Amazon product integration via ScrapingDog Amazon Search API
- [ ] Amazon Associates signup + affiliate link tagging
- [ ] Affiliate revenue tracking

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
