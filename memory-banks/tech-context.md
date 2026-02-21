## Development environment and stack

### Core Stack
| Layer        | Technology                     | Version  |
|--------------|--------------------------------|----------|
| Framework    | Next.js (App Router)           | ^15.5.12 |
| UI Library   | React                          | ^19.2.4  |
| Styling      | Tailwind CSS                   | ^4.1.18  |
| Components   | shadcn/ui (new-york, JSX)      | ^3.8.4   |
| Icons        | lucide-react                   | ^0.563.0 |
| LLM          | OpenAI (model set via `MODEL` in `src/lib/openai.js`) | ^4.x     |
| Database     | Mongoose (MongoDB ODM)         | ^8.23.0  |
| CSS          | PostCSS + @tailwindcss/postcss | ^8.5.6   |
| Animations   | tw-animate-css                 | ^1.4.0   |

### Authentication
| Layer | Technology | Version |
|-------|-----------|---------|
| Auth framework | Auth.js v5 (NextAuth) | 5.0.0-beta.30 |
| Auth adapter | @auth/mongodb-adapter | latest |
| MongoDB client | mongodb (raw driver, for Auth.js adapter) | latest |
| Password hashing | bcryptjs | latest |

### Utility Libraries
- `class-variance-authority` (^0.7.1) — Component variant management
- `clsx` (^2.1.1) — Conditional class joining
- `tailwind-merge` (^3.4.0) — Intelligent Tailwind class merging
- `radix-ui` (^1.4.3) — Accessible UI primitives (used by shadcn)

### Deployment
| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Hosting (Next.js, serverless functions) | $20/mo (Pro plan) |
| **Cloudflare** | DNS for gifther.ai → Vercel | Free |
| **MongoDB Atlas** | Shopping cache database | Free tier (IP: 0.0.0.0/0 for Vercel) |
| **ScrapingDog** | Amazon Search API | $40/mo (LITE plan, 200k credits) |
| **OpenAI** | LLM (taste profile, queries, pills, reactions) | Free (sponsor key) |

### Environment Variables
| Key | Purpose |
|-----|---------|
| `OPENAI_API_KEY` | OpenAI API access |
| `SCRAPINGDOG_API_KEY` | ScrapingDog Amazon Search API |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Auth.js session signing secret (generate via `npx auth secret`) |
| `AUTH_GOOGLE_ID` | Google Cloud Console OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console OAuth client secret |

These are set in both `.env.local` (local dev) and Vercel project settings (production).

### Configuration Files
| File               | Purpose                                      |
|--------------------|----------------------------------------------|
| `package.json`     | Dependencies and scripts (`dev`, `build`, `start`) |
| `next.config.mjs`  | Next.js config — remote image hosts restricted to Amazon CDN |
| `jsconfig.json`    | Path alias: `@/*` → `./src/*`                |
| `components.json`  | shadcn/ui config (new-york style, JSX, CSS vars) |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss`         |

### Scripts
```bash
npm run dev    # Start Next.js dev server
npm run build  # Production build
npm run start  # Start production server
```

### Key Technical Decisions
- **JSX over TSX:** Project uses plain JavaScript, not TypeScript (shadcn configured with `tsx: false`)
- **Tailwind v4:** Uses the new CSS-first configuration (no `tailwind.config.js`). Theme defined in `globals.css` using `@theme inline`
- **No separate Tailwind config file:** All design tokens live in `globals.css` via CSS variables
- **App Router:** Using Next.js App Router (not Pages Router)
- **Client-side main page:** `page.js` uses `'use client'` for interactive state management
- **Remote images restricted:** `next.config.mjs` whitelists Amazon CDN hostnames only (images-na.ssl-images-amazon.com, m.media-amazon.com, images-eu.ssl-images-amazon.com)
- **Mongoose active:** MongoDB connection singleton at `src/lib/mongoose.js`. Cluster: `cached-data`, database: `GiftHer`. Collections: `products` (Amazon product cache, 24h TTL), `sessions` (shareable recommendation sessions, 7-day TTL), `recipients` (saved recipient profiles). Atlas IP whitelist: `0.0.0.0/0` (required for Vercel serverless).
- **Raw MongoDB client:** `src/lib/mongodb-client.js` provides a `MongoClient` singleton for the Auth.js MongoDB adapter (coexists with Mongoose).
- **Auth.js v5:** JWT strategy (avoids `sessions` collection name collision). Google OAuth + email/password credentials. Config at `src/lib/auth.js`. Auth.js auto-creates `users` and `accounts` collections in `GiftHer` DB.
- **ScrapingDog:** Amazon Search API only. ~50 credits per uncached request (~4,000 requests/month on LITE plan $40/mo).
- **Vercel auto-deploy:** Every push to `master` triggers a production deployment.

### Development Workflow
- Single worktree on `master` branch — all work happens in `ForHer.AI/`
- For parallel agent work: open multiple Claude Code sessions in the same repo, each working on different files
- For larger independent features: create feature worktrees (e.g., `git worktree add ../ForHer-wishlist feature/wishlist`) — split by feature, not by layer
- API contract at `memory-banks/api-contract.md` defines frontend/backend interface

### File Conventions
- Components: `src/components/ui/*.jsx` (shadcn primitives), `src/components/*.jsx` (domain components)
- Pages: `src/app/page.js` (homepage), `src/app/(landing)/[slug]/page.js` (15 SEO landing pages), `src/app/s/[id]/page.js` (shared sessions), `src/app/dashboard/page.js` (recipient list), `src/app/dashboard/recipients/[id]/page.js` (edit recipient), `src/app/auth/signin/page.js`, `src/app/auth/register/page.js`
- Landing page config: `src/lib/landing-pages.js` (SEO metadata, taste profiles, FAQs, CTAs for all 15 pages)
- SEO: `src/app/sitemap.js`, `src/app/robots.js`, `src/app/opengraph-image.js`, `src/app/(landing)/[slug]/opengraph-image.js`
- API Routes: `src/app/api/*/route.js`
- Pipeline: `src/lib/pipeline.js` (orchestrator), `src/lib/*.js` (individual steps)
- Search: `src/lib/search-amazon.js` (Amazon Search + cache)
- Utilities: `src/lib/utils.js`, `src/lib/debug.js`, `src/lib/parse-price.js`, `src/lib/strip-markdown.js`, `src/lib/clean-title.js`
- Path alias: `@/` maps to `./src/`

### Platform
- Development OS: Windows (win32)
- Package manager: npm (package-lock.json present)
