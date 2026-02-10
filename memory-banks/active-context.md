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

### What's NOT Working / Mocked
- **Taste profile generates but doesn't drive recommendations yet** — profile is returned in API response + logged to console, but mock gift cards are still hardcoded
- Mock data always returns the same 3 products (Hand-Thrown Earthware Set, Midnight Silk Robe, Sculptural Timepiece)
- Mock meta always says "Curated for Sarah" regardless of user input
- "Adjust Preferences" button in results view has no functionality
- Gift card "View" buttons link to `#` (no real product URLs)
- No follow-up/refinement conversation loop
- No input validation or contextual follow-up questions
- Mongoose is installed but no database models or connections exist

### Known TODOs
1. Replace mock recommendations with actual AI-powered recommendation engine
2. Build or integrate a curated gift database (spec calls for 200–300 hand-picked products)
3. Extract relationship, occasion, vibe, budget, interests, constraints from free-text input
4. Return personalized reasoning per recommendation
5. Implement refinement loop (Phase 2)
6. Wire up "Adjust Preferences" button
7. Add real product URLs and images
8. Conversational follow-up for missing context (budget, timeline)

### Recent Changes
- Scaffolding commit set up the Next.js project with shadcn/ui, Tailwind v4, and the full landing page UI
- Original prototype exists as `gift-finder.jsx` (standalone React component with inline styles) — the `src/app/page.js` is the active, evolved version using Tailwind
- **Integrated OpenAI (gpt-4o-mini)** for taste profile generation from user descriptions
- Added `src/lib/openai.js` (client singleton) and `src/lib/taste-profile.js` (profile extraction)
- API route now calls LLM, logs taste profile to console, and includes it in the response JSON

### Active Decisions / Open Questions
- **AI service decided:** OpenAI gpt-4o-mini for taste profile extraction
- Gift database approach: curated static DB vs. live product API vs. hybrid
- Whether to use Mongoose/MongoDB for Phase 1 or defer all persistence to Phase 3
- Next step: use the taste profile to drive actual gift recommendations instead of mock data
