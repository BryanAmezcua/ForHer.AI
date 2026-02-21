import { ImageResponse } from 'next/og';
import { getLandingPage, LANDING_PAGE_SLUGS } from '@/lib/landing-pages';

export const alt = 'GiftHer.ai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return LANDING_PAGE_SLUGS.map(slug => ({ slug }));
}

export default async function OGImage({ params }) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  const headline = page?.seo?.h1?.replace(/ — AI-Curated Picks$/, '') || 'Find the Perfect Gift';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #1a1816 0%, #1e1b18 100%)',
          fontFamily: 'sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Sparkle */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 20 20"
          style={{ marginBottom: 20, opacity: 0.7 }}
        >
          <path
            d="M10 0C10 6 14 10 20 10C14 10 10 14 10 20C10 14 6 10 0 10C6 10 10 6 10 0Z"
            fill="#c8956c"
          />
        </svg>
        {/* Headline */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#f0ebe5',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          {headline}
        </div>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe5' }}>Gift</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#c8956c' }}>Her</span>
          <span style={{ fontSize: 28, fontWeight: 400, color: '#8a8380' }}>.ai</span>
        </div>
        {/* Tagline */}
        <span style={{ fontSize: 18, color: '#8a8380', marginTop: 10, letterSpacing: '0.05em' }}>
          AI-curated picks she'll actually love
        </span>
      </div>
    ),
    { ...size }
  );
}
