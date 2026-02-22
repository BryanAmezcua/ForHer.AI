## Current state of development

### Current Focus
**User accounts & saved recipients built (Phase 3).** Auth.js v5 with Google OAuth + email/password credentials. JWT sessions. Recipient profiles with CRUD, dashboard, and save-from-results flow. Needs env vars set on Vercel + Google OAuth credentials created before deploy.

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
- **SEO infrastructure:** sitemap.js, robots.js, structured data (Organization, WebSite, WebApplication in root layout; BreadcrumbList, Product, FAQPage on landing pages)
- **15 SEO landing pages** with pre-built taste profiles, FAQs, and per-page OG images (gifts-for-girlfriend, gifts-for-mom, gifts-for-wife, gifts-for-sister, birthday-gifts-for-her, christmas-gifts-for-her, valentines-gifts-for-her, anniversary-gifts-for-her, gifts-for-daughter, gifts-for-best-friend, mothers-day-gifts, graduation-gifts-for-her, gifts-for-her-under-50, unique-gifts-for-her, last-minute-gifts-for-her)
- **Footer:** multi-column grid on desktop (2-col sm, 3-col lg), truncated to 6 links with "Show all" toggle on mobile
- **Image domains restricted** to Amazon CDN hostnames in next.config.mjs
- **User authentication** via Auth.js v5 (Google OAuth + email/password, JWT sessions)
- **Saved recipient profiles** — CRUD API, dashboard, save-from-results flow
- **Dashboard** at `/dashboard` — polished recipient cards with entrance animations, hover lift, glass surfaces, avatar initials, ProfilePill-style interest/aesthetic pills, skeleton loading state, personalized time-of-day greeting, "Add new" card, and three-column nav matching SessionResults
- **Recipient edit page** (`/dashboard/recipients/[id]`) — premium visual treatment matching dashboard: skeleton loading with shimmer, rich not-found state, three-column nav, avatar header, two glass-surface form cards ("About Her" + "Dates & Reminders"), pill-toggle reminders, polished save button with checkmark feedback
- **Save button** in results nav bar — prompts auth if needed, saves taste profile as named recipient

### What's NOT Working / Incomplete
- "Adjust Preferences" button in results view has no functionality (commented out)
- No follow-up/refinement conversation loop
- Error handling is basic (resets to input on failure)

### Known TODOs
1. **Set Vercel env vars:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
2. **Create Google OAuth credentials** in Google Cloud Console (gifther.ai authorized redirect URIs)
3. Register with Google Search Console and add verification meta tag
4. Submit sitemap to Google Search Console
5. Monitor landing page indexing and impressions
6. Implement refinement loop (Phase 2)
7. Wire up "Adjust Preferences" button
8. Phase 4: Email reminders (Resend + Vercel cron)

### Recent Changes
- **User accounts & saved recipients (Phase 3)** — Auth.js v5 with Google OAuth + email/password, JWT sessions, `users`/`accounts` collections auto-created. Recipient profiles with CRUD API, dashboard UI, save-from-results flow. Auth is invisible until user actively saves. Dashboard prefills main page for returning searches.
- **Dashboard visual polish (Phase 3D)** — RecipientCard and dashboard page revamped to match results page quality: skeleton loading, staggered entrance animations, hover effects, personalized greeting, rich empty state, "Add new" card.
- **SEO overhaul** — Added Organization/WebSite/WebApplication JSON-LD to root layout. BreadcrumbList schema on landing pages. OG image references in root metadata + per-landing-page OG image generation. Twitter card + OG image on shared sessions. Meta description enriched. Theme-color added. Image domains tightened to Amazon CDN. 10 new landing pages (15 total) targeting seasonal, occasion, budget, and intent keywords. All landing page copy scrubbed of aesthetic/vibe wording. Footer redesigned: multi-column grid desktop, expandable mobile.
- **Gift recommendation quality overhaul** — Rewrote query generation to ban "gift" keyword and use product-category approach (4 direct + 1 adjacent/surprise queries). Added LLM reranker (`rerank-products.js`) with brand-first quality ranking. Simplified pruning to coarse pre-filter (raised min price $5→$20, removed gift set ban, removed 6-factor scoring). Rows sorted by matchScore instead of price.
- **Session persistence & shareable URLs** — Recommendation sessions saved to MongoDB `sessions` collection (7-day TTL). Shareable via `/s/[id]` URLs with dynamic OG tags.

### Active Decisions / Open Questions
- **AI service decided:** OpenAI for all LLM calls (model configured in `src/lib/openai.js`)
- **MongoDB in use** — cluster `cached-data`, database `GiftHer`. Collections: `products` (shopping cache, 24h TTL), `sessions` (shareable sessions, 7-day TTL), `recipients` (saved recipient profiles), `users` (Auth.js user accounts), `accounts` (Auth.js OAuth links)
- **ScrapingDog active** for Amazon Search API only. LITE plan: ~50 credits per uncached request, ~4,000 uncached requests/month.
- **Deployment:** Vercel Pro ($20/mo) + Cloudflare DNS + gifther.ai domain
- **Amazon Associates** — Associate Store ID: `giftherai-20`. Requires 3 qualifying sales in 180 days. PA-API 5.0 deprecated April 2026; Creators API for future use.
- **Next step:** Set Auth env vars on Vercel, create Google OAuth credentials, push to deploy and verify auth + recipient save flow
