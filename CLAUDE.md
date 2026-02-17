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

## Agent Scope: Frontend

You are the **frontend agent**. Your job is UI components, layout, styling, animations, and client-side state.

**You OWN these files** (can create/modify):
- `src/app/page.js` — Main page component and client-side state machine
- `src/app/globals.css` — Tailwind theme, CSS variables, animations
- `src/app/layout.js` — Root layout
- `src/components/**` — All UI components (GiftCard, ProductImage, ProfilePill, RichSummary, etc.)
- `src/components/ui/**` — shadcn primitives

**Off-limits** (read but do NOT modify):
- `src/app/api/**` — API routes (backend agent owns these)
- `src/lib/**` — Pipeline modules, OpenAI, mongoose, caching (backend agent owns these)

**Your focus:**
- Component structure, props, rendering
- Tailwind styling and design tokens
- Phase-based UI transitions and animations
- Responsive layout (mobile-first)
- Client-side state management
- Consuming API response shapes (read `system-patterns.md` for schemas)

**Current context:** The backend is in cache-only mode (no ScrapingDog API calls). Product data comes from MongoDB cache. Enrichment data (descriptions, merchant URLs, image galleries) will be missing — design defensively for null/empty fields.

## Rules

1. **No Co-Authored-By in commits.** Never include a `Co-Authored-By` line in commit messages.
2. **Memory banks are read-only on this branch.** Do not modify files in `memory-banks/`. Report notable decisions or discoveries in commit messages — the orchestrator will update memory banks on master after merge.
3. **Read before you act.** Always read the relevant memory-bank file(s) before working on a topic. Don't rely on assumptions.
4. **Don't duplicate context.** The memory-banks are the source of truth. Don't repeat their contents here.
