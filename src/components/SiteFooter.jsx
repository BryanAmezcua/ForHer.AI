'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LANDING_PAGES } from '@/lib/landing-pages';

const VISIBLE_ON_MOBILE = 6;

const footerLinks = Object.entries(LANDING_PAGES).map(([slug, page]) => ({
  href: `/${slug}`,
  label: page.seo.h1.replace(/ — AI-Curated Picks$/, ''),
}));

export function SiteFooter() {
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="bg-[#151311] border-t border-border/20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="shrink-0">
            <a href="/" className="text-sm font-semibold text-foreground hover:text-copper transition-colors">
              GiftHer.ai
            </a>
            <p className="text-xs text-warm-gray mt-1">AI-powered gift finder</p>
            {session?.user ? (
              <a
                href="/dashboard"
                className="text-xs text-warm-gray hover:text-copper transition-colors mt-2 inline-block"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/auth/signin"
                className="text-xs text-warm-gray hover:text-copper transition-colors mt-2 inline-block"
              >
                Sign in
              </a>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-warm-gray-light uppercase tracking-wider mb-3">
              Popular Searches
            </p>
            {/* Desktop: multi-column grid, always visible */}
            <ul className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1.5">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs text-warm-gray hover:text-copper transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {/* Mobile: truncated list with toggle */}
            <ul className="sm:hidden space-y-1.5">
              {footerLinks.slice(0, expanded ? footerLinks.length : VISIBLE_ON_MOBILE).map(link => (
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
            {footerLinks.length > VISIBLE_ON_MOBILE && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="sm:hidden mt-2 text-xs text-copper hover:text-copper/80 transition-colors cursor-pointer"
              >
                {expanded ? 'Show less' : `Show all (${footerLinks.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
