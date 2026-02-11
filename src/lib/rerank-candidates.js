// Base weights — redistributed at runtime based on which taste profile fields are populated.
// Empty fields donate their weight proportionally to populated fields.
export const BASE_WEIGHTS = {
  budgetFit:        0.25,
  interestMatch:    0.25,
  aestheticMatch:   0.15,
  searchRelevance:  0.15,
  dataCompleteness: 0.10,
  personalityMatch: 0.10,
};

// --- Text matching helpers ---

function stemWord(word) {
  return word
    .replace(/ing$/, '')
    .replace(/tion$/, '')
    .replace(/ness$/, '')
    .replace(/ment$/, '')
    .replace(/ful$/, '')
    .replace(/ous$/, '')
    .replace(/ive$/, '')
    .replace(/ist$/, '')
    .replace(/ly$/, '')
    .replace(/ed$/, '')
    .replace(/er$/, '')
    .replace(/es$/, '')
    .replace(/s$/, '');
}

function textContainsTerm(text, term) {
  const lowerTerm = term.toLowerCase().trim();

  // Exact phrase match
  if (text.includes(lowerTerm)) return true;

  // Stemmed word-level match — all words in term must appear
  const termWords = lowerTerm.split(/\s+/);
  return termWords.every(tw => {
    const stemmed = tw.length > 3 ? stemWord(tw) : tw;
    // Check if any word in text starts with or is started by the stem
    return text.split(/\s+/).some(textWord => {
      const textStem = textWord.length > 3 ? stemWord(textWord) : textWord;
      return textStem.startsWith(stemmed) || stemmed.startsWith(textStem);
    });
  });
}

