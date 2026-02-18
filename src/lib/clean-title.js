const MAX_LENGTH = 60;

/**
 * Clean a product title for display. Strips common e-commerce junk
 * using structural patterns (not word blocklists).
 *
 * @param {string} raw - The raw product title
 * @returns {string} Cleaned title, max ~60 characters
 */
export function cleanTitle(raw) {
  if (!raw) return '';
  let t = raw;

  // 1. Strip leading ALL-CAPS brand prefix (e.g., "YITAHOME Women's..." → "Women's...")
  //    Matches 1-4 uppercase words at the start followed by a regular-case word
  t = t.replace(/^(?:[A-Z][A-Z0-9&.'-]+\s+){1,4}(?=[A-Z][a-z])/, '');

  // 2. Strip trailing parenthesized content: "(Camel)", "(Pack of 3)", "(2025 Release)"
  t = t.replace(/\s*\([^)]{1,40}\)\s*$/, '');

  // 3. Strip trailing comma-separated people/occasion lists:
  //    "for Mom, Wife, Girlfriend, Sister, ..." or "Birthday, Christmas, Valentine's Day, ..."
  //    Pattern: 3+ comma-separated capitalized phrases at the end
  t = t.replace(/,?\s+(?:for\s+)?(?:[A-Z][a-z']+(?:\s+[A-Z][a-z']+)*(?:,\s*|\s+and\s+|\s*&\s*)){2,}[A-Z][a-z']+(?:\s+[A-Z][a-z']+)*\s*$/, '');

  // 4. Strip trailing "for Her/Him/Women/Men/Mom/..." recipient phrase
  t = t.replace(/\s*[-–—,]\s*(?:Perfect\s+)?(?:Gift\s+)?[Ff]or\s+\w+(?:\s+\w+){0,3}$/, '');

  // 5. Strip trailing size/dimension specs: "Size 5-10", "12 x 8 Inches", "100ml"
  t = t.replace(/\s*[-–—,]\s*(?:Size\s+)?(?:\d+(?:\.\d+)?\s*(?:x\s*\d+(?:\.\d+)?\s*)*(?:ml|oz|inch(?:es)?|cm|mm|ft|lb|lbs|ct|fl\.?\s*oz|g|kg|L)\b).*$/i, '');

  // 6. Strip trailing " - Brand Name" or " | Brand Name" suffixes
  t = t.replace(/\s*[|–—-]\s*[^|–—-]{1,30}$/, '');

  // 7. Collapse extra whitespace
  t = t.replace(/\s+/g, ' ').trim();

  // 8. Truncate at word boundary near MAX_LENGTH
  if (t.length > MAX_LENGTH) {
    const truncated = t.slice(0, MAX_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');
    t = (lastSpace > MAX_LENGTH * 0.5 ? truncated.slice(0, lastSpace) : truncated).trimEnd();

    // Remove trailing punctuation fragments
    t = t.replace(/[\s,;:\-–—]+$/, '');
  }

  return t || raw.slice(0, MAX_LENGTH).trim();
}
