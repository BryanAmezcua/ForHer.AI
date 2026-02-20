// ── Landing page configs ──
// Each entry maps a slug to SEO copy, a pre-built taste profile
// (with searchQueries so the pipeline skips the LLM profile step),
// FAQ pairs targeting long-tail queries, and a CTA prefill.

export const LANDING_PAGES = {
  'gifts-for-girlfriend': {
    seo: {
      title: 'Best Gifts for Your Girlfriend — AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for your girlfriend. AI-curated picks from real products — thoughtful, personal, and ready to order.',
      h1: 'Best Gifts for Your Girlfriend — AI-Curated Picks',
      introText:
        'Shopping for your girlfriend shouldn\u2019t feel like guesswork. We use AI to match real Amazon products to her personality, interests, and style \u2014 so you can skip the generic gift guides and find something she\u2019ll actually love.',
      canonical: 'https://gifther.ai/gifts-for-girlfriend',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'girlfriend', age: null, lifestage: 'young professional' },
      occasion: { event: null, urgency: null },
      budget: { min: 25, max: 150, flexibility: 'flexible' },
      interests: ['skincare', 'cozy nights in', 'coffee'],
      interestAliases: {
        skincare: ['moisturizer', 'serum', 'face mask', 'cleanser', 'beauty', 'glow', 'spa', 'self-care', 'hydrating', 'vitamin c'],
        'cozy nights in': ['blanket', 'candle', 'throw', 'loungewear', 'pajamas', 'slippers', 'cozy', 'plush', 'warm', 'fleece'],
        coffee: ['espresso', 'latte', 'pour-over', 'mug', 'grinder', 'cold brew', 'barista', 'french press', 'coffee lover', 'drip'],
      },
      aesthetic: { style: ['aesthetic', 'minimalist', 'thoughtful'], avoids: [] },
      personality: { traits: ['appreciative', 'stylish'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'top gifts for girlfriend who loves skincare', interest: 'skincare' },
        { q: 'best cozy gift sets for girlfriend', interest: 'cozy nights in' },
        { q: 'top rated coffee lover gifts for her', interest: 'coffee' },
      ],
      summary: 'Thoughtful, aesthetic picks your girlfriend will actually love — from skincare to cozy essentials.',
    },
    faq: [
      {
        question: 'What are the best gifts for a girlfriend who has everything?',
        answer:
          'Focus on experiences and consumables — luxury skincare sets, artisan coffee subscriptions, or cozy self-care bundles. The best gifts for a girlfriend who has everything are things she wouldn\u2019t buy herself.',
      },
      {
        question: 'How much should I spend on a gift for my girlfriend?',
        answer:
          'Most people spend between $50 and $150 on a gift for their girlfriend, but the thought matters more than the price tag. A well-chosen $30 gift can mean more than a generic $200 one.',
      },
      {
        question: 'What are thoughtful gift ideas for my girlfriend?',
        answer:
          'Thoughtful gifts show you pay attention — a book by her favorite author, skincare from a brand she mentioned, or a cozy throw in her favorite color. GiftHer.ai matches gifts to her actual interests so every pick feels personal.',
      },
      {
        question: 'What do girlfriends actually want as gifts?',
        answer:
          'Most girlfriends appreciate gifts that show effort and attention to detail. Popular categories include skincare, cozy home items, jewelry, and specialty food and drink sets. Skip the generic and go personal.',
      },
    ],
    cta: 'My girlfriend loves ',
  },

  'gifts-for-mom': {
    seo: {
      title: 'Best Gifts for Mom — AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for mom. AI-curated picks based on her interests — thoughtful, practical, and ready to order.',
      h1: 'Best Gifts for Mom — AI-Curated Picks',
      introText:
        'Moms always say they don\u2019t need anything \u2014 but that doesn\u2019t mean they don\u2019t deserve something special. We match real products to her personality and passions, so you can find a gift she\u2019d never pick out for herself.',
      canonical: 'https://gifther.ai/gifts-for-mom',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'mom', age: null, lifestage: null },
      occasion: { event: null, urgency: null },
      budget: { min: 25, max: 120, flexibility: 'flexible' },
      interests: ['gardening', 'cooking', 'reading'],
      interestAliases: {
        gardening: ['planter', 'seeds', 'garden tools', 'herb', 'succulent', 'botanical', 'plant', 'flower', 'watering', 'greenhouse'],
        cooking: ['kitchen', 'cookbook', 'spice', 'olive oil', 'utensil', 'apron', 'baking', 'recipe', 'gourmet', 'chef'],
        reading: ['book', 'novel', 'reading light', 'bookmark', 'kindle', 'book lover', 'literary', 'cozy reading', 'page turner', 'library'],
      },
      aesthetic: { style: ['classic', 'warm', 'practical'], avoids: ['clutter'] },
      personality: { traits: ['selfless', 'practical', 'nurturing'], giftReceivingStyle: 'hard to shop for' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: 'indulgent' },
      searchQueries: [
        { q: 'best gifts for mom who loves gardening', interest: 'gardening' },
        { q: 'top cooking gifts for mom', interest: 'cooking' },
        { q: 'top rated gifts for mom who loves reading', interest: 'reading' },
      ],
      summary: 'Curated picks for the mom who says she doesn\u2019t need anything — from garden finds to kitchen treasures.',
    },
    faq: [
      {
        question: 'What are the best gifts for a mom who says she doesn\u2019t want anything?',
        answer:
          'The trick is to gift her something indulgent she\u2019d never buy herself. Think luxury hand cream, a beautiful planter, a gourmet spice set, or a cozy reading blanket. Moms appreciate the thought behind the gift most.',
      },
      {
        question: 'What is a good budget for a gift for Mom?',
        answer:
          'A sweet spot is $30\u2013$100. You can find excellent, thoughtful gifts in this range — quality kitchen accessories, gardening sets, or curated book bundles. What matters most is that it reflects something she actually enjoys.',
      },
      {
        question: 'What are unique gift ideas for Mom?',
        answer:
          'Go beyond flowers and candles. An indoor herb garden kit, an artisan cookbook from her favorite cuisine, or a personalized reading light are all unique options. GiftHer.ai finds gifts matched to her specific hobbies.',
      },
      {
        question: 'What do moms really want for their birthday?',
        answer:
          'Most moms want to feel seen. Gifts that connect to their hobbies — a beautiful garden tool set, a new cookbook, a cozy throw — show you pay attention. A heartfelt note doesn\u2019t hurt either.',
      },
    ],
    cta: 'My mom loves ',
  },

  'gifts-for-wife': {
    seo: {
      title: 'Best Gifts for Your Wife — AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for your wife. AI-curated recommendations matched to her style, interests, and personality.',
      h1: 'Best Gifts for Your Wife — AI-Curated Picks',
      introText:
        'After years together, finding the right gift can feel harder, not easier. Our AI looks at her real interests and matches them to products she\u2019ll love \u2014 no more last-minute scrambles or gift cards.',
      canonical: 'https://gifther.ai/gifts-for-wife',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'wife', age: null, lifestage: null },
      occasion: { event: null, urgency: null },
      budget: { min: 40, max: 200, flexibility: 'flexible' },
      interests: ['wellness', 'jewelry', 'home decor'],
      interestAliases: {
        wellness: ['spa', 'aromatherapy', 'essential oil', 'bath bomb', 'relaxation', 'meditation', 'yoga', 'self-care', 'massage', 'mindfulness'],
        jewelry: ['necklace', 'bracelet', 'earrings', 'ring', 'pendant', 'gold', 'silver', 'dainty', 'minimalist', 'gemstone'],
        'home decor': ['vase', 'candle', 'throw pillow', 'frame', 'wall art', 'ceramic', 'linen', 'accent', 'decorative', 'diffuser'],
      },
      aesthetic: { style: ['elegant', 'modern', 'refined'], avoids: [] },
      personality: { traits: ['sophisticated', 'detail-oriented'], giftReceivingStyle: 'very specific taste' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'best wellness gifts for wife', interest: 'wellness' },
        { q: 'top rated jewelry gifts for wife', interest: 'jewelry' },
        { q: 'top home decor gifts for her', interest: 'home decor' },
      ],
      summary: 'Elegant, refined picks for your wife — from wellness luxuries to jewelry and home accents.',
    },
    faq: [
      {
        question: 'What are the best gifts for a wife who is hard to shop for?',
        answer:
          'Look for elevated everyday items — a silk pillowcase, artisan candles, or dainty jewelry she can layer. Wives with specific taste respond best to gifts that show you notice what she gravitates toward.',
      },
      {
        question: 'How much should I spend on a gift for my wife?',
        answer:
          'Most partners spend $50\u2013$200 on a gift for their wife, but meaningful gifts come at every price point. A well-chosen $40 wellness set can feel more luxurious than a $300 item she didn\u2019t ask for.',
      },
      {
        question: 'What are romantic gift ideas for my wife?',
        answer:
          'Romantic doesn\u2019t have to mean clich\u00e9. A beautiful piece of jewelry with a handwritten note, a curated spa-at-home set, or a home decor piece for a room she\u2019s been wanting to update are all deeply thoughtful.',
      },
      {
        question: 'What gifts do wives actually appreciate?',
        answer:
          'Wives tend to appreciate gifts that feel personal and considered. Wellness products, quality jewelry, and home accents rank consistently high. The key is matching the gift to her taste, not just the occasion.',
      },
    ],
    cta: 'My wife loves ',
  },

  'gifts-for-sister': {
    seo: {
      title: 'Best Gifts for Your Sister — AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for your sister. AI-curated picks matched to her vibe, hobbies, and personality.',
      h1: 'Best Gifts for Your Sister — AI-Curated Picks',
      introText:
        'Your sister knows when you\u2019ve phoned it in. Skip the generic and let AI find gifts that actually match her personality \u2014 whether she\u2019s into fitness, fashion, or anything in between.',
      canonical: 'https://gifther.ai/gifts-for-sister',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'sister', age: null, lifestage: null },
      occasion: { event: null, urgency: null },
      budget: { min: 20, max: 100, flexibility: 'flexible' },
      interests: ['fitness', 'fashion', 'travel'],
      interestAliases: {
        fitness: ['workout', 'yoga mat', 'resistance bands', 'gym', 'activewear', 'water bottle', 'fitness tracker', 'running', 'exercise', 'athleisure'],
        fashion: ['accessories', 'scarf', 'handbag', 'sunglasses', 'jewelry', 'trendy', 'style', 'outfit', 'wardrobe', 'clutch'],
        travel: ['luggage', 'passport holder', 'travel kit', 'packing cubes', 'carry-on', 'adventure', 'wanderlust', 'travel accessories', 'toiletry bag', 'neck pillow'],
      },
      aesthetic: { style: ['trendy', 'fun', 'vibrant'], avoids: [] },
      personality: { traits: ['energetic', 'social', 'adventurous'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'top gifts for sister who loves fitness', interest: 'fitness' },
        { q: 'best fashion gifts for sister', interest: 'fashion' },
        { q: 'top rated travel gifts for her', interest: 'travel' },
      ],
      summary: 'Fun, vibrant picks for the sister who keeps you on your toes — from fitness gear to travel essentials.',
    },
    faq: [
      {
        question: 'What are good gifts for a sister in her 20s or 30s?',
        answer:
          'Sisters in their 20s and 30s tend to love trendy accessories, fitness gear, and travel essentials. Think quality water bottles, stylish sunglasses, or packing cube sets. Match the gift to her current obsession.',
      },
      {
        question: 'How much should I spend on a gift for my sister?',
        answer:
          'Most siblings spend $25\u2013$75 on gifts for each other, though it depends on the occasion. A fun, well-chosen $30 gift often beats an expensive one that misses the mark.',
      },
      {
        question: 'What are unique gift ideas for a sister?',
        answer:
          'Skip the gift card. A curated fitness accessory set, a trendy fashion piece she\u2019s been eyeing, or a travel organizer kit are all unique and useful. GiftHer.ai matches gifts to her actual interests.',
      },
      {
        question: 'What do you get a sister who has everything?',
        answer:
          'Go for consumables or upgrades to things she already uses — premium workout gear, a new travel accessory, or trending fashion items. Something she\u2019d scroll past online but love to receive.',
      },
    ],
    cta: 'My sister loves ',
  },

  'birthday-gifts-for-her': {
    seo: {
      title: 'Birthday Gifts for Her — AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect birthday gift for her. AI-curated picks tailored to her personality and interests — not just another gift guide.',
      h1: 'Birthday Gifts for Her — AI-Curated Picks',
      introText:
        'Birthdays deserve more than a last-minute Amazon search. Tell us about her, and our AI will curate a selection of real products matched to who she is \u2014 not just what\u2019s trending.',
      canonical: 'https://gifther.ai/birthday-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: 'birthday', urgency: 'soon' },
      budget: { min: 25, max: 150, flexibility: 'flexible' },
      interests: ['self-care', 'accessories', 'gourmet food'],
      interestAliases: {
        'self-care': ['spa', 'bath', 'candle', 'face mask', 'lotion', 'relaxation', 'pampering', 'skincare', 'aromatherapy', 'essential oil'],
        accessories: ['jewelry', 'scarf', 'handbag', 'watch', 'sunglasses', 'hair accessories', 'wallet', 'keychain', 'bracelet', 'earrings'],
        'gourmet food': ['chocolate', 'tea', 'cheese', 'olive oil', 'honey', 'artisan', 'gift basket', 'snack box', 'truffle', 'gourmet'],
      },
      aesthetic: { style: ['celebratory', 'special', 'curated'], avoids: [] },
      personality: { traits: ['deserving', 'fun-loving'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'best birthday self-care gifts for her', interest: 'self-care' },
        { q: 'top birthday accessories gifts for women', interest: 'accessories' },
        { q: 'top rated gourmet gift sets for her birthday', interest: 'gourmet food' },
      ],
      summary: 'Birthday-worthy picks she\u2019ll love — from self-care luxuries to accessories and gourmet treats.',
    },
    faq: [
      {
        question: 'What are the best birthday gifts for her?',
        answer:
          'The best birthday gifts feel personal and a little indulgent. Self-care sets, quality accessories, and gourmet food baskets are consistently popular. The key is matching the gift to her interests, not just grabbing something generic.',
      },
      {
        question: 'What are good last-minute birthday gifts for her?',
        answer:
          'Items with Prime shipping work great for last-minute gifts. A curated spa set, gourmet chocolate box, or a beautiful accessory can arrive in 1\u20132 days and still feel thoughtful. Use GiftHer.ai to find picks fast.',
      },
      {
        question: 'How much should you spend on a birthday gift for her?',
        answer:
          'It depends on the relationship. $25\u2013$50 for a friend or coworker, $50\u2013$150 for a partner or close family member. The thought behind the gift matters more than the price.',
      },
      {
        question: 'What birthday gifts do women actually want?',
        answer:
          'Women consistently rank self-care products, quality accessories, and gourmet treats as top birthday gifts. Avoid overly practical gifts for birthdays \u2014 this is the time for something special and a little luxurious.',
      },
    ],
    cta: "It's her birthday. She loves ",
  },
};

export const LANDING_PAGE_SLUGS = Object.keys(LANDING_PAGES);

export function getLandingPage(slug) {
  return LANDING_PAGES[slug] || null;
}
