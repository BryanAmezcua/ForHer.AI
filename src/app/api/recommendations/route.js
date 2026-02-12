import { NextResponse } from 'next/server';
import { generateTasteProfile } from '@/lib/taste-profile';
import { generateDeepQueries } from '@/lib/search-queries-deep';
import { executeSerperQueries } from '@/lib/search-serper';
import { dedupeSerperResults } from '@/lib/dedupe-serper';
import { pruneSerperResults } from '@/lib/prune-serper';

const MOCK_RECOMMENDATIONS = [
  {
    name: 'Hand-Thrown Earthware Set',
    price: '$68',
    why: 'A handmade ceramic dripper and mug set from a small Portland studio. Turns her morning coffee into a ritual, not a task.',
    tag: 'NEW MATCH',
    ctaText: 'Explore Collection',
    ctaColor: '#8fa38a',
    giftReady: true,
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=450&fit=crop&q=80',
    imageBg: '#c8c0b4',
  },
  {
    name: 'Midnight Silk Robe',
    price: '$185',
    why: "She never buys anything for herself — this is the kind of indulgence that feels chosen. Ethically sourced mulberry silk, hand-dyed in small batches.",
    tag: 'NEW MATCH',
    ctaText: 'Browse Details',
    ctaColor: '#a89a8e',
    giftReady: true,
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=450&fit=crop&q=80',
    imageBg: '#d4cfc7',
  },
  {
    name: 'Sculptural Timepiece',
    price: '$1,200',
    why: 'A minimalist watch from an independent Swedish atelier. The kind of piece that becomes part of her identity, not just an accessory.',
    tag: 'TIMELESS CHOICE',
    ctaText: 'View Heritage',
    ctaColor: '#b68d7a',
    giftReady: true,
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=450&fit=crop&q=80',
    imageBg: '#e8e2db',
  },
];

export async function POST(request) {
  const { description } = await request.json();
  console.log('raw description', description);

  if (!description || !description.trim()) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Generate taste profile from description
    const tasteProfile = await generateTasteProfile(description);

    // Step 2: Generate broad queries from taste profile
    const deepQueries = await generateDeepQueries(tasteProfile);
    console.log('\n========== DEEP RESEARCH QUERIES ==========');
    console.log(JSON.stringify(deepQueries, null, 2));
    console.log('============================================\n');

    // Step 3: Execute queries via Serper Shopping API (cached)
    const serperResults = await executeSerperQueries(deepQueries);

    // Step 4: Deduplicate across queries
    const uniqueProducts = dedupeSerperResults(serperResults);

    // Step 5: Prune to top 10 by relevance scoring
    const prunedProducts = pruneSerperResults(uniqueProducts, tasteProfile);

    // TODO: Enrich pruned products and build ranked recommendations
    const recommendations = MOCK_RECOMMENDATIONS;

    // Build meta from taste profile
    const curatedFor = tasteProfile.recipient?.name
      || tasteProfile.recipient?.relationship
      || 'her';
    const meta = {
      curatedFor,
      summary: tasteProfile.summary
        || `Based on what you told us, we found ${recommendations.length} gifts she'll love.`,
    };

    return NextResponse.json({
      recommendations,
      meta,
      tasteProfile,
    });
  } catch (err) {
    console.error('Recommendation generation failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
