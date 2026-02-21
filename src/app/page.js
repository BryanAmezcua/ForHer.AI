'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GiftCardSkeleton } from '@/components/GiftCardSkeleton';
import { SessionResults } from '@/components/SessionResults';

const PLACEHOLDER_EXAMPLES = [
  "My mom loves gardening and hates clutter. Her birthday is next week...",
  "Girlfriend, 28, obsessed with skincare and fancy coffee. Anniversary coming up, budget ~$75...",
  "My wife never buys anything for herself. She loves cooking and scented candles. Under $100...",
  "Grandma is 80 and doesn't need anything. She likes birds and crossword puzzles...",
  "She's my best friend, turning 30. Into yoga, travel, and anything matcha. Budget flexible...",
];

const PERSONA_PRESETS = [
  {
    label: "Her birthday's coming up",
    prefill: "It's my sister's birthday. She's into fitness, knitting, and cycling. She's in her late 20s and I want to get her something she'll actually use.",
  },
  {
    label: "Something for Mom",
    prefill: "I want to get my mom something special. She loves cooking Italian food and spends every weekend in her garden. She always says she doesn't need anything.",
  },
  {
    label: "For my girlfriend",
    prefill: "Looking for a gift for my girlfriend. She's really into skincare, yoga, and specialty coffee. I want to get her something she'll really like.",
  },
];

const BUDGET_PRESETS = [
  { label: "Under $50", append: " I'd like to keep it under $50." },
  { label: "$50\u2013$100", append: " My budget is around $50 to $100." },
  { label: "Over $100", append: " I'm willing to spend over $100 for the right gift." },
];

// Detect male-recipient keywords (with common variations)
const MALE_RECIPIENT_RE = /\b(man|men|dad|daddy|dads|father|papa|husband|hubby|husbands|son|sons|brother|bro|brothers|bros|male|males|grandfather|grandpa|granddad|grandad|grandson|nephew|uncle|boyfriend)\b/i;

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

function HomeInner() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(() => {
    return ''; // hydration-safe; prefill applied in useEffect
  });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [phase, setPhase] = useState('input');
  const [presetStep, setPresetStep] = useState('persona'); // 'persona' | 'budget' | 'done'
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [populatingMsgIndex, setPopulatingMsgIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Pre-fill from ?prefill= URL param (landing page deep-link)
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill) {
      setInput(prefill);
      setPresetStep('done');
    }
  }, [searchParams]);

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
      setPopulatingMsgIndex(i => {
        if (i >= POPULATING_MESSAGES.length - 1) {
          clearInterval(interval);
          return i;
        }
        return i + 1;
      });
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
      setRows(data.rows);
      setMeta(data.meta);
      setTasteProfile(data.tasteProfile);
      if (data.sessionId) {
        setSessionId(data.sessionId);
        window.history.replaceState(null, '', '/s/' + data.sessionId);
      }
      setPhase('results');
    } catch (err) {
      clearTimeout(skeletonTimer);
      if (err.name === 'AbortError') return;
      console.error(err);
      setError({ type: 'network', profile });
      setPhase('error');
    }
  };

  const startProfileFetch = () => {
    return fetch('/api/taste-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: input }),
    }).then(r => r.json()).then(d => d.tasteProfile);
  };

  const hasMaleRecipient = MALE_RECIPIENT_RE.test(input);

  const handleSubmit = async () => {
    if (!input.trim() || hasMaleRecipient) return;
    setPhase('thinking');
    try {
      const profile = await startProfileFetch();
      setTasteProfile(profile);
      await fetchRecommendations(profile);
    } catch (err) {
      console.error(err);
      setPhase('input');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!hasMaleRecipient) handleSubmit();
    }
  };

  const handleStartOver = () => {
    if (abortRef.current) abortRef.current.abort();
    setInput('');
    setPresetStep('persona');
    setRows([]);
    setMeta(null);
    setTasteProfile(null);
    setSessionId(null);
    setError(null);
    setPhase('input');
    window.history.replaceState(null, '', '/');
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
              <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-tight leading-none">
                <span className="text-foreground">Gift</span><span className="text-copper">Her</span>
              </h1>
            </header>

            <section className="text-center animate-fade-up relative" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl sm:text-[1.6rem] font-semibold text-foreground mb-2">
                Curated gifts for her.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-8">
                Tell us as little or as much as you&apos;d like &mdash; we&apos;ll take it from here.
              </p>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  const val = e.target.value;
                  setInput(val);
                  if (!val.trim()) setPresetStep('persona');
                }}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                rows={5}
                className="w-full min-h-[140px] bg-white/[0.05] border-[1.5px] border-border rounded-2xl px-6 py-5 text-base leading-relaxed text-foreground placeholder:text-warm-gray/60 placeholder:transition-opacity placeholder:duration-400 focus:placeholder:opacity-40 focus-visible:border-copper focus-visible:ring-copper/30 shadow-[0_2px_20px_rgba(0,0,0,0.3)] resize-y transition-all duration-300 mb-4"
              />

              {presetStep === 'persona' && (
                <div className="flex gap-3 justify-center flex-wrap mb-8">
                  {PERSONA_PRESETS.map((preset, i) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setInput(preset.prefill);
                        setPresetStep('budget');
                      }}
                      className="text-sm text-warm-gray-light bg-white/[0.08] px-4 py-2 rounded-full border border-border shadow-sm cursor-pointer hover:border-copper/40 hover:text-copper active:scale-[0.97] transition-all duration-300 animate-fade-up"
                      style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {presetStep === 'budget' && (
                <div className="flex gap-3 justify-center flex-wrap mb-8">
                  {BUDGET_PRESETS.map((preset, i) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setInput(prev => prev + preset.append);
                        setPresetStep('done');
                      }}
                      className="text-sm text-warm-gray-light bg-white/[0.08] px-4 py-2 rounded-full border border-border shadow-sm cursor-pointer hover:border-copper/40 hover:text-copper active:scale-[0.97] transition-all duration-300 animate-fade-up"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || hasMaleRecipient}
                className="bg-copper hover:bg-copper/90 text-white font-semibold text-[15px] rounded-xl px-9 py-6 shadow-[0_4px_16px_rgba(200,149,108,0.25)] transition-all duration-300 tracking-wide disabled:opacity-40 disabled:cursor-default"
              >
                Find her something wonderful
              </Button>

              {hasMaleRecipient ? (
                <p className="text-xs text-copper/80 mt-5 tracking-wide">
                  GiftHer.ai is designed for finding gifts for women. Try describing a woman in your life!
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/80 mt-5 tracking-wide">
                  No sign-up. No spam. Just a good gift.
                </p>
              )}
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
                GiftHer.ai
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

              {/* ── Skeleton rows ── */}
              <div className="space-y-12 mb-16">
                {[0, 1, 2].map(rowIdx => (
                  <div key={rowIdx}>
                    <div className="h-5 w-48 rounded-full bg-border/50 animate-pulse mb-4" />
                    <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3 md:gap-6">
                      {[0, 1, 2].map(j => (
                        <div key={j} className="shrink-0 w-[280px] md:w-auto">
                          <GiftCardSkeleton index={rowIdx * 3 + j} isTopPick={j === 0} />
                        </div>
                      ))}
                    </div>
                  </div>
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
          <SessionResults
            rows={rows}
            meta={meta}
            sessionId={sessionId}
            isShared={false}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
