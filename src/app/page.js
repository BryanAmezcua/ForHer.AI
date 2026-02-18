'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichSummary } from '@/components/RichSummary';
import { GiftCard } from '@/components/GiftCard';
import { GiftCardSkeleton } from '@/components/GiftCardSkeleton';

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

const THINKING_STEPS = [
  "Reading between the lines...",
  "Searching for the perfect gifts...",
  "Curating your picks...",
];

const POPULATING_MESSAGES = [
  "Checking real stores...",
  "Comparing prices and reviews...",
  "Finding the best options...",
  "Almost there...",
];

// Shallow-merge a patch into the taste profile (one level deep for nested objects)
function patchProfile(profile, patch) {
  const result = { ...profile };
  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(value) && Array.isArray(result[key])) {
      // Merge arrays (e.g. interests)
      result[key] = [...result[key], ...value];
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = { ...result[key], ...value };
    } else {
      result[key] = value;
    }
  }
  return result;
}

function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="text-copper mx-auto mb-3 opacity-70">
      <path
        d="M10 0C10 6 14 10 20 10C14 10 10 14 10 20C10 14 6 10 0 10C6 10 10 6 10 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [phase, setPhase] = useState('input');
  const [recommendations, setRecommendations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [clarification, setClarification] = useState(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [populatingMsgIndex, setPopulatingMsgIndex] = useState(0);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Advance thinking steps on timers
  useEffect(() => {
    if (phase !== 'thinking') return;
    setThinkingStep(0);
    const t1 = setTimeout(() => setThinkingStep(1), 2500);
    const t2 = setTimeout(() => setThinkingStep(2), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // Cycle populating progress messages
  useEffect(() => {
    if (phase !== 'populating') return;
    setPopulatingMsgIndex(0);
    const interval = setInterval(() => {
      setPopulatingMsgIndex(i => (i + 1) % POPULATING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  const fetchRecommendations = async (profile) => {
    setPhase('thinking');
    setError(null);
    const skeletonTimer = setTimeout(() => setPhase('populating'), 5500);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasteProfile: profile }),
        signal: controller.signal,
      });
      const data = await res.json();
      clearTimeout(skeletonTimer);
      setRecommendations(data.recommendations);
      setMeta(data.meta);
      setTasteProfile(data.tasteProfile);
      setPhase('results');
    } catch (err) {
      clearTimeout(skeletonTimer);
      if (err.name === 'AbortError') return;
      console.error(err);
      setError({ type: 'network', profile });
      setPhase('error');
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setPhase('thinking');

    try {
      // Step 1: Generate taste profile (fast — ~1-2s)
      const res = await fetch('/api/taste-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });
      const { tasteProfile: profile } = await res.json();
      setTasteProfile(profile);

      // Step 2: Check if clarification is needed
      if (profile.clarification) {
        setClarification(profile.clarification);
        setPhase('clarifying');
        return;
      }

      // Step 3: Description is rich enough — run full pipeline
      await fetchRecommendations(profile);
    } catch (err) {
      console.error(err);
      setPhase('input');
    }
  };

  const handleClarificationSelect = async (option) => {
    const patched = patchProfile(tasteProfile, option.patch);
    patched.clarification = null;
    setTasteProfile(patched);
    setClarification(null);
    await fetchRecommendations(patched);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartOver = () => {
    if (abortRef.current) abortRef.current.abort();
    setInput('');
    setRecommendations([]);
    setMeta(null);
    setTasteProfile(null);
    setClarification(null);
    setError(null);
    setPhase('input');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleRetry = () => {
    if (error?.profile) {
      fetchRecommendations(error.profile);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18] relative overflow-hidden">
      {/* Subtle grain texture */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* ==================== INPUT PHASE ==================== */}
        {phase === 'input' && (
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-16 pb-10 relative">
            {/* Warm radial glow */}
            <div
              className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(200,149,108,0.05) 0%, transparent 70%)' }}
            />

            <header className="text-center mb-14 animate-fade-up relative">
              <BrandMark />
              <h1 className="text-3xl sm:text-[2.6rem] font-bold text-foreground tracking-tight leading-none">
                Gift Finder
              </h1>
              <p className="text-lg text-muted-foreground italic mt-1.5 tracking-wide font-normal">
                for her
              </p>
            </header>

            <section className="text-center animate-fade-up relative" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl sm:text-[1.6rem] font-semibold text-foreground mb-2">
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
                className="w-full min-h-[140px] bg-white/[0.05] border-[1.5px] border-border rounded-2xl px-6 py-5 text-base leading-relaxed text-foreground placeholder:text-warm-gray/60 placeholder:transition-opacity placeholder:duration-400 focus:placeholder:opacity-40 focus-visible:border-copper focus-visible:ring-copper/30 shadow-[0_2px_20px_rgba(0,0,0,0.3)] resize-y transition-all duration-300 mb-4"
              />

              <div className="flex gap-3 justify-center flex-wrap mb-8">
                {SOFT_PROMPTS.map((p, i) => (
                  <span
                    key={i}
                    className="text-xs text-warm-gray bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-border"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="bg-copper hover:bg-copper/90 text-white font-semibold text-[15px] rounded-xl px-9 py-6 shadow-[0_4px_16px_rgba(200,149,108,0.25)] transition-all duration-300 tracking-wide disabled:opacity-40 disabled:cursor-default"
              >
                Find her something wonderful
              </Button>

              <p className="text-xs text-muted-foreground/60 mt-5 tracking-wide">
                No sign-up. No spam. Just a good gift.
              </p>
            </section>

            <footer className="text-center mt-16 pt-6 animate-fade-up relative" style={{ animationDelay: '0.4s' }}>
              <p className="text-sm text-muted-foreground/60 italic tracking-wide">
                You got this. She&apos;s going to love it.
              </p>
            </footer>
          </div>
        )}

        {/* ==================== THINKING PHASE ==================== */}
        {phase === 'thinking' && (
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-16 pb-10">
            <section className="text-center py-20 animate-fade-up">
              <BrandMark />
              <p className="text-xl font-semibold text-foreground mb-10">
                Finding something she&apos;ll love...
              </p>

              {/* Multi-step progress */}
              <div className="flex flex-col items-center gap-5">
                {THINKING_STEPS.map((step, i) => {
                  const isActive = i === thinkingStep;
                  const isDone = i < thinkingStep;
                  const isPending = i > thinkingStep;

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 transition-all duration-700 ${
                        isPending ? 'opacity-25' : 'opacity-100'
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                          isDone
                            ? 'bg-copper'
                            : isActive
                              ? 'border-[1.5px] border-copper animate-pulse-ring'
                              : 'border-[1.5px] border-warm-gray/40'
                        }`}
                      />
                      <span
                        className={`text-sm transition-colors duration-500 ${
                          isActive
                            ? 'text-foreground'
                            : isDone
                              ? 'text-copper'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ==================== CLARIFYING PHASE ==================== */}
        {phase === 'clarifying' && clarification && (
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10">
            {/* Compact header */}
            <header className="text-center mb-8 sm:mb-10">
              <BrandMark />
              <h1 className="text-2xl sm:text-[2.2rem] font-bold text-foreground tracking-tight leading-none">
                Gift Finder
              </h1>
              <p className="text-sm text-muted-foreground italic mt-1 tracking-wide font-normal">
                for her
              </p>
            </header>

            {/* User's input shown as read-only context */}
            <div className="bg-white/[0.04] border border-border/50 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-foreground/50 leading-relaxed mb-5 sm:mb-6 line-clamp-3">
              {input}
            </div>

            {/* Clarification card */}
            <div className="animate-fade-up bg-white/[0.06] backdrop-blur-md border border-border rounded-2xl p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              <div className="text-center mb-5 sm:mb-6">
                <span className="text-lg text-copper mb-3 inline-block">&mdash;</span>
                <p className="text-[15px] sm:text-base font-semibold text-foreground mb-1.5">
                  One quick thing&hellip;
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {clarification.question}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
                {clarification.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleClarificationSelect(opt)}
                    className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/[0.08] border border-border text-sm font-medium text-foreground hover:bg-white/[0.14] hover:border-copper/40 hover:text-copper active:scale-[0.97] transition-all duration-300 cursor-pointer animate-fade-up"
                    style={{ animationDelay: `${0.15 + i * 0.1}s` }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== POPULATING PHASE ==================== */}
        {phase === 'populating' && (
          <div className="animate-fade-up">
            {/* ── Nav bar (matches results layout) ── */}
            <nav className="max-w-[1100px] mx-auto flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50">
              <button
                onClick={handleStartOver}
                className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">New Search</span>
              </button>
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
                Gift Finder &middot; For Her
              </span>
              <span className="w-4" />
            </nav>

            {/* ── Main content ── */}
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10 pb-16">
              {/* Heading skeleton */}
              <div className="text-center mb-12">
                <div className="h-3 w-32 rounded-full bg-border/50 animate-pulse mx-auto mb-4" />
                <div className="h-8 w-56 rounded-full bg-border/60 animate-pulse mx-auto mb-4" />
                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="h-3.5 w-full rounded-full bg-border/40 animate-pulse" />
                  <div className="h-3.5 w-3/4 rounded-full bg-border/40 animate-pulse mx-auto" />
                </div>
                {/* Progress message */}
                <p key={populatingMsgIndex} className="text-sm text-muted-foreground mt-6 animate-fade-up">
                  {POPULATING_MESSAGES[populatingMsgIndex]}
                </p>
              </div>

              {/* ── Skeleton cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                {[0, 1, 2, 3, 4].map(i => (
                  <GiftCardSkeleton key={i} index={i} isTopPick={i === 0} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ERROR PHASE ==================== */}
        {phase === 'error' && (
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-16 pb-10">
            <section className="text-center py-20 animate-fade-up">
              <BrandMark />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Something didn&apos;t go as planned
              </h2>
              <p className="text-sm text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
                We hit a snag while finding gifts. This usually resolves quickly &mdash; worth another shot.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 rounded-xl bg-copper text-white text-sm font-semibold cta-hover active:scale-[0.98] cursor-pointer"
                >
                  Try again
                </button>
                <button
                  onClick={handleStartOver}
                  className="px-6 py-3 rounded-xl bg-white/[0.08] border border-border text-sm font-medium text-foreground hover:bg-white/[0.14] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Start over
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ==================== RESULTS PHASE ==================== */}
        {phase === 'results' && (
          <div className="animate-fade-up">
            {/* ── Nav bar ── */}
            <nav className="max-w-[1100px] mx-auto flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50">
              <button
                onClick={handleStartOver}
                className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">New Search</span>
              </button>
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
                Gift Finder &middot; For Her
              </span>
              <span className="w-4" />
            </nav>

            {/* ── Main content ── */}
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

              {/* ── Product cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                {recommendations.map((gift, i) => (
                  <GiftCard key={i} gift={gift} index={i} isTopPick={i === 0} />
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
