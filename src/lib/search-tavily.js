import tvly from './tavily';

export async function executeQueries(giftQueries) {
  const { queries } = giftQueries;

  const results = await Promise.all(
    queries.map(async (query) => {
      const response = await tvly.search(query.q, {
        searchDepth: 'basic',
        maxResults: 3,
      });
      return response.results;
    })
  );

  // Flatten all results into one array
  const allResults = results.flat();

  // Deduplicate by URL, keeping the highest-scoring instance
  const bestByUrl = new Map();
  for (const result of allResults) {
    const existing = bestByUrl.get(result.url);
    if (!existing || result.score > existing.score) {
      bestByUrl.set(result.url, result);
    }
  }

  // Sort by score descending, return clean objects
  return Array.from(bestByUrl.values())
    .sort((a, b) => b.score - a.score)
    .map(({ title, url, content, score }) => ({ title, url, content, score }));
}
