// Snippet-based page classifier
// Scores search results by title + content signals to reject non-product pages
// before the expensive Tavily extract API call.

const BUY_SIGNALS = [
  { pattern: /add to (cart|bag)/i, weight: 3 },
  { pattern: /buy (now|it now)/i, weight: 3 },
  { pattern: /\b(in stock|out of stock|sold out)\b/i, weight: 2 },
  { pattern: /free (shipping|delivery)/i, weight: 2 },
  { pattern: /ships (in|within|free)/i, weight: 2 },
];

const PRICE_SIGNALS = [
  { pattern: /\$\d{1,5}(\.\d{2})?/, weight: 2 },
  { pattern: /(sale|regular) price/i, weight: 1 },
  { pattern: /(was|now) \$/i, weight: 1 },
];

const PRODUCT_SIGNALS = [
  { pattern: /\d+\s*reviews?/i, weight: 1 },
  { pattern: /★|(\d(\.\d)?\s*(out of 5|stars?))/i, weight: 1 },
  { pattern: /(size|color|material)\s*:/i, weight: 1 },
];

const TITLE_ANTI_SIGNALS = [
  { pattern: /^\d+\s+(best|top|great|unique|perfect|amazing|favorite|coolest)/i, weight: -4 },
  { pattern: /gift (guide|ideas?)|buying guide/i, weight: -3 },
  { pattern: /roundup|our picks|curated list|editor'?s? (choice|pick)/i, weight: -3 },
];

const CONTENT_ANTI_SIGNALS = [
  { pattern: /gift guide|roundup|our picks/i, weight: -2 },
  { pattern: /(written|reviewed|updated|published) by/i, weight: -2 },
  { pattern: /browse all|shop all|view (all|collection)|see all/i, weight: -2 },
  { pattern: /best .{1,30} for/i, weight: -2 },
  { pattern: /the .{1,30} best/i, weight: -2 },
];

function matchSignals(text, signals) {
  let score = 0;
  const matched = [];
  for (const { pattern, weight } of signals) {
    if (pattern.test(text)) {
      score += weight;
      matched.push(pattern.source);
    }
  }
  return { score, matched };
}

function scoreCandidate({ title, content }) {
  const t = title || '';
  const c = content || '';

  let score = 0;
  const reasons = [];

  // Positive signals (content only)
  const buy = matchSignals(c, BUY_SIGNALS);
  score += buy.score;
  if (buy.matched.length) reasons.push('buy-path language');

  const price = matchSignals(c, PRICE_SIGNALS);
  score += price.score;
  if (price.matched.length) reasons.push('price signals');

  const product = matchSignals(c, PRODUCT_SIGNALS);
  score += product.score;
  if (product.matched.length) reasons.push('product structure');

  // Negative signals — title
  const titleAnti = matchSignals(t, TITLE_ANTI_SIGNALS);
  score += titleAnti.score;
  if (titleAnti.matched.length) reasons.push('listicle/guide title');

  // Negative signals — content
  const contentAnti = matchSignals(c, CONTENT_ANTI_SIGNALS);
  score += contentAnti.score;
  if (contentAnti.matched.length) reasons.push('editorial content');

  // Multi-price detection: 3+ distinct prices → likely listicle
  const priceMatches = c.match(/\$\d{1,5}(\.\d{2})?/g);
  if (priceMatches && priceMatches.length >= 3) {
    score -= 2;
    reasons.push('multiple prices');
  }

  // Numbered-list detection: 3+ numbered items → multi-item list
  const numberedItems = c.match(/\d+\.\s/g);
  if (numberedItems && numberedItems.length >= 3) {
    score -= 2;
    reasons.push('numbered list');
  }

  return { score, reasons };
}

export function classifyCandidates(searchResults) {
  const kept = [];
  const rejected = [];

  for (const result of searchResults) {
    const { score, reasons } = scoreCandidate(result);
    if (score >= 0) {
      kept.push(result);
    } else {
      rejected.push({ title: result.title, score, reasons });
    }
  }

  // Logging (matches filter-urls.js convention)
  console.log(`Classified ${searchResults.length} → ${kept.length} candidates (${rejected.length} rejected as non-product)`);
  for (const r of rejected) {
    console.log(`  [REJECTED] "${r.title}" (score: ${r.score}) — ${r.reasons.join(', ')}`);
  }

  return kept;
}
