'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

const HOLIDAY_OPTIONS = [
  { key: 'christmas', label: 'Christmas' },
  { key: 'valentines', label: "Valentine's Day" },
  { key: 'mothers-day', label: "Mother's Day" },
];

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

/* ── Skeleton loading state ── */
function EditSkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      {/* Nav skeleton */}
      <nav className="max-w-[600px] mx-auto grid grid-cols-3 items-center px-4 sm:px-6 py-4 border-b border-border/50">
        <div className="h-4 w-20 rounded-full bg-border/40 animate-pulse" />
        <div className="h-3 w-16 rounded-full bg-border/40 animate-pulse justify-self-center" />
        <div className="w-4 justify-self-end" />
      </nav>

      <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Header skeleton — avatar + name + relationship */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-border/40 animate-pulse mx-auto mb-4" />
          <div className="h-6 w-40 rounded-full bg-border/50 animate-pulse mx-auto mb-2" />
          <div className="h-3.5 w-24 rounded-full bg-border/30 animate-pulse mx-auto" />
        </div>

        {/* Card 1 skeleton — "About Her" */}
        <div
          className="relative rounded-2xl overflow-hidden bg-white/[0.05] border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)] p-6 mb-5 animate-card-entrance"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="h-2.5 w-16 rounded-full bg-border/40 animate-pulse mb-5" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="h-3 w-24 rounded-full bg-border/30 animate-pulse mb-2" />
              <div className="h-11 w-full rounded-xl bg-border/40 animate-pulse" />
            </div>
          ))}
          <div className="absolute inset-0 skeleton-shimmer-warm pointer-events-none" />
        </div>

        {/* Card 2 skeleton — "Dates & Reminders" */}
        <div
          className="relative rounded-2xl overflow-hidden bg-white/[0.05] border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)] p-6 mb-5 animate-card-entrance"
          style={{ animationDelay: '0.22s' }}
        >
          <div className="h-2.5 w-28 rounded-full bg-border/40 animate-pulse mb-5" />
          <div className="mb-5">
            <div className="h-3 w-16 rounded-full bg-border/30 animate-pulse mb-2" />
            <div className="h-11 w-full rounded-xl bg-border/40 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-28 rounded-full bg-border/30 animate-pulse" />
            ))}
          </div>
          <div className="absolute inset-0 skeleton-shimmer-warm pointer-events-none" />
        </div>

        {/* Action buttons skeleton */}
        <div
          className="flex gap-3 animate-card-entrance"
          style={{ animationDelay: '0.34s' }}
        >
          <div className="flex-1 h-12 rounded-xl bg-border/40 animate-pulse" />
          <div className="w-24 h-12 rounded-xl bg-border/30 animate-pulse" />
        </div>
      </div>
    </main>
  );
}

/* ── Not-found state ── */
function NotFound() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-border animate-card-entrance" style={{ animationDelay: '0.1s' }}>
          <BrandSparkle className="w-10 h-10 text-copper/40 mx-auto mb-5" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Recipient not found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px] mx-auto">
            This profile may have been removed, or the link is no longer valid.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-8 py-3 rounded-xl bg-copper text-white text-sm font-semibold cta-hover active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(200,149,108,0.25)]"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}

