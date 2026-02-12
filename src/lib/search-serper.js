const SERPER_API_KEY = process.env.Serper_API_KEY;
const SERPER_ENDPOINT = 'https://google.serper.dev/shopping';

export async function executeSerperQueries(deepQueries) {
  const { queries } = deepQueries;

  console.log('\n========== SERPER QUERIES ==========');
  console.log(queries.map(q => q.q));
  console.log('====================================\n');

  const results = await Promise.all(
    queries.map(async (query) => {
      const response = await fetch(SERPER_ENDPOINT, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query.q,
          num: 10,
        }),
      });

      if (!response.ok) {
        console.error(`Serper query failed for "${query.q}": ${response.status} ${response.statusText}`);
        return { query: query.q, shopping: [], error: response.statusText };
      }

      const data = await response.json();
      return { query: query.q, ...data };
    })
  );

  console.log('\n========== SERPER RESULTS ==========');
  for (const result of results) {
    console.log(`\n--- Query: "${result.query}" ---`);
    if (result.error) {
      console.log(`  ERROR: ${result.error}`);
      continue;
    }
    const shopping = result.shopping || [];
    console.log(`  ${shopping.length} shopping results:`);
    for (const item of shopping) {
      console.log(`    - ${item.title}`);
      console.log(`      ${item.link}`);
      console.log(`      Price: ${item.price} | Source: ${item.source}`);
      if (item.imageUrl) {
        console.log(`      Image: ${item.imageUrl}`);
      }
    }
  }
  console.log('\n====================================\n');

  return results;
}
