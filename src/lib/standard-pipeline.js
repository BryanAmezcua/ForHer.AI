import { generateQueries } from './search-queries';
import { executeQueries } from './search-tavily';
import { extractProducts } from './extract-products';
import { filterProductUrls } from './filter-urls';
import { classifyCandidates } from './classify-candidates';
import { deduplicateCandidates } from './dedupe-candidates';
import { rerankCandidates } from './rerank-candidates';

/**
 * Runs the standard Tavily-based product discovery pipeline.
 * Generates queries → searches → filters → classifies → extracts → dedupes → reranks.
 * Returns the final ranked array of ProductCandidates.
 */
export async function runStandardPipeline(tasteProfile) {
  // Step 1: Generate search queries from taste profile
  const giftQueries = await generateQueries(tasteProfile);
  console.log('\n========== Gift Queries ==========');
  console.log(JSON.stringify(giftQueries, null, 2));
  console.log('====================================\n');

  // Step 2: Execute all queries in parallel via Tavily
  const searchResults = await executeQueries(giftQueries);

  // Step 3: Filter out non-product URLs
  const productUrls = filterProductUrls(searchResults);

  // Step 4: Classify candidates (score before expensive extraction)
  const classified = classifyCandidates(productUrls);

  // Step 5: Extract product data from URLs
  const rawCandidates = await extractProducts(classified);

  // Step 6: Deduplicate by URL and title
  const dedupedCandidates = deduplicateCandidates(rawCandidates);

  // Step 7: Rerank by confidence-weighted scoring
  const candidates = rerankCandidates(dedupedCandidates, tasteProfile);

  console.log('\n========== PRODUCT CANDIDATES ==========');
  console.log(`${candidates.length} candidates (${candidates.filter(c => c.isComplete).length} complete, ${candidates.filter(c => !!c.imageUrl).length} with images, ${candidates.filter(c => c.hasPrice).length} with price)`);
  console.log(JSON.stringify(candidates.map(c => ({
    title: c.title,
    source: c.source,
    price: c.price,
    hasImage: !!c.imageUrl,
    isComplete: c.isComplete,
  })), null, 2));
  console.log('=========================================\n');

  return candidates;
}
