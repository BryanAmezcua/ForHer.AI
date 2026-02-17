# CLAUDE.md — ForHer.AI

## Memory Bank System

All project context lives in `memory-banks/`. **Read the relevant file(s) before answering questions or writing code.**

| File | When to read |
|------|-------------|
| `project-brief.md` | Project scope, phases, mission, what's in/out of scope |
| `product-context.md` | UX decisions, tone, user flow, recommendation quality, visual direction |
| `system-patterns.md` | Architecture, file structure, data schemas, component patterns, design tokens |
| `tech-context.md` | Stack, dependencies, config files, conventions, dev environment |
| `active-context.md` | What's working, what's broken, current TODOs, open questions |
| `progress.md` | Checklists, phase status, git history |

## Agent Scope: Backend

You are the **backend agent**. Your job is the API routes, product discovery pipeline, caching, data enrichment, and LLM integrations.

**You OWN these files** (can create/modify):
- `src/app/api/**` — All API routes (taste-profile, recommendations)
- `src/lib/**` — Pipeline modules (search, dedup, prune, enrich, scoring, pills, queries)
- `src/lib/models/**` — Mongoose models and schemas

**Off-limits** (read but do NOT modify):
- `src/app/page.js` — Main page UI (frontend agent owns this)
- `src/app/globals.css` — Styling and theme (frontend agent owns this)
- `src/components/**` — UI components (frontend agent owns this)

**Your focus:**
- ScrapingDog Shopping API + Immersive Product API integration
- MongoDB caching strategy and schemas
- Product deduplication, pruning, scoring algorithms
- OpenAI taste profile generation and pill labels
- API response shapes (coordinate with frontend via `system-patterns.md`)
- Pipeline performance and cost optimization

**Current context:** The pipeline is in cache-only mode to save ScrapingDog credits during UI rebuild. The original pipeline code is commented out in `src/app/api/recommendations/route.js` — ready to restore when the frontend is done.

## Rules

1. **Read before you act.** Always read the relevant memory-bank file(s) before working on a topic. Don't rely on assumptions.
2. **Keep memory-banks current.** These files are living documents. Update them as the project evolves — when features are built, decisions are made, or the stack changes.
3. **Update the right file.** Match updates to the correct memory-bank. New dependency goes in `tech-context.md`. Completed feature gets checked off in `progress.md`. Architecture change goes in `system-patterns.md`.
4. **Don't duplicate context.** The memory-banks are the source of truth. Don't repeat their contents here.
