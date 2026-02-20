import Script from 'next/script';
import { Manrope } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata = {
  title: 'GiftHer.ai — Find the Perfect Gift for Her',
  description: 'Find the perfect gift for the women in your life',
  metadataBase: new URL('https://gifther.ai'),
  openGraph: {
    title: 'GiftHer.ai — Find the Perfect Gift for Her',
    description: 'Find the perfect gift for the women in your life',
    siteName: 'GiftHer.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GiftHer.ai — Find the Perfect Gift for Her',
    description: 'Find the perfect gift for the women in your life',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-display antialiased`}>
        {children}
        <SiteFooter />
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="e3e7950b-7d36-4497-ae8a-aab5380a6bc4"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
