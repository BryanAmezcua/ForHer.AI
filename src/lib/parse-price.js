/**
 * Parse a price string like "$29.99" or "1,299.00" into a number.
 * Returns null if the string is empty or unparseable.
 */
export function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}
