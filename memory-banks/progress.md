## Project status and tracking

### Overall Status: Phase 1 — In Progress (Early)

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

#### Backend (Minimal)
- [x] Single API endpoint: POST `/api/recommendations`
- [x] AI processes free-text input to extract profile attributes (taste profile via OpenAI, model configured in `src/lib/openai.js`)
- [x] ScrapingDog Shopping API integration (3 broad queries, ~40+ results each)
- [x] MongoDB caching for shopping results (48h TTL, stopword+stemming normalization)
- [x] Shopping deduplication (Jaccard similarity + price clustering, cluster size tracking)
- [x] Shopping pruning (weighted scoring on 6 dimensions incl. rating/reviews, top 16 cutoff)
- [x] ScrapingDog Immersive Product enrichment (merchant URLs + descriptions + store selection, batched 5 at a time)
- [x] Real product data wired into recommendations (no more mock data)
- [x] Two-tier pill system: LLM gift-fit pills + merchant badges (Free Shipping, Free Returns, etc.)
- [x] Star ratings on gift cards (prefers merchant rating, falls back to Google aggregate, no review counts)
- [x] Multi-image product gallery (swipe/click through thumbnails from Immersive Product API)
- [ ] Matches against curated gift database

#### Polish & UX
- [ ] Conversational follow-up for missing context
- [ ] Error handling for API failures (currently just resets to input)
- [ ] Input validation / minimum length guidance
- [ ] Mobile responsive testing
- [ ] Refinement loop (Phase 2 feature, but "Adjust Preferences" button exists)

### Phase 2 — Not Started
- [ ] Reject a pick and say why
- [ ] System returns alternatives informed by rejection
- [ ] Follow-up questions for missing context
- [ ] Conversational back-and-forth without leaving the page

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
