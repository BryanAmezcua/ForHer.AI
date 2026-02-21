import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Recipient } from '@/lib/models/recipient';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const recipients = await Recipient.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({ recipients });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { label, tasteProfile, birthday } = await request.json();

  if (!label || !tasteProfile) {
    return NextResponse.json({ error: 'Label and taste profile are required' }, { status: 400 });
  }

  await connectDB();

  // Strip searchQueries — regenerated each run
  const { searchQueries, ...profileToSave } = tasteProfile;

  const recipient = await Recipient.create({
    userId: session.user.id,
    label,
    tasteProfile: profileToSave,
    birthday: birthday || null,
  });

  return NextResponse.json({ recipient }, { status: 201 });
}
