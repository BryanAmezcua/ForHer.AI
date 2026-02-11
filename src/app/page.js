'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichSummary } from '@/components/RichSummary';
import { GiftCard } from '@/components/GiftCard';

const PLACEHOLDER_EXAMPLES = [
  "My mom loves gardening and hates clutter. Her birthday is next week...",
  "Girlfriend, 28, obsessed with true crime podcasts and fancy coffee. Anniversary coming up, budget ~$75...",
  "My wife never buys anything for herself. She loves cooking and quiet mornings. Under $100...",
  "Grandma is 80 and doesn't need anything. She likes birds and crossword puzzles...",
  "She's my best friend, turning 30. Into yoga, travel, and anything matcha. Budget flexible...",
];

const SOFT_PROMPTS = [
  "What does she light up about?",
  "What would she never buy for herself?",
  "What's the occasion?",
];

export default function Home() {
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [phase, setPhase] = useState('input');
  const [recommendations, setRecommendations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tasteProfile, setTasteProfile] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setPhase('thinking');

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations);
      setMeta(data.meta);
      setTasteProfile(data.tasteProfile);
      setPhase('results');
    } catch (err) {
      console.error(err);
      setPhase('input');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartOver = () => {
    setInput('');
    setRecommendations([]);
    setMeta(null);
    setTasteProfile(null);
    setPhase('input');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-cream via-[#f5f0ea] to-[#ede5db] relative overflow-hidden">
      {/* Subtle grain texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* ==================== INPUT PHASE ==================== */}
        {phase === 'input' && (
          <div className="max-w-[680px] mx-auto px-6 pt-16 pb-10">
            <header className="text-center mb-14 animate-fade-up">
              <div className="text-2xl mb-3 opacity-50 text-taupe">&#9825;</div>
              <h1 className="text-[2.6rem] font-bold text-foreground tracking-tight leading-none">
                Gift Finder
              </h1>
              <p className="text-lg text-muted-foreground italic mt-1.5 tracking-wide font-normal">
                for her
              </p>
            </header>

            <section className="text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-[1.6rem] font-semibold text-foreground mb-2">
                Tell us about her.
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                As little or as much as you&apos;d like &mdash; we&apos;ll take it from here.
              </p>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                rows={5}
                className="w-full min-h-[140px] bg-white/65 border-[1.5px] border-border rounded-2xl px-6 py-5 text-base leading-relaxed text-foreground placeholder:text-taupe/60 placeholder:transition-opacity placeholder:duration-400 focus:placeholder:opacity-40 focus-visible:border-sage focus-visible:ring-sage/30 shadow-[0_2px_20px_rgba(170,145,110,0.06)] resize-y transition-all duration-300 mb-4"
              />

              <div className="flex gap-3 justify-center flex-wrap mb-8">
                {SOFT_PROMPTS.map((p, i) => (
                  <span
                    key={i}
                    className="text-xs text-taupe bg-white/50 px-3.5 py-1.5 rounded-full border border-border"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="bg-taupe hover:bg-taupe/90 text-white font-semibold text-[15px] rounded-xl px-9 py-6 shadow-[0_4px_16px_rgba(168,154,142,0.3)] transition-all duration-300 tracking-wide disabled:opacity-40 disabled:cursor-default"
              >
                Find her something wonderful
              </Button>

              <p className="text-xs text-muted-foreground/60 mt-5 tracking-wide">
                No sign-up. No spam. Just a good gift.
              </p>
            </section>

            <footer className="text-center mt-16 pt-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <p className="text-sm text-muted-foreground/60 italic tracking-wide">
                You got this. She&apos;s going to love it.
              </p>
            </footer>
          </div>
        )}

        {/* ==================== THINKING PHASE ==================== */}
        {phase === 'thinking' && (
          <div className="max-w-[680px] mx-auto px-6 pt-16 pb-10">
            <section className="text-center py-20 animate-fade-up">
              <div className="text-3xl text-sage mb-5 animate-spin-slow inline-block">&#10022;</div>
              <p className="text-xl font-semibold text-foreground mb-2">
                Finding something she&apos;ll love...
              </p>
              <p className="text-sm text-muted-foreground italic">
                Reading between the lines of what you told us
              </p>
            </section>
          </div>
        )}

        {/* ==================== RESULTS PHASE ==================== */}
        {phase === 'results' && (
          <div className="animate-fade-up">
            {/* ── Nav bar ── */}
            <nav className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-4 border-b border-border/50">
              <button
                onClick={handleStartOver}
                className="flex items-center gap-2 text-sm text-stone-soft hover:text-foreground transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">New Search</span>
              </button>
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
                Gift Finder &middot; For Her
              </span>
              <span className="text-lg opacity-40 text-taupe select-none">&#9825;</span>
            </nav>

            {/* ── Main content ── */}
            <div className="max-w-[1000px] mx-auto px-6 pt-10 pb-16">
              {/* Personalized heading */}
              <div className="text-center mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 font-semibold">
                  Personalized Selection
                </p>
                <h2 className="text-[2.2rem] font-bold text-foreground tracking-tight leading-tight mb-4">
                  Curated for {meta?.curatedFor || 'her'}
                </h2>
                <RichSummary text={meta?.summary} />
              </div>

              {/* ── Product cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {recommendations.map((gift, i) => (
                  <GiftCard key={i} gift={gift} index={i} />
                ))}
              </div>

              {/* ── Bottom refinement section ── */}
              {/* <div className="bg-[#f0ebe5]/60 rounded-2xl p-8 sm:p-10 text-center max-w-[740px] mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Not quite what you were looking for?
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  We can refine these results by learning more about her specific aesthetic
                  preferences or the occasion you&apos;re celebrating.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    variant="outline"
                    className="text-stone-soft border-border bg-white/60 hover:bg-white rounded-xl px-6 py-5 font-semibold text-sm cursor-pointer"
                  >
                    Adjust Preferences
                  </Button>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
