import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Recipient } from '@/lib/models/recipient';

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const recipient = await Recipient.findById(id).lean();

  if (!recipient || recipient.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ recipient });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const updates = await request.json();

  await connectDB();
  const recipient = await Recipient.findById(id);

  if (!recipient || recipient.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Strip searchQueries if tasteProfile is being updated
  if (updates.tasteProfile) {
    const { searchQueries, ...profileToSave } = updates.tasteProfile;
    updates.tasteProfile = profileToSave;
  }

  Object.assign(recipient, updates);
  await recipient.save();

  return NextResponse.json({ recipient });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const recipient = await Recipient.findById(id);

  if (!recipient || recipient.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await recipient.deleteOne();
  return NextResponse.json({ ok: true });
}
