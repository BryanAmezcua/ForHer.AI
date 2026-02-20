import { LANDING_PAGES } from '@/lib/landing-pages';

const footerLinks = Object.entries(LANDING_PAGES).map(([slug, page]) => ({
  href: `/${slug}`,
  label: page.seo.h1.replace(/ — AI-Curated Picks$/, ''),
}));

export function SiteFooter() {
  return (
    <footer className="bg-[#151311] border-t border-border/20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 flex items-start justify-between gap-6">
        <div>
          <a href="/" className="text-sm font-semibold text-foreground hover:text-copper transition-colors">
            GiftHer.ai
          </a>
          <p className="text-xs text-warm-gray mt-1">AI-powered gift finder</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-warm-gray-light uppercase tracking-wider mb-2">
            Popular Searches
          </p>
          <ul className="space-y-1.5">
            {footerLinks.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs text-warm-gray hover:text-copper transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
