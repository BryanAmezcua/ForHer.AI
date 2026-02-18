import { ImageResponse } from 'next/og';

export const alt = 'GiftHer.ai — Find the Perfect Gift for Her';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
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
        }}
      >
        {/* Sparkle */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 20 20"
          style={{ marginBottom: 24, opacity: 0.7 }}
        >
          <path
            d="M10 0C10 6 14 10 20 10C14 10 10 14 10 20C10 14 6 10 0 10C6 10 10 6 10 0Z"
            fill="#c8956c"
          />
        </svg>
        {/* Brand name */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#f0ebe5', letterSpacing: '-0.02em' }}>
            Gift
          </span>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#c8956c', letterSpacing: '-0.02em' }}>
            Her
          </span>
          <span style={{ fontSize: 72, fontWeight: 400, color: '#8a8380', letterSpacing: '-0.02em' }}>
            .ai
          </span>
        </div>
        {/* Tagline */}
        <span style={{ fontSize: 24, color: '#8a8380', marginTop: 16, letterSpacing: '0.05em' }}>
          Find the perfect gift for her
        </span>
      </div>
    ),
    { ...size }
  );
}
