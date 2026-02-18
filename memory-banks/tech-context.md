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
| **ScrapingDog** | Product search + enrichment APIs | $40/mo (LITE plan, 200k credits) |
| **OpenAI** | LLM (taste profile, queries, pills, reactions) | Free (sponsor key) |

### Environment Variables
| Key | Purpose |
|-----|---------|
| `OPENAI_API_KEY` | OpenAI API access |
| `SCRAPINGDOG_API_KEY` | ScrapingDog Shopping + Amazon Search + Immersive Product APIs |
| `MONGODB_URI` | MongoDB Atlas connection string |

These are set in both `.env.local` (local dev) and Vercel project settings (production).

### Configuration Files
| File               | Purpose                                      |
|--------------------|----------------------------------------------|
| `package.json`     | Dependencies and scripts (`dev`, `build`, `start`) |
| `next.config.mjs`  | Next.js config — allows all remote image hosts |
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
- **Remote images allowed:** `next.config.mjs` allows images from any HTTPS hostname
- **Mongoose active:** MongoDB connection singleton at `src/lib/mongoose.js`, targeting `serper-queries` database. Used for ScrapingDog shopping result caching. Atlas IP whitelist: `0.0.0.0/0` (required for Vercel serverless).
- **ScrapingDog:** Google Shopping API + Amazon Search API + Immersive Product API. ~70 credits per uncached request (~2,857 requests/month on LITE plan $40/mo). Amazon products skip Immersive Product enrichment.
- **Vercel auto-deploy:** Every push to `master` triggers a production deployment.

### Multi-Agent Workflow
- Git worktrees for parallel agent work: `ForHer-frontend/` (frontend branch), `ForHer-backend/` (backend branch), `ForHer.AI/` (master, orchestrator)
- Frontend agent owns: `src/app/page.js`, `src/app/globals.css`, `src/app/layout.js`, `src/components/**`
- Backend agent owns: `src/app/api/**`, `src/lib/**`, `src/lib/models/**`
- API contract at `memory-banks/api-contract.md` defines shared interface
- Memory banks are read-only on agent branches — only master updates them after merges
- Orchestrator (master) merges branches, updates memory banks, rebases worktrees

### File Conventions
- Components: `src/components/ui/*.jsx` (shadcn primitives), `src/components/*.jsx` (domain components)
- Pages: `src/app/page.js`
- API Routes: `src/app/api/*/route.js`
- Pipeline: `src/lib/pipeline.js` (orchestrator), `src/lib/*.js` (individual steps)
- Search: `src/lib/search-scrapingdog.js` (Google Shopping), `src/lib/search-amazon.js` (Amazon)
- Utilities: `src/lib/utils.js`, `src/lib/debug.js`, `src/lib/parse-price.js`, `src/lib/strip-markdown.js`, `src/lib/clean-title.js`
- Path alias: `@/` maps to `./src/`

### Platform
- Development OS: Windows (win32)
- Package manager: npm (package-lock.json present)
