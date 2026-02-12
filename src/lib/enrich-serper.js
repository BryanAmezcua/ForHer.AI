import tvly from './tavily';

/**
 * Enriches pruned Serper shopping products with merchant URLs and descriptions
 * via Tavily search. Runs 1 search per product (top result only).
 * Falls back to Google Shopping link if no Tavily result found.
 *
 * @param {Array} products - Pruned Serper shopping items
 * @returns {Array} Enriched products with merchantUrl and description
 */
export async function enrichProducts(products) {
  const enriched = await Promise.all(
    products.map(product => enrichOne(product))
  );

  const found = enriched.filter(p => p.merchantUrl !== p.link).length;
  console.log(`\n========== ENRICHMENT ==========`);
  console.log(`${enriched.length} products enriched (${found} merchant URLs found, ${enriched.length - found} fell back to Google Shopping link)`);
  for (const p of enriched) {
    const tag = p.merchantUrl !== p.link ? '' : ' [Google fallback]';
    console.log(`  - ${p.title}`);
    console.log(`    URL: ${p.merchantUrl}${tag}`);
    console.log(`    Desc: ${p.description ? p.description.substring(0, 100) + '...' : '(none)'}`);
  }
  console.log(`================================\n`);

  return enriched;
}

async function enrichOne(product) {
  const query = `${product.title} ${product.source}`;

  try {
    const response = await tvly.search(query, {
      searchDepth: 'basic',
      maxResults: 1,
    });

    const topResult = response.results?.[0];

    if (topResult) {
      return {
        ...product,
        merchantUrl: topResult.url,
        description: topResult.content || null,
      };
    }
  } catch (err) {
    console.error(`Enrichment failed for "${product.title}": ${err.message}`);
  }

  // Fallback: keep Google Shopping link, no description
  return {
    ...product,
    merchantUrl: product.link,
    description: null,
  };
}
