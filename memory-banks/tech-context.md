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
- **Mongoose active:** MongoDB connection singleton at `src/lib/mongoose.js`, targeting `serper-queries` database. Used for ScrapingDog shopping result caching. Connection string in `MONGODB_URI` env var.
- **ScrapingDog:** Google Shopping API + Immersive Product API for product search and enrichment. API key in `SCRAPINGDOG_API_KEY` env var. ~110 credits per request (~2,000 requests/month on LITE plan $40/mo).

### File Conventions
- Components: `src/components/ui/*.jsx` (shadcn primitives)
- Pages: `src/app/page.js`
- API Routes: `src/app/api/*/route.js`
- Utilities: `src/lib/utils.js`
- Path alias: `@/` maps to `./src/`

### Platform
- Development OS: Windows (win32)
- Package manager: npm (package-lock.json present)
