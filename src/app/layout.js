import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata = {
  title: 'ForHer.AI — Gift Finder',
  description: 'Find the perfect gift for the women in your life',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-display antialiased`}>
        {children}
      </body>
    </html>
  );
}
