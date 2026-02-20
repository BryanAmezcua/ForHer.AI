export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/s/'],
      },
    ],
    sitemap: 'https://gifther.ai/sitemap.xml',
  };
}
