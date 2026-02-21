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
      interests: ['skincare', 'home decor', 'coffee'],
      aesthetic: { style: ['minimalist', 'modern', 'thoughtful'], avoids: [] },
      personality: { traits: ['appreciative', 'stylish'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'CeraVe best sellers', interest: 'skincare', strategy: 'brand' },
        { q: 'Drunk Elephant best sellers', interest: 'skincare', strategy: 'brand' },
        { q: 'Barefoot Dreams best sellers', interest: 'home decor', strategy: 'brand' },
        { q: 'Voluspa best sellers', interest: 'home decor', strategy: 'brand' },
        { q: 'Fellow best sellers', interest: 'coffee', strategy: 'brand' },
        { q: 'Nespresso best sellers', interest: 'coffee', strategy: 'brand' },
        { q: 'best selling skincare products women 2025', interest: 'skincare', strategy: 'discovery' },
      ],
      summary: 'Thoughtful picks your girlfriend will actually love — from skincare to home decor and coffee.',
    },
    faq: [
      {
        question: 'What are the best gifts for a girlfriend who has everything?',
        answer:
          'Focus on experiences and consumables — luxury skincare sets, specialty coffee subscriptions, or self-care bundles. The best gifts for a girlfriend who has everything are things she won\u2019t buy herself.',
      },
      {
        question: 'How much should I spend on a gift for my girlfriend?',
        answer:
          'Most people spend between $50 and $150 on a gift for their girlfriend, but the thought matters more than the price tag. A well-chosen $30 gift can mean more than a generic $200 one.',
      },
      {
        question: 'What are thoughtful gift ideas for my girlfriend?',
        answer:
          'Thoughtful gifts show you pay attention — a book by her favorite author, skincare from a brand she mentioned, or a throw blanket in her favorite color. GiftHer.ai matches gifts to her actual interests so every pick feels personal.',
      },
      {
        question: 'What do girlfriends actually want as gifts?',
        answer:
          'Most girlfriends appreciate gifts that show effort and attention to detail. Popular categories include skincare, home items, jewelry, and specialty food and drink sets. Skip the generic and go personal.',
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
      aesthetic: { style: ['classic', 'warm', 'practical'], avoids: ['clutter'] },
      personality: { traits: ['selfless', 'practical', 'nurturing'], giftReceivingStyle: 'hard to shop for' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: 'indulgent' },
      searchQueries: [
        { q: 'Le Creuset best sellers', interest: 'cooking', strategy: 'brand' },
        { q: 'KitchenAid best sellers', interest: 'cooking', strategy: 'brand' },
        { q: 'Kindle best sellers', interest: 'reading', strategy: 'brand' },
        { q: 'Moleskine best sellers', interest: 'reading', strategy: 'brand' },
        { q: 'Fiskars best sellers', interest: 'gardening', strategy: 'brand' },
        { q: "Gardener's Supply best sellers", interest: 'gardening', strategy: 'brand' },
        { q: 'top rated cookbooks best sellers 2025', interest: 'cooking', strategy: 'discovery' },
      ],
      summary: 'Curated picks for the mom who says she doesn\u2019t need anything — from garden finds to kitchen treasures.',
    },
    faq: [
      {
        question: 'What are the best gifts for a mom who says she doesn\u2019t want anything?',
        answer:
          'The trick is to gift her something indulgent she\u2019d never buy herself. Think luxury hand cream, a ceramic planter, a gourmet spice set, or a soft reading blanket. Moms appreciate the thought behind the gift most.',
      },
      {
        question: 'What is a good budget for a gift for Mom?',
        answer:
          'A sweet spot is $30\u2013$100. You can find excellent, thoughtful gifts in this range — quality kitchen accessories, gardening sets, or curated book bundles. What matters most is that it reflects something she actually enjoys.',
      },
      {
        question: 'What are unique gift ideas for Mom?',
        answer:
          'Go beyond flowers and candles. An indoor herb garden kit, a popular cookbook from her favorite cuisine, or a personalized reading light are all unique options. GiftHer.ai finds gifts matched to her specific hobbies.',
      },
      {
        question: 'What do moms really want for their birthday?',
        answer:
          'Most moms want to feel seen. Gifts that connect to their hobbies — a quality garden tool set, a new cookbook, a soft throw — show you pay attention. A heartfelt note doesn\u2019t hurt either.',
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
      aesthetic: { style: ['elegant', 'modern', 'refined'], avoids: [] },
      personality: { traits: ['sophisticated', 'detail-oriented'], giftReceivingStyle: 'very specific taste' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Mejuri best sellers', interest: 'jewelry', strategy: 'brand' },
        { q: 'Kendra Scott best sellers', interest: 'jewelry', strategy: 'brand' },
        { q: 'Vitruvi best sellers', interest: 'wellness', strategy: 'brand' },
        { q: 'Slip best sellers', interest: 'wellness', strategy: 'brand' },
        { q: 'Anthropologie best sellers', interest: 'home decor', strategy: 'brand' },
        { q: 'Voluspa best sellers', interest: 'home decor', strategy: 'brand' },
        { q: 'top rated women jewelry 2025', interest: 'jewelry', strategy: 'discovery' },
      ],
      summary: 'Elegant, refined picks for your wife — from wellness luxuries to jewelry and home accents.',
    },
    faq: [
      {
        question: 'What are the best gifts for a wife who is hard to shop for?',
        answer:
          'Look for elevated everyday items — a silk pillowcase, scented candles, or dainty jewelry she can layer. Wives with specific taste respond best to gifts that show you notice what she gravitates toward.',
      },
      {
        question: 'How much should I spend on a gift for my wife?',
        answer:
          'Most partners spend $50\u2013$200 on a gift for their wife, but meaningful gifts come at every price point. A well-chosen $40 wellness set can feel more luxurious than a $300 item she didn\u2019t ask for.',
      },
      {
        question: 'What are romantic gift ideas for my wife?',
        answer:
          'Romantic doesn\u2019t have to mean clich\u00e9. A quality piece of jewelry with a handwritten note, a curated spa-at-home set, or a home decor piece for a room she\u2019s been wanting to update are all deeply thoughtful.',
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
      aesthetic: { style: ['trendy', 'fun', 'vibrant'], avoids: [] },
      personality: { traits: ['energetic', 'social', 'adventurous'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Lululemon best sellers women', interest: 'fitness', strategy: 'brand' },
        { q: 'Nike best sellers women', interest: 'fitness', strategy: 'brand' },
        { q: 'Away best sellers', interest: 'travel', strategy: 'brand' },
        { q: 'Calpak best sellers', interest: 'travel', strategy: 'brand' },
        { q: 'Stanley best sellers', interest: 'fashion', strategy: 'brand' },
        { q: 'Ray-Ban best sellers women', interest: 'fashion', strategy: 'brand' },
        { q: 'best selling women activewear 2025', interest: 'fitness', strategy: 'discovery' },
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
      aesthetic: { style: ['celebratory', 'special', 'curated'], avoids: [] },
      personality: { traits: ['deserving', 'fun-loving'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Tatcha best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Sol de Janeiro best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Kate Spade best sellers', interest: 'accessories', strategy: 'brand' },
        { q: 'Mejuri best sellers', interest: 'accessories', strategy: 'brand' },
        { q: 'Godiva best sellers', interest: 'gourmet food', strategy: 'brand' },
        { q: 'Harney & Sons best sellers', interest: 'gourmet food', strategy: 'brand' },
        { q: 'top rated self care products women 2025', interest: 'self-care', strategy: 'discovery' },
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
          'Items with Prime shipping work great for last-minute gifts. A curated spa set, gourmet chocolate box, or a quality accessory can arrive in 1\u20132 days and still feel thoughtful. Use GiftHer.ai to find picks fast.',
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
