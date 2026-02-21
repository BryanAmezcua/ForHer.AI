import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb-client';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('GiftHer');
    const existing = await db.collection('users').findOne({ email });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.collection('users').insertOne({
      name: name || null,
      email,
      emailVerified: null,
      image: null,
      hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, userId: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error('Registration failed:', err.message);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
