const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ref', 'fbclid', 'gclid', 'mc_cid', 'mc_eid',
];

function canonicalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    for (const param of TRACKING_PARAMS) {
      parsed.searchParams.delete(param);
    }
    parsed.searchParams.sort();
    parsed.hash = '';
    // Strip trailing slash from pathname
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    return parsed.toString();
  } catch {
    return url.toLowerCase();
  }
}

function normalizeTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\s*[|–—-]\s*[^|–—-]+$/, '')  // strip trailing store-name suffix
    .replace(/[^a-z0-9\s]/g, '')             // remove non-alphanumeric
    .replace(/\s+/g, ' ')                    // collapse whitespace
    .trim();
}

function scoreCandidateCompleteness(candidate) {
  let score = 0;
  if (candidate.isComplete) score += 1000;
  if (candidate.hasPrice) score += 100;
  score += (candidate.searchScore || 0);
  return score;
}

export function deduplicateCandidates(candidates) {
  const canonicalUrlMap = new Map();   // canonicalUrl → index in winners
  const normalizedTitleMap = new Map(); // normalizedTitle → index in winners
  const winners = [];

  for (const candidate of candidates) {
    const canonUrl = canonicalizeUrl(candidate.url);
    const normTitle = normalizeTitle(candidate.title);
    const score = scoreCandidateCompleteness(candidate);

    // Check for existing match by URL or title
    const urlMatchIdx = canonicalUrlMap.get(canonUrl);
    const titleMatchIdx = normTitle ? normalizedTitleMap.get(normTitle) : undefined;
    const matchIdx = urlMatchIdx ?? titleMatchIdx;

    if (matchIdx !== undefined) {
      const existingScore = scoreCandidateCompleteness(winners[matchIdx]);
      if (score > existingScore) {
        // Replace the existing winner
        const oldCanonUrl = canonicalizeUrl(winners[matchIdx].url);
        const oldNormTitle = normalizeTitle(winners[matchIdx].title);
        // Clean up old mappings
        canonicalUrlMap.delete(oldCanonUrl);
        if (oldNormTitle) normalizedTitleMap.delete(oldNormTitle);
        // Install new winner
        winners[matchIdx] = candidate;
        canonicalUrlMap.set(canonUrl, matchIdx);
        if (normTitle) normalizedTitleMap.set(normTitle, matchIdx);
      }
      // else: existing winner is better or equal, skip this candidate
    } else {
      // New unique candidate
      const idx = winners.length;
      winners.push(candidate);
      canonicalUrlMap.set(canonUrl, idx);
      if (normTitle) normalizedTitleMap.set(normTitle, idx);
    }
  }

  const dupes = candidates.length - winners.length;
  console.log(`Deduped ${candidates.length} → ${winners.length} candidates (${dupes} duplicates removed)`);

  return winners;
}
