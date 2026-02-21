'use client';

import { useState } from 'react';
import { RichSummary } from '@/components/RichSummary';
import { GiftCard } from '@/components/GiftCard';
import { SaveRecipientPrompt } from '@/components/SaveRecipientPrompt';

export function SessionResults({ rows, meta, sessionId, tasteProfile, isShared, onStartOver }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/s/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Nav bar */}
      <nav className="max-w-[1100px] mx-auto flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50">
        {isShared ? (
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors min-w-[44px] min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">New Search</span>
          </a>
        ) : (
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">New Search</span>
          </button>
        )}

        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
          GiftHer.ai
        </span>

        <div className="flex items-center gap-2">
          {!isShared && tasteProfile && (
            <SaveRecipientPrompt
              tasteProfile={tasteProfile}
              sessionId={sessionId}
            />
          )}

          {sessionId && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-copper/30"
            >
              {copied ? (
                <span className="text-copper text-xs font-medium">Copied!</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
                    <path d="M4 12V14H14V4H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>Share</span>
                </>
              )}
            </button>
          )}

          {!sessionId && !tasteProfile && <span className="w-4" />}
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Personalized heading */}
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 font-semibold">
            Personalized Selection
          </p>
          <h2 className="text-2xl sm:text-[2.2rem] font-bold text-foreground tracking-tight leading-tight mb-4">
            Curated for {meta?.curatedFor || 'her'}
          </h2>
          <RichSummary text={meta?.summary} />
        </div>

        {/* Product rows */}
        <div className="space-y-12 mb-16">
          {(rows || []).filter(row => row.recommendations?.length > 0).map((row, rowIdx) => (
            <section key={rowIdx}>
              <h3 className="text-lg font-semibold text-foreground mb-4">{row.heading}</h3>
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:mx-0 md:px-0 md:pb-0">
                {row.recommendations.map((gift, j) => (
                  <div key={j} className="snap-center shrink-0 w-[280px] md:w-auto">
                    <GiftCard gift={gift} index={j} isTopPick={j === 0} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Shared view CTA */}
        {isShared && (
          <div className="text-center">
            <a
              href="/"
              className="inline-block px-8 py-3.5 rounded-xl bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all duration-300 shadow-[0_4px_16px_rgba(200,149,108,0.25)]"
            >
              Find gifts for someone you know
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
