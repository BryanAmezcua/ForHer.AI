# CLAUDE.md — Gift Finder for Her

## What This Is

A gift recommendation app that helps men find thoughtful, well-matched gifts for the women in their lives — mom, wife, girlfriend, grandma, sister, daughter, friend.

It is not a product catalog. It is not a generic "gifts for her" listicle. It takes a detailed profile of who she is and returns a short, curated set of gifts that actually make sense for *her specifically*.

**Core question the system answers: "What would make her say 'how did you know?'"**

---

## Why This Should Exist

Gift shopping for women causes a disproportionate amount of stress for men, and the stress has nothing to do with budget. It comes from:

- **Decision paralysis** — too many options, no filter for relevance
- **Fear of getting it wrong** — a bad gift feels worse than no gift
- **Generic defaults** — candles, flowers, gift cards feel lazy but safe, so men fall back on them
- **Time pressure** — most gift shopping happens under a deadline (birthday in 3 days, anniversary tomorrow)
- **Guessing games** — "she said she doesn't want anything" is never true, but the real answer is buried in context clues men don't know how to decode

Every existing solution organizes gifts by category (jewelry, skincare, home) instead of by *person*. This app starts from the person, not the product.

---

## How It Works

### Step 1: Describe Her

One text box. No forms, no dropdowns, no 20-question intake. Just: **"Tell us about her."**

The user writes as little or as much as they want. A sentence works. A paragraph works better. Examples:

- "My mom loves gardening and hates clutter"
- "Girlfriend, 28, obsessed with true crime podcasts and fancy coffee. Our anniversary is next week. Budget around $75."
- "Grandma. She's 80 and doesn't need anything. She likes birds and crossword puzzles."

The system extracts what it needs: relationship, vibe, occasion, budget, interests, constraints. If critical info is missing (like budget), it asks — conversationally, not as a form field.

### Step 2: Curated Recommendations

3–5 gift recommendations. Not 50. Each includes:

- What it is
- Why it fits *her specifically*
- Where to get it
- Price and delivery timing
- Gift-readiness (packaging quality)

### Step 3: Refine or Commit

User can reject picks with a reason, ask for more like a specific one, or lock in a choice. Feedback sharpens results.

---

## Agent Architecture: One Agent Per Recipient

### Why

The long-term retention play is that each woman in the user's life gets her own persistent agent. The agent accumulates context over time:

- What she liked (confirmed by user after the occasion)
- What flopped
- How her interests shift
- What's already been gifted (no repeats)
- Upcoming occasions

By the third gift, the agent knows her better than a generic recommendation engine ever could. The user comes back because starting over somewhere else means losing that context.

### How (When Built)

Each recipient agent is a lightweight profile + conversation history that gets injected as context into the recommendation model. The agent doesn't run autonomously — it activates when the user says "I need a gift for [her name]" and loads the full relationship context.

This is **not** a Phase 1 concern. Parked until the core recommendation loop is proven.

---

## What Makes a Good Recommendation

Bias toward gifts that are:

- **Specific enough to feel personal** — "a journal" is generic. "A linen-bound journal from a small Italian stationery brand" feels chosen.
- **Slightly surprising** — what she didn't know she wanted
- **Not available everywhere** — if she can grab it at Target, it doesn't feel special
- **Experiential when possible** — classes, subscriptions, experiences beat objects for women who "have everything"
- **Presentation-ready** — flag gifts that arrive beautifully boxed vs. ones needing wrapping

---

## UI & Experience Philosophy

The experience must feel **calming and reassuring**. The user is likely already stressed. The UI should communicate: **"You got this. We'll figure it out together."**

### Principles

- **Warm, not corporate** — feels like texting a friend who's great at gifts, not browsing a retail site
- **Unhurried pacing** — no walls of text, no overwhelming grids. Breathing room everywhere.
- **Conversational tone** — the app talks *to* the user, not *at* them
- **Confidence without pressure** — recommendations are presented as "here's what we think" not "BUY NOW"
- **Minimal chrome** — the text box is the product. Everything else supports it.

### Visual Direction

- Soft, muted palette — think warm neutrals, gentle earth tones, maybe a single accent color
- Generous whitespace
- Rounded, approachable typography — nothing sharp, nothing corporate
- Subtle micro-animations (text fading in, recommendations appearing one at a time)
- No stock photos of smiling women holding gift boxes

---

## Tone & Voice

- Confident, not salesy
- Brief, not verbose
- Honest about trade-offs ("this is beautiful but ships slow — risky if her birthday is Friday")
- Zero condescension — men aren't stupid, they're just outside their comfort zone
- Light humor welcome, but never at the user's expense

---

## What This Is NOT

- **Not a marketplace** — recommends and links out. Does not sell, process payments, or hold inventory.
- **Not a generic gift list** — every recommendation is profile-driven.
- **Not a price comparison tool** — finds the right gift, not the cheapest version of a mediocre one.
- **Not an AI chatbot wrapper** — structured and guided, not an open-ended conversation.

---

## Scope Rules

**Phase 1 is just the conversation.** One page, one text box, one response. If that interaction doesn't feel magical, nothing else matters.

**Explicitly out of scope until Phase 1 is solid:**

- Recipient agents and persistence
- User accounts
- Saved profiles and gift history
- Occasion reminders
- Live trending data
- Affiliate links / monetization
- Mobile app (web-first)

---

## Development Phases

### Phase 1 — The Conversation (START HERE)

Build the landing page and the core interaction loop.

**Landing page:**

- Clean, calming single-page layout
- Headline that communicates warmth and confidence
- One large text input: "Tell us about her..."
- Helper text with example prompts (rotate or show 2–3)
- Submit sends the description to the recommendation engine
- Results appear below: 3–5 cards, each with gift name, why it fits, price, link

**Backend (minimal):**

- Single API endpoint: receives user text, returns structured gift recommendations
- AI processes the free-text input to extract: relationship, occasion, vibe, budget, interests, constraints
- Matches against a curated gift database (start with 200–300 hand-picked products with metadata)
- Returns 3–5 ranked results with personalized reasoning

**Exit criteria:** A user types a 1–3 sentence description and receives recommendations that feel genuinely tailored — not random, not generic. The page feels calm and encouraging to use.

### Phase 2 — Refinement Loop

- User can reject a pick and say why
- System returns alternative recommendations informed by the rejection
- Follow-up questions for missing context (budget, timeline)
- Conversational back-and-forth without leaving the page

**Exit criteria:** A 2–3 turn interaction consistently produces a gift the user feels confident about.

### Phase 3 — Recipient Agents

- User accounts (lightweight — email or Google auth)
- Save a recipient as a named profile ("Mom", "Sarah", "Grandma Rose")
- Each profile accumulates: past gifts, stated preferences, rejection reasons, confirmed hits
- Agent loads full recipient context on return visits
- Gift history prevents repeats

**Exit criteria:** Third-time recommendations for the same recipient are measurably better than first-time recommendations.

### Phase 4 — Retention & Growth

- Occasion reminders ("Mom's birthday is in 2 weeks")
- Trending gift integration
- Expanded product database
- Affiliate monetization
- Seasonal curation

---

## Philosophy

The best gift isn't the most expensive one. It's the one that makes her say "how did you know?"

This app exists to close the gap between caring and knowing what to do about it.