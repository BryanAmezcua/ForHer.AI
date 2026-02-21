'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

const HOLIDAY_OPTIONS = [
  { key: 'christmas', label: 'Christmas' },
  { key: 'valentines', label: "Valentine's Day" },
  { key: 'mothers-day', label: "Mother's Day" },
];

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
    return (
      <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-16 pb-10">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!recipient) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-16 pb-10">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Recipient not found</p>
            <a href="/dashboard" className="text-copper hover:underline text-sm">
              Back to dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-copper focus:ring-1 focus:ring-copper/30';

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      {/* Nav */}
      <nav className="max-w-[600px] mx-auto flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </button>
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
          Edit Recipient
        </span>
        <span className="w-4" />
      </nav>

      <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="space-y-6">
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

          {/* Reminders */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Reminders</label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={birthdayReminder}
                  onChange={(e) => setBirthdayReminder(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-white/[0.05] accent-copper"
                />
                <span className="text-sm text-foreground">Birthday reminder</span>
                {!birthday && (
                  <span className="text-xs text-muted-foreground">(set birthday above)</span>
                )}
              </label>

              {HOLIDAY_OPTIONS.map((h) => (
                <label key={h.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={holidays.includes(h.key)}
                    onChange={() => toggleHoliday(h.key)}
                    className="w-4 h-4 rounded border-border bg-white/[0.05] accent-copper"
                  />
                  <span className="text-sm text-foreground">{h.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !label.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl bg-white/[0.08] border border-border text-sm font-medium text-foreground hover:bg-white/[0.14] transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
