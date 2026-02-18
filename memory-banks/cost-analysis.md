# Cost Analysis

## ScrapingDog API

**Plan:** $40/month — 200,000 credits

### Per-Credit Cost
- $40 / 200,000 = **$0.0002 per credit**

### Per Uncached Request Breakdown
| Step | Credits per call | Calls | Total credits |
|------|-----------------|-------|---------------|
| Shopping API query | 10 | 3 | 30 |
| Immersive Product API (enrichment) | 5 | 16 | 80 |
| **Total per uncached request** | | | **110** |

### Cost Per Request
- 110 credits × $0.0002 = **$0.022 (~2.2 cents)**

### Monthly Capacity
- 200,000 / 110 = **~1,818 uncached requests/month**

### Notes
- Cached requests cost nothing (MongoDB 48-hour TTL cache)
- Enrichment pool is 16 products; only top 9 are displayed after PDP scoring
- Shopping queries are normalized before caching, so similar queries hit the same cache entry

---

## LLM Costs (OpenAI)

*To be revisited.* Currently using a free OpenAI API key through a sponsor. Will calculate per-request LLM costs (taste profile generation, pill labels, reaction lines, query generation) once we move to a paid key.
