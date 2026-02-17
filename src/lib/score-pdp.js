/**
 * PDP (Product Detail Page) confidence scoring.
 * Pure synchronous function — no API calls, no dependencies.
 *
 * Returns a numeric score indicating how likely the URL points
 * to a real, buyable product page vs. a category/editorial page.
 *
 * Thresholds (applied by caller):
 *   score >= +3 → accept (high confidence PDP)
 *   score <= -2 → reject
 *   -1 to +2   → pass as-is (gray zone, keep)
 */

const SEARCH_PATH_SIGNALS = ['/search', '/results', '/sr', '/browse'];
const SEARCH_PARAMS = ['q', 'filter', 'category'];
const EDITORIAL_PATHS = ['/gift-guide/', '/best-sellers/', '/top-10/', '/ideas/', '/edit/'];

const EDITORIAL_TITLE_TERMS = [
  'shop all', 'collection', 'gift guide', 'best gifts', 'ideas',
];

const SIZE_MODEL_RE = /\b(\d+\s*oz|\d+\s*ml|\d+\s*mm|\d+\s*inch|\d+\s*gb|\d+\s*tb|pack of \d+|\d+\s*ct|\d+\s*fl\s*oz)\b/i;
const PRICE_RE = /(\$|USD|£|€|¥)\s*\d/;

/**
 * @param {{ url: string, title?: string, price?: string, snippet?: string }} input
 * @returns {number} PDP confidence score
 */
export function scorePDP({ url, title, price, snippet }) {
  let score = 0;
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return 0; // unparseable URL — neutral
  }

  const pathname = parsed.pathname.toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const searchParams = parsed.searchParams;

  // ── URL path features ──

  const isTarget = hostname.includes('target.com') || hostname.includes('target.');
  const genericProductPaths = ['/product/', '/dp/', '/ip/', '/item/'];
  // /p/ only counts for generic if NOT target (Target gets domain rule instead)
  if (!isTarget) genericProductPaths.push('/p/');

  for (const seg of genericProductPaths) {
    if (pathname.includes(seg)) { score += 1; break; }
  }

  for (const seg of SEARCH_PATH_SIGNALS) {
    if (pathname.includes(seg)) { score -= 1; break; }
  }

  for (const param of SEARCH_PARAMS) {
    if (searchParams.has(param)) { score -= 1; break; }
  }

  // ── Shopify handling ──

  if (pathname.includes('/products/')) {
    score += 2;
  } else if (pathname.includes('/collections/')) {
    // collections with products nested = weak positive
    if (pathname.match(/\/collections\/[^/]+\/products\//)) {
      score += 1;
    } else {
      score -= 2; // collections page without products
    }
  }

  // ── Domain-specific rules (high confidence, +3) ──

  if (hostname.includes('amazon')) {
    if (pathname.includes('/dp/') || pathname.includes('/gp/product/')) score += 3;
  } else if (hostname.includes('walmart')) {
    if (pathname.includes('/ip/')) score += 3;
  } else if (isTarget) {
    if (/\/p\//.test(pathname)) score += 3;
  } else if (hostname.includes('bestbuy')) {
    if (pathname.includes('/site/')) score += 3;
  } else if (hostname.includes('etsy')) {
    if (pathname.includes('/listing/')) score += 3;
  }

  // ── Title / snippet features ──

  const combined = [title, snippet, price].filter(Boolean).join(' ').toLowerCase();

  if (PRICE_RE.test(combined)) score += 1;
  if (SIZE_MODEL_RE.test(combined)) score += 1;

  for (const term of EDITORIAL_TITLE_TERMS) {
    if (combined.includes(term)) { score -= 1; break; }
  }

  // ── Hybrid / editorial pages (strong negative) ──

  for (const seg of EDITORIAL_PATHS) {
    if (pathname.includes(seg)) { score -= 2; break; }
  }

  return score;
}
