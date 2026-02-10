import { NextResponse } from 'next/server';
import { generateTasteProfile } from '@/lib/taste-profile';

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

const MOCK_META = {
  curatedFor: 'Sarah',
  summary:
    "Based on her passion for **sustainable design** and her **love for quiet mornings**\nwe have handpicked these three exceptional treasures.",
};

export async function POST(request) {
  const { description } = await request.json();

  if (!description || !description.trim()) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    );
  }

  try {
    const tasteProfile = await generateTasteProfile(description);

    console.log('\n========== TASTE PROFILE ==========');
    console.log(JSON.stringify(tasteProfile, null, 2));
    console.log('====================================\n');

    // TODO: Use tasteProfile to drive real recommendations
    return NextResponse.json({
      recommendations: MOCK_RECOMMENDATIONS,
      meta: MOCK_META,
      tasteProfile,
    });
  } catch (err) {
    console.error('Taste profile generation failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to generate taste profile' },
      { status: 500 }
    );
  }
}
