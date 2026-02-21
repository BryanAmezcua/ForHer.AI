'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RecipientCard } from '@/components/RecipientCard';

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
    // Encode taste profile as base64 URL param for prefilling
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
    return (
      <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-16 pb-10">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18]">
      {/* Nav */}
      <nav className="max-w-[800px] mx-auto flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50">
        <a href="/" className="text-sm text-warm-gray-light hover:text-foreground transition-colors">
          <span className="font-bold">
            <span className="text-foreground">Gift</span>
            <span className="text-copper">Her</span>
          </span>
        </a>

        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-7 h-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-copper/20 flex items-center justify-center">
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
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-1">Saved Recipients</h1>
          <p className="text-sm text-muted-foreground">
            Your saved profiles for quick gift finding.
          </p>
        </div>

        {recipients.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-border">
            <p className="text-muted-foreground mb-4">No saved recipients yet</p>
            <a
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all"
            >
              Find gifts to get started
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recipients.map((r) => (
              <RecipientCard
                key={r._id}
                recipient={r}
                onGetGifts={handleGetGifts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
