import { NextResponse } from 'next/server';
import { generateTasteProfile } from '@/lib/taste-profile';
import { generateDeepQueries } from '@/lib/search-queries-deep';
import { executeSerperQueries } from '@/lib/search-serper';
import { dedupeSerperResults } from '@/lib/dedupe-serper';
import { pruneSerperResults } from '@/lib/prune-serper';
import { enrichProducts } from '@/lib/enrich-serper';

const MOCK_RECOMMENDATIONS = [
  {
    name: 'Hand-Thrown Earthware Set',
    price: '$68',
    why: 'A handmade ceramic dripper and mug set from a small Portland studio. Turns her morning coffee into a ritual, not a task.',
    tag: 'NEW MATCH',
    ctaText: 'Explore Collection',
    ctaColor: '#c8956c',
    giftReady: true,
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=450&fit=crop&q=80',
    imageBg: '#252220',
  },
  {
    name: 'Midnight Silk Robe',
    price: '$185',
    why: "She never buys anything for herself — this is the kind of indulgence that feels chosen. Ethically sourced mulberry silk, hand-dyed in small batches.",
    tag: 'NEW MATCH',
    ctaText: 'Browse Details',
    ctaColor: '#c8956c',
    giftReady: true,
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=450&fit=crop&q=80',
    imageBg: '#252220',
  },
  {
    name: 'Sculptural Timepiece',
    price: '$1,200',
    why: 'A minimalist watch from an independent Swedish atelier. The kind of piece that becomes part of her identity, not just an accessory.',
    tag: 'TIMELESS CHOICE',
    ctaText: 'View Heritage',
    ctaColor: '#c8956c',
    giftReady: true,
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=450&fit=crop&q=80',
    imageBg: '#252220',
  },
];

export async function POST(request) {
  const { description, tasteProfile: providedProfile } = await request.json();

  if (!providedProfile && (!description || !description.trim())) {
    return NextResponse.json(
      { error: 'Description or taste profile is required' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Use pre-built taste profile or generate one
    const tasteProfile = providedProfile
      ? { ...providedProfile, clarification: undefined }
      : await generateTasteProfile(description);

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

    // Step 6: Enrich with merchant URLs and descriptions via Tavily
    const enrichedProducts = await enrichProducts(prunedProducts);

    // Step 7: Build recommendations from enriched products
    const recommendations = enrichedProducts.map(p => ({
      name: p.title,
      price: p.price || 'Price unavailable',
      why: p.description || '',
      tag: 'GREAT FIND',
      ctaText: 'View Product',
      ctaColor: '#c8956c',
      url: p.merchantUrl,
      imageUrl: p.imageUrl,
      imageBg: '#252220',
    }));

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
