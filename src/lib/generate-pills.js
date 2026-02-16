// ── Pill generation for product recommendation cards ──
// Generates up to 3 concise, non-redundant pills that explain
// WHY a product was picked, using data already in the taste profile
// and match metadata from the pruner. Zero additional API calls.

const MAX_PILLS = 3;

const CANONICAL_PERSONALITY_LABELS = new Set([
  'Self-Care', 'Experiential', 'Practical', 'Premium',
  'Sentimental', 'Unique', 'Thoughtful', 'Indulgent', 'Adventurous',
]);

// Maps leanToward keywords and personality traits → canonical labels
const PERSONALITY_MAP = {
  // leanToward mappings
  'experiential': 'Experiential',
  'experience': 'Experiential',
  'experiences': 'Experiential',
  'practical': 'Practical',
  'useful': 'Practical',
  'premium': 'Premium',
  'luxury': 'Premium',
  'luxurious': 'Premium',
  'high-end': 'Premium',
  'splurge': 'Indulgent',
  'indulgent': 'Indulgent',
  'indulge': 'Indulgent',
  'never buys herself': 'Indulgent',
  'treat': 'Indulgent',
  'sentimental': 'Sentimental',
  'meaningful': 'Sentimental',
  'personal': 'Sentimental',
  'unique': 'Unique',
  'unusual': 'Unique',
  'one of a kind': 'Unique',
  'thoughtful': 'Thoughtful',
  'self-care': 'Self-Care',
  'self care': 'Self-Care',
  'pampering': 'Self-Care',
  'pamper': 'Self-Care',
  'adventurous': 'Adventurous',
  'adventure': 'Adventurous',
};

// Quality signal keywords → display labels
const QUALITY_KEYWORDS = [
  { pattern: /\bhandcrafted\b/i, label: 'Handcrafted' },
  { pattern: /\bhandmade\b/i, label: 'Handmade' },
  { pattern: /\bartisan(?:al)?\b/i, label: 'Artisan' },
  { pattern: /\borganic\b/i, label: 'Organic' },
  { pattern: /\bsustainable\b/i, label: 'Sustainable' },
  { pattern: /\bethically\s+sourced\b/i, label: 'Ethically Sourced' },
  { pattern: /\bfair\s+trade\b/i, label: 'Fair Trade' },
  { pattern: /\bvegan\b/i, label: 'Vegan' },
  { pattern: /\bcruelty[\s-]*free\b/i, label: 'Cruelty-Free' },
  { pattern: /\beco[\s-]*friendly\b/i, label: 'Eco-Friendly' },
  { pattern: /\bsmall[\s-]*batch\b/i, label: 'Small-Batch' },
];

// ── Helpers ──

function titleCase(str) {
  return str
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

/** Single-token interest that already appears in the title → redundant */
function isRedundant(interest, titleTokens) {
  const tokens = tokenize(interest);
  if (tokens.length !== 1) return false;
  return titleTokens.includes(tokens[0]);
}

/** Scan description for quality signal keywords, return first match label */
function findQualitySignal(description) {
  if (!description) return null;
  for (const { pattern, label } of QUALITY_KEYWORDS) {
    if (pattern.test(description)) return label;
  }
  return null;
}

/** Budget pill label based on fit score */
function getBudgetLabel(priceValue, budgetFit, budget) {
  if (priceValue === null) return null;
  if (!budget || (budget.min === null && budget.max === null)) return null;
  if (budgetFit >= 0.8) return 'In Budget';
  if (budgetFit >= 0.5) return 'Sweet Spot';
  return null;
}

/** Map taste profile personality/context to a canonical label */
function getPersonalityLabel(tasteProfile) {
  const sources = [];

  // Check leanToward
  const lean = tasteProfile.giftingContext?.leanToward;
  if (lean) sources.push(lean.toLowerCase());

  // Check personality traits
  const traits = tasteProfile.personality?.traits || [];
  for (const trait of traits) {
    sources.push(trait.toLowerCase());
  }

  // Try direct map first
  for (const source of sources) {
    if (PERSONALITY_MAP[source]) return PERSONALITY_MAP[source];
  }

  // Try substring match for multi-word leanToward values
  for (const source of sources) {
    for (const [key, label] of Object.entries(PERSONALITY_MAP)) {
      if (source.includes(key)) return label;
    }
  }

  // Try if any trait IS a canonical label directly
  for (const trait of traits) {
    const cased = titleCase(trait);
    if (CANONICAL_PERSONALITY_LABELS.has(cased)) return cased;
  }

  return null;
}

// ── Main export ──

/**
 * Generate up to 3 pills for a product, explaining why it was recommended.
 *
 * @param {Object} product - Enriched product with _matchMeta from pruner
 * @param {Object} tasteProfile - The user's taste profile
 * @returns {{ label: string, category: string }[]}
 */
export function generatePills(product, tasteProfile) {
  const pills = [];
  const meta = product._matchMeta || {};
  const titleTokens = tokenize(product.title);

  // 1. Interest pill — best non-redundant interest match
  const matchedInterests = meta.matchedInterests || [];
  // Sort by token count descending (longer = more specific = better)
  const sorted = [...matchedInterests].sort(
    (a, b) => tokenize(b).length - tokenize(a).length
  );
  for (const interest of sorted) {
    if (!isRedundant(interest, titleTokens)) {
      pills.push({ label: titleCase(interest), category: 'interest' });
      break;
    }
  }

  // 2. Aesthetic pill — first matched style term
  const matchedAesthetics = meta.matchedAesthetics || [];
  if (matchedAesthetics.length > 0 && pills.length < MAX_PILLS) {
    pills.push({ label: titleCase(matchedAesthetics[0]), category: 'aesthetic' });
  }

  // 3. Quality signal — keyword scan on description
  if (pills.length < MAX_PILLS) {
    const qualityLabel = findQualitySignal(product.description);
    if (qualityLabel) {
      pills.push({ label: qualityLabel, category: 'context' });
    }
  }

  // 4. Budget pill — only if user provided budget and product fits
  if (pills.length < MAX_PILLS) {
    const budgetLabel = getBudgetLabel(
      meta.priceValue, meta.budgetFit, tasteProfile.budget
    );
    if (budgetLabel) {
      pills.push({ label: budgetLabel, category: 'budget' });
    }
  }

  // 5. Personality pill — last resort, canonical label
  if (pills.length < MAX_PILLS) {
    const personalityLabel = getPersonalityLabel(tasteProfile);
    if (personalityLabel) {
      pills.push({ label: personalityLabel, category: 'personality' });
    }
  }

  return pills.slice(0, MAX_PILLS);
}
