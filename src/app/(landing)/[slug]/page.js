import { notFound } from 'next/navigation';
import { LANDING_PAGES, LANDING_PAGE_SLUGS, getLandingPage } from '@/lib/landing-pages';
import { runPipeline } from '@/lib/pipeline';
import { GiftCard } from '@/components/GiftCard';

export const revalidate = 86400; // 24 hours

export function generateStaticParams() {
  return LANDING_PAGE_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};

  const { seo } = page;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      siteName: 'GiftHer.ai',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function LandingPage({ params }) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  const { seo, tasteProfile, faq, cta } = page;

  // Run the recommendation pipeline server-side with pre-defined taste profile
  let rows = [];
  try {
    const result = await runPipeline({ tasteProfile });
    rows = result.rows || [];
  } catch (err) {
    console.error(`[landing/${slug}] Pipeline error:`, err.message);
    // Graceful degradation — SEO content still renders without gift cards
  }

  const prefillParam = encodeURIComponent(cta);
  const allProducts = rows.flatMap(row => row.recommendations || []);

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18] relative overflow-hidden">
      {/* Grain texture */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="max-w-[1100px] mx-auto flex items-center justify-center px-4 sm:px-6 py-4 border-b border-border/50">
          <a href="/" className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground hover:text-foreground transition-colors">
            GiftHer.ai
          </a>
        </nav>

        {/* Hero */}
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(200,149,108,0.05) 0%, transparent 70%)' }}
          />
          <h1 className="text-2xl sm:text-[2.4rem] font-bold text-foreground tracking-tight leading-tight mb-4 relative">
            {seo.h1}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[600px] mx-auto relative">
            {seo.introText}
          </p>
        </div>

        {/* Gift grid */}
        {rows.length > 0 && (
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-6 pb-12">
            <div className="space-y-12">
              {rows.map((row, rowIdx) => (
                <section key={rowIdx}>
                  <h3 className="text-lg font-semibold text-foreground mb-4">{row.heading}</h3>
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:mx-0 md:px-0 md:pb-0">
                    {(row.recommendations || []).map((gift, j) => (
                      <div key={j} className="snap-center shrink-0 w-[280px] md:w-auto">
                        <GiftCard gift={gift} index={j} isTopPick={j === 0} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Personalize CTA */}
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            Want something more personal?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Tell us about her and we&apos;ll curate gifts just for her.
          </p>
          <a
            href={`/?prefill=${prefillParam}`}
            className="inline-block px-8 py-3.5 rounded-xl bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all duration-300 shadow-[0_4px_16px_rgba(200,149,108,0.25)] cta-hover"
          >
            Personalize your search
          </a>
        </div>

        {/* FAQ */}
        {faq.length > 0 && (
          <div className="max-w-[700px] mx-auto px-4 sm:px-6 pb-12">
            <h2 className="text-lg font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-white/[0.03] border border-border/30 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-foreground hover:text-copper transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <svg
                      className="w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center pb-16">
          <a
            href="/"
            className="text-sm text-copper hover:text-copper/80 transition-colors font-medium"
          >
            Try GiftHer.ai &rarr;
          </a>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              // BreadcrumbList
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gifther.ai' },
                  { '@type': 'ListItem', position: 2, name: seo.h1.replace(/ — AI-Curated Picks$/, '') },
                ],
              },
              // WebPage
              {
                '@type': 'WebPage',
                name: seo.h1,
                description: seo.description,
                url: seo.canonical,
              },
              // Products
              ...allProducts.map(gift => ({
                '@type': 'Product',
                name: gift.name,
                image: gift.imageUrl,
                ...(gift.url && {
                  offers: {
                    '@type': 'Offer',
                    price: gift.price ? gift.price.replace(/[^0-9.]/g, '') : undefined,
                    priceCurrency: 'USD',
                    url: gift.url,
                    availability: 'https://schema.org/InStock',
                  },
                }),
                ...(gift.rating && {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: gift.rating,
                  },
                }),
              })),
              // FAQPage
              ...(faq.length > 0
                ? [
                    {
                      '@type': 'FAQPage',
                      mainEntity: faq.map(item => ({
                        '@type': 'Question',
                        name: item.question,
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: item.answer,
                        },
                      })),
                    },
                  ]
                : []),
            ],
          }),
        }}
      />
    </main>
  );
}
