'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RecipientCard } from '@/components/RecipientCard';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(session) {
  const name = session?.user?.name || session?.user?.email || '';
  return name.split(/[\s@]/)[0] || '';
}

/* ── Skeleton loading state ── */
function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      {/* Nav skeleton */}
      <nav className="max-w-[800px] mx-auto grid grid-cols-3 items-center px-4 sm:px-6 py-4 border-b border-border/50">
        <div className="h-4 w-16 rounded-full bg-border/40 animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-border/40 animate-pulse justify-self-center" />
        <div className="flex items-center gap-3 justify-self-end">
          <div className="w-7 h-7 rounded-full bg-border/40 animate-pulse" />
          <div className="h-3 w-14 rounded-full bg-border/40 animate-pulse" />
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Heading skeleton */}
        <div className="text-center mb-10">
          <div className="h-2.5 w-20 rounded-full bg-border/40 animate-pulse mx-auto mb-3" />
          <div className="h-7 w-56 rounded-full bg-border/50 animate-pulse mx-auto mb-2" />
          <div className="h-3.5 w-48 rounded-full bg-border/30 animate-pulse mx-auto" />
        </div>

        {/* Card grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-white/[0.05] border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)] animate-card-entrance"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <div className="p-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-border/40 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded-full bg-border/50 animate-pulse" />
                    <div className="h-3 w-16 rounded-full bg-border/30 animate-pulse" />
                  </div>
                </div>
                {/* Pills */}
                <div className="flex gap-1.5 mb-4">
                  <div className="h-5 w-20 rounded-full bg-border/30 animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-border/30 animate-pulse" />
                  <div className="h-5 w-24 rounded-full bg-border/30 animate-pulse" />
                </div>
                {/* CTA */}
                <div className="w-full h-11 rounded-xl bg-border/40 animate-pulse" />
              </div>
              {/* Warm shimmer overlay */}
              <div className="absolute inset-0 skeleton-shimmer-warm pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ── Brand sparkle SVG ── */
function BrandSparkle({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M20 0 L22.5 15.5 L40 20 L22.5 24.5 L20 40 L17.5 24.5 L0 20 L17.5 15.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/recipients')
        .then((r) => r.json())
        .then((data) => {
          setRecipients(data.recipients || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const handleGetGifts = (recipient) => {
    const encoded = btoa(JSON.stringify(recipient.tasteProfile));
    router.push(`/?profile=${encodeURIComponent(encoded)}&recipientId=${recipient._id}`);
  };

  const handleEdit = (id) => {
    router.push(`/dashboard/recipients/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recipient? This cannot be undone.')) return;

    const res = await fetch(`/api/recipients/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRecipients((prev) => prev.filter((r) => r._id !== id));
    }
  };

  if (status === 'loading' || loading) {
    return <DashboardSkeleton />;
  }

  const firstName = getFirstName(session);
  const greeting = getGreeting();

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      {/* Nav — three-column layout matching SessionResults */}
      <nav className="max-w-[800px] mx-auto grid grid-cols-3 items-center px-4 sm:px-6 py-4 border-b border-border/50">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors min-w-[44px] min-h-[44px]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </a>

        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground justify-self-center whitespace-nowrap">
          GiftHer.ai
        </span>

        <div className="flex items-center gap-3 justify-self-end">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-7 h-7 rounded-full ring-1 ring-copper/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-copper/20 ring-1 ring-copper/20 flex items-center justify-center">
              <span className="text-xs text-copper font-semibold">
                {(session?.user?.name || session?.user?.email || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Personalized greeting */}
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 font-semibold">
            Your People
          </p>
          <h1 className="text-2xl sm:text-[2.2rem] font-bold text-foreground tracking-tight leading-tight mb-3">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {recipients.length > 0
              ? `${recipients.length} ${recipients.length === 1 ? 'person' : 'people'} saved. Ready when you are.`
              : 'Save someone to start building your gift list.'}
          </p>
        </div>

        {recipients.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-border animate-card-entrance" style={{ animationDelay: '0.1s' }}>
            <BrandSparkle className="w-10 h-10 text-copper/40 mx-auto mb-5" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No saved recipients yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px] mx-auto">
              Describe someone you care about and we&apos;ll find gifts she&apos;ll love.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 rounded-xl bg-copper text-white text-sm font-semibold cta-hover active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(200,149,108,0.25)]"
            >
              Find her something wonderful
            </a>
          </div>
        ) : (
          /* ── Recipient grid + add-new card ── */
          <div className="grid gap-4 sm:grid-cols-2">
            {recipients.map((r, i) => (
              <RecipientCard
                key={r._id}
                recipient={r}
                index={i}
                onGetGifts={handleGetGifts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* Add new card */}
            <a
              href="/"
              className="group/add rounded-2xl border-2 border-dashed border-border/50 hover:border-copper/30 flex flex-col items-center justify-center py-10 transition-all duration-300 animate-card-entrance cursor-pointer"
              style={{ animationDelay: `${0.1 + recipients.length * 0.12}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center mb-3 group-hover/add:bg-copper/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-copper">
                  <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover/add:text-foreground transition-colors">
                Find gifts for someone new
              </span>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
