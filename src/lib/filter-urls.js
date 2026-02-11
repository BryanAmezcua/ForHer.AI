const BLOCKED_SEGMENTS = new Set([
  'collections', 'collection', 'categories', 'category', 'search',
  'blog', 'blogs', 'gift-ideas', 'gift-guide', 'gift-guides',
  'best', 'top', 'pages', 'sitemap', 'tag', 'tags',
  'editorial', 'magazine', 'roundup', 'roundups', 'guides', 'lists',
]);

const SEARCH_QUERY_PARAMS = ['q', 'search'];

export function filterProductUrls(searchResults) {
  const filtered = searchResults.filter(({ url }) => {
    try {
      const parsed = new URL(url);

      // Reject search result pages (?q= or ?search=)
      for (const param of SEARCH_QUERY_PARAMS) {
        if (parsed.searchParams.has(param)) return false;
      }

      // Reject URLs containing blocked path segments
      const segments = parsed.pathname.toLowerCase().split('/').filter(Boolean);
      for (const seg of segments) {
        if (BLOCKED_SEGMENTS.has(seg)) return false;
      }

      return true;
    } catch {
      // Malformed URL — keep it and let downstream handle it
      return true;
    }
  });

  const rejected = searchResults.length - filtered.length;
  console.log(`Filtered ${searchResults.length} → ${filtered.length} product URLs (${rejected} rejected)`);

  return filtered;
}
