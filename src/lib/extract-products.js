import tvly from './tavily';
import { ProductCandidate } from './product-candidate';

const BATCH_SIZE = 10;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function safeExtract(urls) {
  try {
    return await tvly.extract(urls, {
      includeImages: true,
      extractDepth: 'basic',
      format: 'text',
      timeout: 60,
    });
  } catch (err) {
    console.warn(`Extract failed for batch: ${err.message}`);
    return { results: [] };
  }
}

function buildDescription(searchContent, rawContent) {
  if (searchContent && searchContent.length > 20) {
    return searchContent.slice(0, 300);
  }

  if (!rawContent) return null;

  const paragraphs = rawContent.split(/\n+/);
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (trimmed.length >= 40) {
      return trimmed.slice(0, 300);
    }
  }

  return null;
}

function extractPrice(rawContent) {
  if (!rawContent) return { price: null, priceValue: null };

  // Pattern 1: Contextual — price/sale/now keyword followed by $XX.XX
  const contextual = rawContent.match(/(?:price|sale|now|was|regular)\s*[:\s]*\$(\d{1,5}(?:\.\d{2})?)/i);
  if (contextual) {
    const value = parseFloat(contextual[1]);
    if (value > 0 && value < 50000) {
      return { price: `$${contextual[1]}`, priceValue: value };
    }
  }

  // Pattern 2: Standard decimal — $XX.XX
  const decimal = rawContent.match(/\$(\d{1,5}\.\d{2})/);
  if (decimal) {
    const value = parseFloat(decimal[1]);
    if (value > 0 && value < 50000) {
      return { price: `$${decimal[1]}`, priceValue: value };
    }
  }

  // Pattern 3: Whole dollar — $XX
  const whole = rawContent.match(/\$(\d{1,5})(?!\.\d)/);
  if (whole) {
    const value = parseFloat(whole[1]);
    if (value > 0 && value < 50000) {
      return { price: `$${whole[1]}`, priceValue: value };
    }
  }

  return { price: null, priceValue: null };
}

function pickBestImage(images) {
  if (!images || !Array.isArray(images) || images.length === 0) return null;

  const filtered = images.filter((img) => {
    const lower = img.toLowerCase();
    return (
      !lower.includes('logo') &&
      !lower.includes('icon') &&
      !lower.includes('favicon') &&
      !lower.endsWith('.svg') &&
      !lower.endsWith('.gif')
    );
  });

  return filtered.length > 0 ? filtered[0] : null;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export async function extractProducts(searchResults) {
  // Build lookup map from search results keyed by URL
  const searchMap = new Map();
  for (const result of searchResults) {
    searchMap.set(result.url, result);
  }

  // Collect all URLs and chunk into batches
  const allUrls = searchResults.map((r) => r.url);
  const batches = chunkArray(allUrls, BATCH_SIZE);

  // Extract all batches in parallel
  const extractResults = await Promise.all(batches.map((batch) => safeExtract(batch)));

  // Build extract lookup by URL
  const extractMap = new Map();
  for (const batch of extractResults) {
    if (batch.results) {
      for (const result of batch.results) {
        extractMap.set(result.url, result);
      }
    }
  }

  // Merge search data + extract data into ProductCandidates
  const candidates = [];
  for (const url of allUrls) {
    const search = searchMap.get(url);
    const extract = extractMap.get(url);

    if (!search || !search.title) continue;

    const rawContent = extract?.rawContent || null;
    const { price, priceValue } = extractPrice(rawContent);
    const images = extract?.images || [];

    try {
      const candidate = new ProductCandidate({
        title: search.title,
        url: search.url,
        description: buildDescription(search.content, rawContent),
        price,
        priceValue,
        imageUrl: pickBestImage(images),
        source: extractDomain(search.url),
        searchScore: search.score || 0,
        rawContent,
      });
      candidates.push(candidate);
    } catch {
      // Skip if title/url somehow missing
    }
  }

  return candidates;
}
