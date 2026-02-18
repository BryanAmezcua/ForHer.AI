# Cost Analysis

## Monthly Fixed Costs

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20/mo | Hosting + serverless functions |
| ScrapingDog LITE | $40/mo | 200,000 credits |
| MongoDB Atlas | Free | Free tier, IP whitelisted 0.0.0.0/0 |
| Cloudflare DNS | Free | DNS only (no proxy) |
| gifther.ai domain | ~$70/yr (~$6/mo) | 2-year minimum registration |
| OpenAI | Free | Sponsor key (will need to budget when moving to paid) |
| **Total** | **~$66/mo** | |

---

## ScrapingDog API

**Plan:** $40/month — 200,000 credits

### Per-Credit Cost
- $40 / 200,000 = **$0.0002 per credit**

### Per Uncached Request Breakdown (Current — Google Shopping only)
| Step | Credits per call | Calls | Total credits |
|------|-----------------|-------|---------------|
| Shopping API query | 10 | 3 | 30 |
| Immersive Product API (enrichment) | 5 | 16 | 80 |
| **Total per uncached request** | | | **110** |

### Cost Per Request
- 110 credits × $0.0002 = **$0.022 (~2.2 cents)**

### Monthly Capacity
- 200,000 / 110 = **~1,818 uncached requests/month**

### Projected with Amazon Integration
| Step | Credits per call | Calls | Total credits |
|------|-----------------|-------|---------------|
| Google Shopping query | 10 | 3 | 30 |
| Amazon Search query | 1 | 3 | 3 |
| Immersive Product (Google products only) | 5 | ~10 | 50 |
| **Total per uncached request** | | | **~83** |

- With Amazon: 200,000 / 83 = **~2,410 uncached requests/month** (32% more capacity)
- Amazon products skip Immersive Product enrichment (already have rich data)

### Notes
- Cached requests cost nothing (MongoDB 48-hour TTL cache)
- Enrichment pool is 16 products; only top 9 are displayed after PDP scoring
- Shopping queries are normalized before caching, so similar queries hit the same cache entry

---

## LLM Costs (OpenAI)

*To be revisited.* Currently using a free OpenAI API key through a sponsor. Will calculate per-request LLM costs (taste profile generation, pill labels, reaction lines, query generation) once we move to a paid key.

---

## Revenue Projections (Amazon Affiliate)

### Amazon Associates Commission Rates (relevant categories)
| Category | Rate |
|----------|------|
| Luxury Beauty | 10% |
| Handmade | 5% |
| Physical Books | 4.5% |
| Watches, Jewelry, Handbags, Accessories | 4% |
| Fashion, Amazon Devices | 4% |
| Home & Kitchen, Furniture | 3-4.5% |
| Beauty | 3% |

### Per-Sale Revenue (estimated)
- Average gift price: ~$50
- Average commission rate: ~4%
- **Revenue per sale: ~$2.00**
- 24-hour cookie window: earn on ALL purchases within 24h of click, not just the linked product

### Requirements
- 3 qualifying sales in first 180 days to keep Associates account
- 10+ sales/month to maintain API access (Creators API)
- PA-API 5.0 deprecated April 2026 — use Creators API for new integrations
