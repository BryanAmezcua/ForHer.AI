import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import { Session } from '@/lib/models/session';
import { SessionResults } from '@/components/SessionResults';

export async function generateMetadata({ params }) {
  const { id } = await params;

  await connectDB();
  const session = await Session.findById(id).lean();

  if (!session) {
    return { title: 'Gift list not found — GiftHer.ai' };
  }

  const curatedFor = session.meta?.curatedFor || 'her';

  return {
    title: `Gifts for ${curatedFor} — GiftHer.ai`,
    description: session.meta?.summary || `A curated gift list for ${curatedFor}`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `Gifts for ${curatedFor} — GiftHer.ai`,
      description: session.meta?.summary || `A curated gift list for ${curatedFor}`,
      siteName: 'GiftHer.ai',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Gifts for ${curatedFor} — GiftHer.ai`,
      description: session.meta?.summary || `A curated gift list for ${curatedFor}`,
      images: ['/opengraph-image'],
    },
  };
}

export default async function SharedSessionPage({ params }) {
  const { id } = await params;

  await connectDB();
  const session = await Session.findById(id).lean();

  if (!session) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18] relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">
        <SessionResults
          rows={session.rows}
          meta={session.meta}
          sessionId={id}
          isShared={true}
        />
      </div>
    </main>
  );
}