export default function EditRecipientPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [label, setLabel] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayReminder, setBirthdayReminder] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [interests, setInterests] = useState('');
  const [relationship, setRelationship] = useState('');
  const [style, setStyle] = useState('');
  const [avoids, setAvoids] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
      return;
    }
    if (status === 'authenticated' && params.id) {
      fetch(`/api/recipients/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.recipient) {
            const r = data.recipient;
            setRecipient(r);
            setLabel(r.label || '');
            setBirthday(r.birthday ? new Date(r.birthday).toISOString().split('T')[0] : '');
            setBirthdayReminder(r.reminders?.birthday !== false);
            setHolidays(r.reminders?.holidays || []);
            setInterests((r.tasteProfile?.interests || []).join(', '));
            setRelationship(r.tasteProfile?.recipient?.relationship || '');
            setStyle(r.tasteProfile?.aesthetic?.style || '');
            setAvoids(r.tasteProfile?.aesthetic?.avoids || '');
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [status, params.id, router]);

  const toggleHoliday = (key) => {
    setHolidays((prev) =>
      prev.includes(key) ? prev.filter((h) => h !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const updates = {
      label,
      birthday: birthday || null,
      reminders: {
        birthday: birthdayReminder,
        holidays,
      },
      tasteProfile: {
        ...recipient.tasteProfile,
        interests: interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        recipient: {
          ...recipient.tasteProfile?.recipient,
          relationship,
        },
        aesthetic: {
          ...recipient.tasteProfile?.aesthetic,
          style,
          avoids,
        },
      },
    };

    const res = await fetch(`/api/recipients/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (status === 'loading' || loading) {
    return <EditSkeleton />;
  }

  if (!recipient) {
    return <NotFound />;
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-copper focus:ring-1 focus:ring-copper/30 transition-colors duration-200';

  const avatarInitial = (label || '?')[0].toUpperCase();

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      {/* Nav — three-column layout */}
      <nav className="max-w-[600px] mx-auto grid grid-cols-3 items-center px-4 sm:px-6 py-4 border-b border-border/50">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground justify-self-center whitespace-nowrap">
          GiftHer.ai
        </span>

        <span className="w-4 justify-self-end" />
      </nav>

      <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Page header — avatar + name + relationship */}
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4 font-semibold">
            Edit Profile
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight mb-1">
            {label || 'Untitled'}
          </h1>
          {relationship && (
            <p className="text-sm text-muted-foreground">{relationship}</p>
          )}
        </div>

        {/* Card 1: About Her */}
        <div
          className="rounded-2xl bg-white/[0.05] border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)] p-6 mb-5 animate-card-entrance"
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-5">
            About Her
          </h2>

          <div className="space-y-5">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Name / Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder='e.g., "Mom", "Girlfriend Sarah"'
                className={inputClass}
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Relationship</label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., Mother, Girlfriend, Sister"
                className={inputClass}
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Interests</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Comma-separated: cooking, yoga, reading"
                className={inputClass}
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Style / Aesthetic</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g., minimalist, classic, bohemian"
                className={inputClass}
              />
            </div>

            {/* Avoids */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Avoids</label>
              <input
                type="text"
                value={avoids}
                onChange={(e) => setAvoids(e.target.value)}
                placeholder="e.g., clutter, scented things, tech gadgets"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Dates & Reminders */}
        <div
          className="rounded-2xl bg-white/[0.05] border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)] p-6 mb-5 animate-card-entrance"
          style={{ animationDelay: '0.22s' }}
        >
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-5">
            Dates &amp; Reminders
          </h2>

          <div className="space-y-5">
            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Reminder toggles */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Reminders</label>
              <div className="flex flex-wrap gap-2">
                {/* Birthday toggle */}
                <button
                  type="button"
                  onClick={() => birthday && setBirthdayReminder(!birthdayReminder)}
                  disabled={!birthday}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    !birthday
                      ? 'bg-white/[0.03] border border-border/20 text-muted-foreground/40 cursor-not-allowed'
                      : birthdayReminder
                        ? 'bg-copper/15 border border-copper/30 text-copper'
                        : 'bg-white/[0.05] border border-border/40 text-muted-foreground hover:bg-white/[0.08]'
                  }`}
                >
                  Birthday
                  {!birthday && (
                    <span className="ml-1.5 text-xs opacity-60">— set date first</span>
                  )}
                </button>

                {/* Holiday toggles */}
                {HOLIDAY_OPTIONS.map((h) => (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => toggleHoliday(h.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                      holidays.includes(h.key)
                        ? 'bg-copper/15 border border-copper/30 text-copper'
                        : 'bg-white/[0.05] border border-border/40 text-muted-foreground hover:bg-white/[0.08]'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex gap-3 animate-card-entrance"
          style={{ animationDelay: '0.34s' }}
        >
          <button
            onClick={handleSave}
            disabled={saving || !label.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-copper text-white text-sm font-semibold cta-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_16px_rgba(200,149,108,0.25)]"
          >
            {saving ? (
              'Saving...'
            ) : saved ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
                  <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Saved!
              </>
            ) : (
              'Save changes'
            )}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-white/[0.08] border border-border text-sm font-medium text-foreground hover:bg-white/[0.14] transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
