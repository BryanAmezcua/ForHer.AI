import { LANDING_PAGE_SLUGS } from '@/lib/landing-pages';

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: 'https://gifther.ai',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...LANDING_PAGE_SLUGS.map(slug => ({
      url: `https://gifther.ai/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
