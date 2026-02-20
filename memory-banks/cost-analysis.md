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

### Per Uncached Request Breakdown (Current — 5 Amazon queries)
| Step | Credits per call | Calls | Total credits |
|------|-----------------|-------|---------------|
| Amazon Search query | 10 | 5 | 50 |
| **Total per uncached request** | | | **50** |

### Cost Per Request
- 50 credits × $0.0002 = **$0.01 (1 cent)**

### Monthly Capacity
- 200,000 / 50 = **4,000 uncached requests/month**

### Previous (2 Amazon + 1 Google Shopping + Immersive Product, for reference)
| Step | Credits per call | Calls | Total credits |
|------|-----------------|-------|---------------|
| Google Shopping query | 10 | 1 | 10 |
| Amazon Search query | 10 | 2 | 20 |
| Immersive Product API (Google products only) | 5 | ~8 | ~40 |
| **Total per uncached request** | | | **~70** |

- Was: 200,000 / 70 = ~2,857 uncached requests/month
- **Savings: ~29% fewer credits per request, ~40% more monthly capacity**

### Notes
- Cached requests cost nothing (MongoDB 24-hour TTL cache)
- Over-fetch pool is 16 products; top 9 displayed
- Shopping queries are normalized before caching, so similar queries hit the same cache entry
- All clicks go to Amazon (affiliate revenue via `?tag=giftherai-20`)

---

## LLM Costs (OpenAI)

*To be revisited.* Currently using a free OpenAI API key through a sponsor. Will calculate per-request LLM costs (taste profile generation, pill labels, reaction lines, query generation) once we move to a paid key.

---

## Revenue Projections (Amazon Affiliate)

**Associate Store ID:** `giftherai-20`

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
