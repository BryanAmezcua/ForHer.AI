import { NextResponse } from 'next/server';
import { generateProfileAndQueries } from '@/lib/taste-profile';

export async function POST(request) {
  const { description } = await request.json();

  if (!description || !description.trim()) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    );
  }

  try {
    const tasteProfile = await generateProfileAndQueries(description);
    return NextResponse.json({ tasteProfile });
  } catch (err) {
    console.error('Taste profile generation failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to generate taste profile' },
      { status: 500 }
    );
  }
}
