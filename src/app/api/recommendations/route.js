import { NextResponse } from 'next/server';
import { runPipeline } from '@/lib/pipeline';
import { saveSession } from '@/lib/models/session';

export async function POST(request) {
  const { description, tasteProfile } = await request.json();

  if (!tasteProfile && (!description || !description.trim())) {
    return NextResponse.json(
      { error: 'Description or taste profile is required' },
      { status: 400 }
    );
  }

  try {
    const result = await runPipeline({ description, tasteProfile });
    const sessionId = saveSession(result, description);
    return NextResponse.json({ ...result, sessionId });
  } catch (err) {
    console.error('Recommendation generation failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
