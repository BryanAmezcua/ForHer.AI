import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Session } from '@/lib/models/session';
import { Recipient } from '@/lib/models/recipient';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, label } = await request.json();

  if (!sessionId || !label) {
    return NextResponse.json({ error: 'Session ID and label are required' }, { status: 400 });
  }

  await connectDB();
  const giftSession = await Session.findById(sessionId).lean();

  if (!giftSession || !giftSession.tasteProfile) {
    return NextResponse.json({ error: 'Session not found or has no taste profile' }, { status: 404 });
  }

  // Strip searchQueries — regenerated each run
  const { searchQueries, ...profileToSave } = giftSession.tasteProfile;

  const recipient = await Recipient.create({
    userId: session.user.id,
    label,
    tasteProfile: profileToSave,
    giftHistory: [
      {
        sessionId,
        date: giftSession.createdAt,
        occasion: giftSession.meta?.curatedFor || null,
      },
    ],
  });

  return NextResponse.json({ recipient }, { status: 201 });
}