function buildSearchableText(candidate) {
  return [candidate.title, candidate.description, candidate.rawContent]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

// --- Sub-scorers (each returns 0–1) ---

function scoreBudgetFit(candidate, budget) {
  if (!candidate.hasPrice) return 0.3;

  const min = budget.min || 0;
  const max = budget.max || Infinity;
  const price = candidate.priceValue;

  if (price >= min && price <= max) return 1.0;

  const range = (max !== Infinity ? max - min : min * 0.5) || 100;
  const distance = price < min ? min - price : price - max;
  const ratio = distance / range;

  const flexible = budget.flexibility === 'flexible' || budget.flexibility === 'open';
  const thresholds = flexible
    ? [0.25, 0.50, 0.75]
    : [0.15, 0.30, 0.50];

  if (ratio <= thresholds[0]) return 0.7;
  if (ratio <= thresholds[1]) return 0.4;
  if (ratio <= thresholds[2]) return 0.2;
  return 0.0;
}

function scoreInterestMatch(text, interests) {
  if (!interests.length) return 0;
  let hits = 0;
  for (const interest of interests) {
    if (textContainsTerm(text, interest)) hits++;
  }
  return Math.min(hits / Math.min(interests.length, 3), 1.0);
}

function scoreAestheticMatch(text, aesthetic) {
  const styles = aesthetic.style || [];
  const avoids = aesthetic.avoids || [];

  let styleHits = 0;
  for (const s of styles) {
    if (textContainsTerm(text, s)) styleHits++;
  }
  const styleScore = styles.length
    ? Math.min(styleHits / Math.min(styles.length, 2), 1.0)
    : 0;

  let avoidHits = 0;
  for (const a of avoids) {
    if (textContainsTerm(text, a)) avoidHits++;
  }
  const avoidPenalty = Math.min(avoidHits * 0.5, 1.0);

  return Math.max(styleScore - avoidPenalty, 0);
}

function scorePersonalityMatch(text, personality, giftingContext) {
  const signals = [...(personality.traits || [])];
  if (giftingContext.leanToward) signals.push(giftingContext.leanToward);
  if (!signals.length) return 0;

  let hits = 0;
  for (const signal of signals) {
    if (textContainsTerm(text, signal)) hits++;
  }
  return Math.min(hits / Math.min(signals.length, 2), 1.0);
}

function scoreDataCompleteness(candidate) {
  let score = 0;
  if (candidate.isComplete) {
    score += 0.7;
  } else {
    if (candidate.title) score += 0.2;
    if (candidate.description) score += 0.2;
    if (candidate.imageUrl) score += 0.2;
  }
  if (candidate.hasPrice) score += 0.3;
  return Math.min(score, 1.0);
}

// --- Hard filter ---

function checkHardFilters(text, constraints, avoidCategories) {
  const filters = [...constraints, ...avoidCategories];
  for (const filter of filters) {
    if (textContainsTerm(text, filter)) {
      return { pass: false, reason: filter };
    }
  }
  return { pass: true, reason: null };
}

// --- Confidence-weighted scoring ---
// Each dimension gets a confidence score (0–1) based on how much signal the
// taste profile provides. Stronger/more explicit data → higher confidence →
// more influence on the final ranking. Weak or missing fields fade out and
// their weight is redistributed to high-confidence dimensions.

function computeFieldConfidence(tasteProfile) {
  const { budget, interests, aesthetic, personality, giftingContext } = tasteProfile;

  // Budget: both bounds + strict = highest confidence
  let budgetConf = 0;
  if (budget) {
    const hasBoth = !!(budget.min && budget.max);
    const hasOne = !!(budget.min || budget.max);
    if (hasBoth && budget.flexibility === 'strict') budgetConf = 1.0;
    else if (hasBoth) budgetConf = 0.8;
    else if (hasOne) budgetConf = 0.5;
  }

  // Interests: more interests = stronger signal
  const interestCount = interests?.length || 0;
  let interestConf = 0;
  if (interestCount >= 4) interestConf = 1.0;
  else if (interestCount === 3) interestConf = 0.8;
  else if (interestCount === 2) interestConf = 0.6;
  else if (interestCount === 1) interestConf = 0.4;

  // Aesthetic: style + avoids both populated is strongest
  const styleCount = aesthetic?.style?.length || 0;
  const avoidsCount = aesthetic?.avoids?.length || 0;
  let aestheticConf = 0;
  if (styleCount && avoidsCount) aestheticConf = 1.0;
  else if (styleCount >= 2) aestheticConf = 0.7;
  else if (styleCount === 1) aestheticConf = 0.4;
  else if (avoidsCount) aestheticConf = 0.3;

  // Personality: traits + leanToward is strongest
  const traitCount = personality?.traits?.length || 0;
  const hasLean = !!giftingContext?.leanToward;
  let personalityConf = 0;
  if (traitCount >= 2 && hasLean) personalityConf = 1.0;
  else if (traitCount >= 2 || (traitCount >= 1 && hasLean)) personalityConf = 0.7;
  else if (traitCount === 1 || hasLean) personalityConf = 0.4;

  return {
    budgetFit:        budgetConf,
    interestMatch:    interestConf,
    aestheticMatch:   aestheticConf,
    searchRelevance:  1.0,  // always available from candidate data
    dataCompleteness: 1.0,  // always available from candidate data
    personalityMatch: personalityConf,
  };
}

function computeActiveWeights(tasteProfile) {
  const confidence = computeFieldConfidence(tasteProfile);

  // Scale each base weight by its confidence
  const scaled = {};
  let total = 0;
  for (const [key, base] of Object.entries(BASE_WEIGHTS)) {
    scaled[key] = base * confidence[key];
    total += scaled[key];
  }

  // Normalize so weights sum to 1.0
  const active = {};
  for (const [key, val] of Object.entries(scaled)) {
    active[key] = total > 0 ? val / total : 0;
  }

  return { weights: active, confidence };
}

// --- Logging ---

function logRerankResults(scored, removed, weights, confidence) {
  console.log('\n========== RERANKING RESULTS ==========');
  console.log(`Scored ${scored.length} candidates, filtered out ${removed.length}`);
  console.log(`Field confidence: ${Object.entries(confidence).map(([k, c]) => `${k}=${c.toFixed(1)}`).join(' ')}`);
  console.log(`Active weights:   ${Object.entries(weights).filter(([, w]) => w > 0).map(([k, w]) => `${k}=${w.toFixed(2)}`).join(' ')}`);

  if (removed.length > 0) {
    console.log('\n  Hard-filtered:');
    for (const r of removed) {
      console.log(`    [REMOVED] "${r.title}" — matched constraint: "${r.reason}"`);
    }
  }

  console.log('\n  Top candidates:');
  const top = scored.slice(0, 10);
  for (let i = 0; i < top.length; i++) {
    const { candidate, scores, totalScore } = top[i];
    console.log(`    #${i + 1} [${totalScore.toFixed(3)}] ${candidate.title} (${candidate.price || 'no price'})`);
    console.log(`        budget=${scores.budgetFit.toFixed(2)} interest=${scores.interestMatch.toFixed(2)} aesthetic=${scores.aestheticMatch.toFixed(2)} search=${scores.searchRelevance.toFixed(2)} complete=${scores.dataCompleteness.toFixed(2)} personality=${scores.personalityMatch.toFixed(2)}`);
  }
  console.log('========================================\n');
}

// --- Matched attribute collection ---

function collectMatchedAttributes(text, tasteProfile) {
  const matches = [];
  for (const interest of (tasteProfile.interests || [])) {
    if (textContainsTerm(text, interest))
      matches.push({ label: interest, category: 'interest' });
  }
  for (const style of (tasteProfile.aesthetic?.style || [])) {
    if (textContainsTerm(text, style))
      matches.push({ label: style, category: 'aesthetic' });
  }
  for (const trait of (tasteProfile.personality?.traits || [])) {
    if (textContainsTerm(text, trait))
      matches.push({ label: trait, category: 'personality' });
  }
  if (tasteProfile.budget) {
    const { min, max } = tasteProfile.budget;
    const price = parseFloat(text.match(/\$[\d,.]+/)?.[0]?.replace(/[$,]/g, ''));
    if (price && min && max && price >= min && price <= max) {
      matches.push({ label: 'Within budget', category: 'budget' });
    }
  }
  if (tasteProfile.giftingContext?.leanToward) {
    if (textContainsTerm(text, tasteProfile.giftingContext.leanToward))
      matches.push({ label: tasteProfile.giftingContext.leanToward, category: 'context' });
  }
  return matches;
}

// --- Main export ---

export function rerankCandidates(candidates, tasteProfile) {
  const { budget, interests, aesthetic, personality, constraints, giftingContext } = tasteProfile;
  const { weights, confidence } = computeActiveWeights(tasteProfile);

  // Phase 1: Hard filter on constraints + avoidCategories
  const filtered = [];
  const removed = [];
  for (const candidate of candidates) {
    const text = buildSearchableText(candidate);
    const result = checkHardFilters(text, constraints || [], giftingContext?.avoidCategories || []);
    if (result.pass) {
      filtered.push(candidate);
    } else {
      removed.push({ title: candidate.title, reason: result.reason });
    }
  }

  // Phase 2: Score each surviving candidate
  const scored = filtered.map(candidate => {
    const text = buildSearchableText(candidate);

    const scores = {
      budgetFit:        scoreBudgetFit(candidate, budget || {}),
      interestMatch:    scoreInterestMatch(text, interests || []),
      aestheticMatch:   scoreAestheticMatch(text, aesthetic || { style: [], avoids: [] }),
      searchRelevance:  candidate.searchScore || 0,
      dataCompleteness: scoreDataCompleteness(candidate),
      personalityMatch: scorePersonalityMatch(text, personality || {}, giftingContext || {}),
    };

    const totalScore =
      scores.budgetFit        * weights.budgetFit +
      scores.interestMatch    * weights.interestMatch +
      scores.aestheticMatch   * weights.aestheticMatch +
      scores.searchRelevance  * weights.searchRelevance +
      scores.dataCompleteness * weights.dataCompleteness +
      scores.personalityMatch * weights.personalityMatch;

    return { candidate, scores, totalScore };
  });

  // Phase 3: Sort descending
  scored.sort((a, b) => b.totalScore - a.totalScore);

  logRerankResults(scored, removed, weights, confidence);

  // Attach relevanceScore and matchedAttributes, return sorted candidates
  return scored.map(({ candidate, totalScore }) => {
    candidate.relevanceScore = Math.round(totalScore * 1000) / 1000;
    const text = buildSearchableText(candidate);
    candidate.matchedAttributes = collectMatchedAttributes(text, tasteProfile);
    return candidate;
  });
}
