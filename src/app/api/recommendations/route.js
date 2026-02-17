import { NextResponse } from 'next/server';
import { generateTasteProfile } from '@/lib/taste-profile';
import { generateDeepQueries } from '@/lib/search-queries-deep';
import { executeScrapingDogQueries } from '@/lib/search-scrapingdog';
import { dedupeSerperResults } from '@/lib/dedupe-serper';
import { pruneSerperResults, DISPLAY_COUNT } from '@/lib/prune-serper';
import { enrichProducts } from '@/lib/enrich-scrapingdog';
import { generatePillLabels } from '@/lib/generate-pills';
import { scorePDP } from '@/lib/score-pdp';

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

    // Step 3: Execute queries via ScrapingDog Shopping API (cached)
    const serperResults = await executeScrapingDogQueries(deepQueries);

    // Step 4: Deduplicate across queries
    const uniqueProducts = dedupeSerperResults(serperResults);

    // Step 5: Prune to top 16 (enrichment pool)
    const prunedProducts = pruneSerperResults(uniqueProducts, tasteProfile);

    // Step 6: Enrich products + generate pill labels in parallel
    const [enrichedProducts, pillLabels] = await Promise.all([
      enrichProducts(prunedProducts),
      generatePillLabels(prunedProducts, tasteProfile),
    ]);

    // Tag each enriched product with its original pruned index (for pill mapping)
    const enrichedWithIndex = enrichedProducts.map((p, i) => ({ ...p, _originalIndex: i }));

    // Step 6.5: PDP confidence scoring — reject non-product pages
    const pdpScored = enrichedWithIndex.map(p => ({
      ...p,
      _pdpScore: scorePDP({ url: p.merchantUrl, title: p.title, price: p.price, snippet: p.description }),
    }));

    const pdpRejected = pdpScored.filter(p => p._pdpScore <= -2);
    const pdpPassed = pdpScored.filter(p => p._pdpScore > -2);

    console.log(`\n========== PDP SCORING ==========`);
    for (const p of pdpScored) {
      const status = p._pdpScore <= -2 ? 'REJECT' : p._pdpScore >= 3 ? 'ACCEPT' : 'PASS';
      console.log(`  [${p._pdpScore >= 0 ? '+' : ''}${p._pdpScore}] ${status} — ${p.title} (${p.merchantUrl})`);
    }
    if (pdpRejected.length > 0) {
      console.log(`  ${pdpRejected.length} rejected as non-PDP`);
    }
    console.log(`=================================\n`);

    // Take top DISPLAY_COUNT (9)
    const finalProducts = pdpPassed.slice(0, DISPLAY_COUNT);

    // Step 7: Merge enriched data + pills into recommendations
    const recommendations = finalProducts.map((p, i) => ({
      name: p.title,
      price: p.price || 'Price unavailable',
      description: p.description || '',
      brand: p.brand || null,
      rating: p.merchantRating || p.rating || null,
      reviews: p.merchantReviews || p.reviews || null,
      tag: i === 0 ? 'TOP PICK' : 'GREAT FIND',
      ctaText: 'View Product',
      ctaColor: '#c8956c',
      url: p.merchantUrl,
      imageUrl: p.imageUrl,
      imageBg: '#252220',
      matchedAttributes: pillLabels[p._originalIndex] || [],
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
