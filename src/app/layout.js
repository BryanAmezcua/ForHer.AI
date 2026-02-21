import Script from 'next/script';
import { Manrope } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { AuthProvider } from '@/components/AuthProvider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata = {
  title: 'GiftHer.ai — Find the Perfect Gift for Her',
  description:
    'AI-powered gift recommendations for the women in your life. Describe her personality and interests \u2014 we\u2019ll find gifts she\u2019ll actually love.',
  metadataBase: new URL('https://gifther.ai'),
  themeColor: '#1a1816',
  openGraph: {
    title: 'GiftHer.ai — Find the Perfect Gift for Her',
    description:
      'AI-powered gift recommendations for the women in your life. Describe her personality and interests \u2014 we\u2019ll find gifts she\u2019ll actually love.',
    siteName: 'GiftHer.ai',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GiftHer.ai — Find the Perfect Gift for Her' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GiftHer.ai — Find the Perfect Gift for Her',
    description:
      'AI-powered gift recommendations for the women in your life. Describe her personality and interests \u2014 we\u2019ll find gifts she\u2019ll actually love.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-display antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'GiftHer.ai',
                  url: 'https://gifther.ai',
                  logo: 'https://gifther.ai/icon.svg',
                  description:
                    'AI-powered gift recommendation engine that helps you find the perfect gift for the women in your life.',
                },
                {
                  '@type': 'WebSite',
                  name: 'GiftHer.ai',
                  url: 'https://gifther.ai',
                },
                {
                  '@type': 'WebApplication',
                  name: 'GiftHer.ai',
                  url: 'https://gifther.ai',
                  applicationCategory: 'ShoppingApplication',
                  operatingSystem: 'Any',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                  description:
                    'Describe the woman you\u2019re shopping for and get AI-curated gift recommendations from real products.',
                },
              ],
            }),
          }}
        />
        <AuthProvider>
          {children}
          <SiteFooter />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="e3e7950b-7d36-4497-ae8a-aab5380a6bc4"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
