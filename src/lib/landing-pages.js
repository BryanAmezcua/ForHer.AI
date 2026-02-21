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
          'Focus on experiences and consumables — quality skincare sets, specialty coffee subscriptions, or self-care bundles. The best gifts for a girlfriend who has everything are things she won\u2019t buy herself.',
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
      aesthetic: { style: ['classic', 'functional', 'practical'], avoids: ['clutter'] },
      personality: { traits: ['selfless', 'practical', 'nurturing'], giftReceivingStyle: 'hard to shop for' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: 'personal' },
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
          'The trick is to gift her something she\u2019d never buy herself. Think a quality hand cream, a ceramic planter, a gourmet spice set, or a reading blanket. Moms appreciate the thought behind the gift most.',
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
          'Most moms want to feel seen. Gifts that connect to their hobbies — a quality garden tool set, a new cookbook, a throw she\u2019ll use — show you pay attention. A handwritten note doesn\u2019t hurt either.',
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
      aesthetic: { style: ['considered', 'modern', 'specific'], avoids: [] },
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
      summary: 'Well-matched picks for your wife — from wellness to jewelry and home accents.',
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
          'Most partners spend $50\u2013$200 on a gift for their wife, but meaningful gifts come at every price point. A well-chosen $40 wellness set can land better than a $300 item she didn\u2019t ask for.',
      },
      {
        question: 'What are good gift ideas for my wife?',
        answer:
          'A quality piece of jewelry with a handwritten note, a curated spa-at-home set, or a home decor piece for a room she\u2019s been wanting to update are all solid picks that show you pay attention.',
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
      summary: 'Birthday-worthy picks she\u2019ll love — from self-care to accessories and gourmet treats.',
    },
    faq: [
      {
        question: 'What are the best birthday gifts for her?',
        answer:
          'The best birthday gifts feel personal. Self-care sets, quality accessories, and gourmet food baskets are consistently popular. The key is matching the gift to her interests, not just grabbing something generic.',
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
          'Women consistently rank self-care products, quality accessories, and gourmet treats as top birthday gifts. Avoid overly practical gifts for birthdays \u2014 this is the time for something she wouldn\u2019t buy herself.',
      },
    ],
    cta: "It's her birthday. She loves ",
  },

  'christmas-gifts-for-her': {
    seo: {
      title: 'Christmas Gifts for Her — AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect Christmas gift for her. AI-curated picks matched to her personality — skip the generic holiday gift guides.',
      h1: 'Christmas Gifts for Her — AI-Curated Picks',
      introText:
        'The holidays are stressful enough without guessing what she wants. Describe the woman you\u2019re shopping for, and our AI will match real products to her interests and personality \u2014 so every gift under the tree feels personal.',
      canonical: 'https://gifther.ai/christmas-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: 'christmas', urgency: 'soon' },
      budget: { min: 25, max: 150, flexibility: 'flexible' },
      interests: ['home', 'self-care', 'gourmet food'],
      aesthetic: { style: ['seasonal', 'personal', 'considered'], avoids: [] },
      personality: { traits: ['appreciative'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Barefoot Dreams best sellers', interest: 'home', strategy: 'brand' },
        { q: 'UGG best sellers women', interest: 'home', strategy: 'brand' },
        { q: 'Lush best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Burt\'s Bees best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Godiva best sellers', interest: 'gourmet food', strategy: 'brand' },
        { q: 'Harney & Sons best sellers', interest: 'gourmet food', strategy: 'brand' },
        { q: 'best christmas gifts for women 2025', interest: 'home', strategy: 'discovery' },
      ],
      summary: 'Holiday picks she\u2019ll love unwrapping \u2014 from blankets to gourmet treats and self-care.',
    },
    faq: [
      {
        question: 'What are the best Christmas gifts for her?',
        answer:
          'The best Christmas gifts are things she\u2019d love but wouldn\u2019t buy herself \u2014 quality blankets, candles, gourmet chocolate sets, and self-care bundles.',
      },
      {
        question: 'How much should I spend on a Christmas gift for her?',
        answer:
          'For a partner, $50\u2013$150 is a common range. For friends or coworkers, $20\u2013$50 works well. The holidays are about thoughtfulness, not price tags.',
      },
      {
        question: 'What are popular Christmas gift ideas for women?',
        answer:
          'Loungewear, skincare sets, candles, gourmet food baskets, and quality accessories consistently top holiday wish lists. GiftHer.ai matches picks to her specific taste.',
      },
      {
        question: 'What Christmas gifts do women actually want?',
        answer:
          'Most women want gifts that feel personal. Skip the generic holiday sets and choose something that reflects her interests \u2014 whether that\u2019s a cashmere throw, a tea sampler, or a curated skincare set.',
      },
    ],
    cta: "It's Christmas and she loves ",
  },

  'valentines-gifts-for-her': {
    seo: {
      title: "Valentine's Day Gifts for Her \u2014 AI-Curated Picks | GiftHer.ai",
      description:
        "Find the perfect Valentine's Day gift for her. AI-curated picks that go beyond flowers and chocolate \u2014 matched to her personality.",
      h1: "Valentine's Day Gifts for Her \u2014 AI-Curated Picks",
      introText:
        "Valentine\u2019s Day doesn\u2019t have to mean flowers and chocolate (unless that\u2019s her thing). Tell us about her, and our AI will find gifts that show you really know her \u2014 not just what the holiday aisle suggests.",
      canonical: 'https://gifther.ai/valentines-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: 'valentines day', urgency: 'soon' },
      budget: { min: 30, max: 175, flexibility: 'flexible' },
      interests: ['jewelry', 'self-care', 'fragrance'],
      aesthetic: { style: ['personal', 'considered', 'intentional'], avoids: [] },
      personality: { traits: ['appreciative', 'detail-oriented'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Mejuri best sellers', interest: 'jewelry', strategy: 'brand' },
        { q: 'Pandora best sellers', interest: 'jewelry', strategy: 'brand' },
        { q: 'Jo Malone best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Diptyque best sellers', interest: 'fragrance', strategy: 'brand' },
        { q: 'Slip best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Godiva best sellers', interest: 'fragrance', strategy: 'brand' },
        { q: 'best valentines day gifts for her 2025', interest: 'jewelry', strategy: 'discovery' },
      ],
      summary: "Thoughtful Valentine\u2019s Day picks \u2014 from jewelry to self-care and fragrance.",
    },
    faq: [
      {
        question: "What are the best Valentine's Day gifts for her?",
        answer:
          "The best Valentine\u2019s gifts feel personal. Jewelry, candles, perfume, and curated self-care sets consistently rank highest. The key is picking something that says \u201cI know you,\u201d not just \u201cit\u2019s February.\u201d",
      },
      {
        question: "How much should I spend on a Valentine's Day gift?",
        answer:
          "For a partner, $50\u2013$150 is a sweet spot. For someone you\u2019re newly dating, $30\u2013$75 keeps things thoughtful without overwhelming. Quality always beats price.",
      },
      {
        question: "What are unique Valentine's Day gift ideas?",
        answer:
          "Go beyond roses and chocolates. A dainty necklace she can layer, a candle from a brand she loves, or a silk sleep set are all memorable and unique. GiftHer.ai finds picks based on who she actually is.",
      },
      {
        question: "What Valentine's Day gifts do women actually want?",
        answer:
          "Women consistently say they want gifts that show effort and attention. Jewelry, fragrance, and spa-quality self-care products top the list. A handwritten card alongside the gift goes a long way.",
      },
    ],
    cta: "It's Valentine's Day and she loves ",
  },

  'anniversary-gifts-for-her': {
    seo: {
      title: 'Anniversary Gifts for Her \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect anniversary gift for her. AI-curated picks that celebrate your relationship \u2014 thoughtful, personal, and ready to order.',
      h1: 'Anniversary Gifts for Her \u2014 AI-Curated Picks',
      introText:
        'Anniversaries are about celebrating what makes your relationship special. Our AI matches gifts to her personality and interests \u2014 so you can mark the occasion with something she\u2019ll treasure, not just tolerate.',
      canonical: 'https://gifther.ai/anniversary-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: 'anniversary', urgency: null },
      budget: { min: 40, max: 200, flexibility: 'flexible' },
      interests: ['jewelry', 'home decor', 'experiences'],
      aesthetic: { style: ['considered', 'lasting', 'timeless'], avoids: [] },
      personality: { traits: ['detail-oriented', 'specific'], giftReceivingStyle: 'very specific taste' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Kendra Scott best sellers', interest: 'jewelry', strategy: 'brand' },
        { q: 'Tiffany best sellers', interest: 'jewelry', strategy: 'brand' },
        { q: 'Anthropologie best sellers home', interest: 'home decor', strategy: 'brand' },
        { q: 'Voluspa best sellers', interest: 'home decor', strategy: 'brand' },
        { q: 'Kate Spade best sellers', interest: 'experiences', strategy: 'brand' },
        { q: 'Mark & Graham best sellers', interest: 'experiences', strategy: 'brand' },
        { q: 'best anniversary gifts for her 2025', interest: 'jewelry', strategy: 'discovery' },
      ],
      summary: 'Lasting anniversary picks \u2014 from jewelry to home accents that mark your story.',
    },
    faq: [
      {
        question: 'What are the best anniversary gifts for her?',
        answer:
          'The best anniversary gifts feel personal and lasting. Quality jewelry, a meaningful home accent, or an upgraded version of something she uses daily all show you\u2019ve been paying attention.',
      },
      {
        question: 'How much should I spend on an anniversary gift?',
        answer:
          'It varies by milestone, but $50\u2013$200 covers most anniversaries well. First anniversary gifts might be on the lower end, while milestone years (5th, 10th, 25th) often call for something more significant.',
      },
      {
        question: 'What are good anniversary gift ideas?',
        answer:
          'Personalized jewelry, a curated home decor piece for a space you share, or a quality item from her favorite brand all land well. The thoughtfulness matters more than the price.',
      },
      {
        question: 'What anniversary gifts do women actually appreciate?',
        answer:
          'Women appreciate anniversary gifts that reflect the relationship. Jewelry she\u2019ll wear daily, an upgrade to her favorite things, or something that marks your shared memories all land well.',
      },
    ],
    cta: "It's our anniversary and she loves ",
  },

  'gifts-for-daughter': {
    seo: {
      title: 'Best Gifts for Your Daughter \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for your daughter. AI-curated picks matched to her age, interests, and personality \u2014 from teens to adults.',
      h1: 'Best Gifts for Your Daughter \u2014 AI-Curated Picks',
      introText:
        'Whether she\u2019s a teenager or a grown adult, finding the right gift for your daughter means keeping up with who she\u2019s becoming. Our AI matches real products to her current interests \u2014 no outdated guesses required.',
      canonical: 'https://gifther.ai/gifts-for-daughter',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'daughter', age: null, lifestage: 'young adult' },
      occasion: { event: null, urgency: null },
      budget: { min: 25, max: 120, flexibility: 'flexible' },
      interests: ['skincare', 'fashion', 'tech accessories'],
      aesthetic: { style: ['trendy', 'youthful', 'curated'], avoids: [] },
      personality: { traits: ['independent', 'creative'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'CeraVe best sellers', interest: 'skincare', strategy: 'brand' },
        { q: 'Glow Recipe best sellers', interest: 'skincare', strategy: 'brand' },
        { q: 'Madewell best sellers', interest: 'fashion', strategy: 'brand' },
        { q: 'BaubleBar best sellers', interest: 'fashion', strategy: 'brand' },
        { q: 'Apple best sellers accessories women', interest: 'tech accessories', strategy: 'brand' },
        { q: 'Casetify best sellers', interest: 'tech accessories', strategy: 'brand' },
        { q: 'best gifts for daughter 2025', interest: 'fashion', strategy: 'discovery' },
      ],
      summary: 'Trendy, thoughtful picks your daughter will actually use \u2014 from skincare to fashion and tech.',
    },
    faq: [
      {
        question: 'What are the best gifts for an adult daughter?',
        answer:
          'Adult daughters appreciate gifts that reflect their current life \u2014 quality skincare they\u2019ve been eyeing, a trendy accessory, or a useful tech upgrade. The key is matching the gift to who she is now, not who she was.',
      },
      {
        question: 'How much should I spend on a gift for my daughter?',
        answer:
          'Most parents spend $30\u2013$100 on gifts for their daughter, with birthdays and holidays on the higher end. A well-chosen $40 gift that matches her interests beats an expensive generic one.',
      },
      {
        question: 'What are good gifts for a teenage daughter?',
        answer:
          'Teens love trending skincare, stylish phone cases, fashion accessories, and anything their favorite influencers recommend. GiftHer.ai can help you find what\u2019s actually popular right now.',
      },
      {
        question: 'What gifts do daughters actually want?',
        answer:
          'Daughters want gifts that show you understand their current world. Trendy beauty products, fashion pieces, and tech accessories rank consistently high. When in doubt, describe her to GiftHer.ai and let AI do the matching.',
      },
    ],
    cta: 'My daughter loves ',
  },

  'gifts-for-best-friend': {
    seo: {
      title: 'Best Gifts for Your Best Friend \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for your best friend. AI-curated picks matched to her personality \u2014 fun, thoughtful, and actually useful.',
      h1: 'Best Gifts for Your Best Friend \u2014 AI-Curated Picks',
      introText:
        'Your best friend deserves better than a gift card. Tell us what she\u2019s into, and our AI will find real products that match her personality \u2014 the kind of gift that makes her say \u201chow did you know?\u201d',
      canonical: 'https://gifther.ai/gifts-for-best-friend',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'best friend', age: null, lifestage: null },
      occasion: { event: null, urgency: null },
      budget: { min: 20, max: 80, flexibility: 'flexible' },
      interests: ['self-care', 'snacks & drinks', 'fun accessories'],
      aesthetic: { style: ['fun', 'playful', 'on-trend'], avoids: [] },
      personality: { traits: ['social', 'fun-loving', 'loyal'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Sol de Janeiro best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Drunk Elephant best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Sugarfina best sellers', interest: 'snacks & drinks', strategy: 'brand' },
        { q: 'Stanley best sellers', interest: 'snacks & drinks', strategy: 'brand' },
        { q: 'BaubleBar best sellers', interest: 'fun accessories', strategy: 'brand' },
        { q: 'Anthropologie best sellers gifts', interest: 'fun accessories', strategy: 'brand' },
        { q: 'best gifts for best friend female 2025', interest: 'self-care', strategy: 'discovery' },
      ],
      summary: 'Fun, thoughtful picks for the friend who deserves more than a gift card.',
    },
    faq: [
      {
        question: 'What are the best gifts for a female best friend?',
        answer:
          'Best friend gifts should be fun and personal. Trending skincare, gourmet candy sets, quality tumblers, and playful accessories all work well. The best gifts reference an inside joke or shared interest.',
      },
      {
        question: 'How much should I spend on a gift for my best friend?',
        answer:
          'Most people spend $25\u2013$60 on a gift for their best friend. The thought matters way more than the price \u2014 a perfectly chosen $25 gift beats a random $100 one every time.',
      },
      {
        question: 'What are fun gift ideas for a best friend?',
        answer:
          'A curated snack box, matching friendship bracelets, a trending beauty product, or a funny mug that references your friendship are all fun picks. GiftHer.ai finds options that match her actual personality.',
      },
      {
        question: 'What do you get a best friend who has everything?',
        answer:
          'Consumables and experiences are your best bet \u2014 gourmet treats, a quality body care set, or a fun new accessory she hasn\u2019t discovered yet. Something she\u2019ll enjoy using, not just storing.',
      },
    ],
    cta: 'My best friend loves ',
  },

  'mothers-day-gifts': {
    seo: {
      title: "Mother's Day Gifts \u2014 AI-Curated Picks | GiftHer.ai",
      description:
        "Find the perfect Mother's Day gift. AI-curated picks that go beyond flowers \u2014 matched to your mom's personality and interests.",
      h1: "Mother's Day Gifts \u2014 AI-Curated Picks",
      introText:
        "She\u2019s spent years putting everyone else first. This Mother\u2019s Day, give her something that\u2019s just for her. Our AI matches real products to her hobbies and passions \u2014 so you can find a gift that says \u201cI see you.\u201d",
      canonical: 'https://gifther.ai/mothers-day-gifts',
    },
    tasteProfile: {
      recipient: { name: null, relationship: 'mom', age: null, lifestage: null },
      occasion: { event: "mother's day", urgency: 'soon' },
      budget: { min: 30, max: 120, flexibility: 'flexible' },
      interests: ['spa & relaxation', 'gardening', 'cooking'],
      aesthetic: { style: ['considered', 'practical', 'personal'], avoids: [] },
      personality: { traits: ['selfless', 'nurturing', 'deserving'], giftReceivingStyle: 'hard to shop for' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: 'personal' },
      searchQueries: [
        { q: 'L\'Occitane best sellers', interest: 'spa & relaxation', strategy: 'brand' },
        { q: 'Kiehl\'s best sellers', interest: 'spa & relaxation', strategy: 'brand' },
        { q: 'Le Creuset best sellers', interest: 'cooking', strategy: 'brand' },
        { q: 'Staub best sellers', interest: 'cooking', strategy: 'brand' },
        { q: 'Gardener\'s Supply best sellers', interest: 'gardening', strategy: 'brand' },
        { q: 'Terrain best sellers', interest: 'gardening', strategy: 'brand' },
        { q: 'best mothers day gifts 2025', interest: 'spa & relaxation', strategy: 'discovery' },
      ],
      summary: "Mother\u2019s Day picks she deserves \u2014 from spa products to garden and kitchen finds.",
    },
    faq: [
      {
        question: "What are the best Mother's Day gifts?",
        answer:
          "The best Mother\u2019s Day gifts are things she\u2019d never buy herself \u2014 a quality hand cream, a kitchen tool she\u2019s been wanting, or a spa-at-home set.",
      },
      {
        question: "How much should I spend on a Mother's Day gift?",
        answer:
          "$30\u2013$100 is a common range for Mother\u2019s Day. You can absolutely find something meaningful at any price point. What matters is that it connects to something she actually enjoys.",
      },
      {
        question: "What are unique Mother's Day gift ideas?",
        answer:
          "Skip the standard bouquet. An artisan spice collection, a quality gardening set, a robe she\u2019ll actually use, or a curated tea sampler are all unique and memorable. GiftHer.ai matches picks to her real hobbies.",
      },
      {
        question: "What do moms actually want for Mother's Day?",
        answer:
          "Most moms want to feel appreciated and seen. Gifts that connect to their personal interests \u2014 not just their role as mom \u2014 resonate most. Pair the gift with quality time and you\u2019ve nailed it.",
      },
    ],
    cta: "It's Mother's Day and my mom loves ",
  },

  'graduation-gifts-for-her': {
    seo: {
      title: 'Graduation Gifts for Her \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect graduation gift for her. AI-curated picks for the next chapter \u2014 practical, inspiring, and ready to order.',
      h1: 'Graduation Gifts for Her \u2014 AI-Curated Picks',
      introText:
        'She\u2019s earned this milestone. Whether she\u2019s finishing high school, college, or grad school, our AI finds gifts that celebrate her achievement and set her up for what\u2019s next.',
      canonical: 'https://gifther.ai/graduation-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: 'new graduate' },
      occasion: { event: 'graduation', urgency: null },
      budget: { min: 30, max: 150, flexibility: 'flexible' },
      interests: ['professional accessories', 'self-care', 'tech'],
      aesthetic: { style: ['polished', 'aspirational', 'modern'], avoids: [] },
      personality: { traits: ['ambitious', 'driven', 'celebratory'], giftReceivingStyle: 'appreciates anything' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Kate Spade best sellers', interest: 'professional accessories', strategy: 'brand' },
        { q: 'Tory Burch best sellers', interest: 'professional accessories', strategy: 'brand' },
        { q: 'Tatcha best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Glossier best sellers', interest: 'self-care', strategy: 'brand' },
        { q: 'Apple best sellers accessories women', interest: 'tech', strategy: 'brand' },
        { q: 'Bellroy best sellers', interest: 'tech', strategy: 'brand' },
        { q: 'best graduation gifts for her 2025', interest: 'professional accessories', strategy: 'discovery' },
      ],
      summary: 'Polished, inspiring picks for the graduate starting her next chapter.',
    },
    faq: [
      {
        question: 'What are the best graduation gifts for her?',
        answer:
          'The best graduation gifts bridge the gap between student life and what\u2019s next. Quality bags, professional accessories, self-care upgrades, and tech she\u2019ll use daily all make great choices.',
      },
      {
        question: 'How much should I spend on a graduation gift for her?',
        answer:
          '$30\u2013$100 for high school, $50\u2013$150 for college or grad school. Parents and close family often go higher for milestone graduations. The gift should feel celebratory.',
      },
      {
        question: 'What are practical graduation gift ideas?',
        answer:
          'A quality tote bag, a leather portfolio, wireless earbuds, or a professional skincare set are all practical and appreciated. Gifts that upgrade her daily routine for the next chapter land best.',
      },
      {
        question: 'What graduation gifts do women actually want?',
        answer:
          'Graduates want gifts that make them feel ready for what\u2019s next. Professional accessories, quality tech, and self-care products rank highest. Keep it forward-looking, not nostalgic.',
      },
    ],
    cta: "She's graduating and she loves ",
  },

  'gifts-for-her-under-50': {
    seo: {
      title: 'Best Gifts for Her Under $50 \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find the perfect gift for her under $50. AI-curated picks that look and feel more expensive than they are \u2014 thoughtful gifts on a budget.',
      h1: 'Best Gifts for Her Under $50 \u2014 AI-Curated Picks',
      introText:
        'You don\u2019t need a big budget to find a great gift. Our AI finds real products under $50 that feel thoughtful and personal \u2014 the kind of gifts that punch above their price tag.',
      canonical: 'https://gifther.ai/gifts-for-her-under-50',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: null, urgency: null },
      budget: { min: 15, max: 50, flexibility: 'strict' },
      interests: ['beauty', 'accessories', 'treats'],
      aesthetic: { style: ['elevated', 'curated', 'affordable quality'], avoids: [] },
      personality: { traits: ['appreciative'], giftReceivingStyle: 'appreciates anything' },
      constraints: ['under $50'],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'best selling beauty gifts under 50', interest: 'beauty', strategy: 'discovery' },
        { q: 'CeraVe best sellers', interest: 'beauty', strategy: 'brand' },
        { q: 'Burt\'s Bees best sellers', interest: 'beauty', strategy: 'brand' },
        { q: 'Barefoot Dreams best sellers', interest: 'accessories', strategy: 'brand' },
        { q: 'Voluspa best sellers', interest: 'accessories', strategy: 'brand' },
        { q: 'Sugarfina best sellers', interest: 'treats', strategy: 'brand' },
        { q: 'best gifts for women under 50 dollars 2025', interest: 'beauty', strategy: 'discovery' },
      ],
      summary: 'Thoughtful gifts under $50 that punch above their price \u2014 from beauty to accessories and treats.',
    },
    faq: [
      {
        question: 'What are the best gifts for her under $50?',
        answer:
          'The best gifts under $50 focus on quality over quantity. A well-made candle, a curated skincare mini set, gourmet chocolates, or a quality scarf all feel elevated without breaking the bank.',
      },
      {
        question: 'What cheap gifts look expensive?',
        answer:
          'Candles from premium brands, sample-size skincare sets, quality hair accessories, and artisan chocolates all punch above their price. Presentation matters too \u2014 nice packaging makes any gift feel premium.',
      },
      {
        question: 'What are thoughtful gifts on a budget?',
        answer:
          'Thoughtful doesn\u2019t mean expensive. A book you know she\u2019ll love, a quality mug with her favorite tea, or a beauty product she\u2019s been wanting to try can all be under $30 and feel deeply personal.',
      },
      {
        question: 'What do women want as gifts under $50?',
        answer:
          'Women consistently love beauty products, candles, accessories, and gourmet treats in this price range. The key is picking something specific to her taste, not a generic gift set.',
      },
    ],
    cta: 'She loves ',
  },

  'unique-gifts-for-her': {
    seo: {
      title: 'Unique Gifts for Her \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find unique gifts for her she hasn\u2019t seen before. AI-curated picks matched to her personality \u2014 creative, unexpected, and genuinely thoughtful.',
      h1: 'Unique Gifts for Her \u2014 AI-Curated Picks',
      introText:
        'Generic gifts are forgettable. Our AI finds products that match her specific personality and interests \u2014 the kind of gifts she wouldn\u2019t find on a \u201ctop 10\u201d list but will absolutely love.',
      canonical: 'https://gifther.ai/unique-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: null, urgency: null },
      budget: { min: 25, max: 150, flexibility: 'flexible' },
      interests: ['artisan goods', 'niche beauty', 'creative hobbies'],
      aesthetic: { style: ['unique', 'creative', 'distinctive'], avoids: ['generic', 'mass-market'] },
      personality: { traits: ['creative', 'discerning'], giftReceivingStyle: 'very specific taste' },
      constraints: [],
      giftingContext: { previousGifts: [], avoidCategories: ['generic gift sets'], leanToward: null },
      searchQueries: [
        { q: 'Uncommon Goods best sellers women', interest: 'artisan goods', strategy: 'brand' },
        { q: 'Aesop best sellers', interest: 'niche beauty', strategy: 'brand' },
        { q: 'Le Labo best sellers', interest: 'niche beauty', strategy: 'brand' },
        { q: 'Rifle Paper Co best sellers', interest: 'creative hobbies', strategy: 'brand' },
        { q: 'Moleskine best sellers', interest: 'creative hobbies', strategy: 'brand' },
        { q: 'Anthropologie best sellers gifts', interest: 'artisan goods', strategy: 'brand' },
        { q: 'unique gifts for women 2025', interest: 'artisan goods', strategy: 'discovery' },
      ],
      summary: 'Distinctive, creative picks she won\u2019t find on any generic gift guide.',
    },
    faq: [
      {
        question: 'What are truly unique gifts for her?',
        answer:
          'Truly unique gifts come from matching products to her specific taste. Artisan-made goods, niche beauty brands, handmade stationery, or a creative hobby kit she hasn\u2019t tried yet. GiftHer.ai finds picks based on who she is.',
      },
      {
        question: 'How do I find a gift she hasn\u2019t seen before?',
        answer:
          'Skip the Amazon best-seller lists and look at niche brands. Indie skincare, artisan food producers, and small-batch accessories are all great sources. Describe her interests and let AI surface unexpected matches.',
      },
      {
        question: 'What are creative gift ideas for women?',
        answer:
          'A premium art supply set, a niche fragrance, an artisan candle from a small maker, or a well-designed journal are all creative and memorable. The best gifts reflect her personality, not just a trend.',
      },
      {
        question: 'What do you get a woman who is hard to shop for?',
        answer:
          'Hard-to-shop-for women usually have specific taste. Focus on quality over novelty \u2014 a niche beauty product, an artisan home accent, or something from a brand she doesn\u2019t know yet but will love.',
      },
    ],
    cta: 'She has unique taste and loves ',
  },

  'last-minute-gifts-for-her': {
    seo: {
      title: 'Last-Minute Gifts for Her \u2014 AI-Curated Picks | GiftHer.ai',
      description:
        'Find last-minute gifts for her that don\u2019t look last-minute. AI-curated picks with fast shipping \u2014 thoughtful gifts in a hurry.',
      h1: 'Last-Minute Gifts for Her \u2014 AI-Curated Picks',
      introText:
        'Short on time doesn\u2019t have to mean short on thoughtfulness. Our AI finds real products available with fast shipping \u2014 so you can get her something great even when the clock is ticking.',
      canonical: 'https://gifther.ai/last-minute-gifts-for-her',
    },
    tasteProfile: {
      recipient: { name: null, relationship: null, age: null, lifestage: null },
      occasion: { event: null, urgency: 'urgent' },
      budget: { min: 20, max: 100, flexibility: 'flexible' },
      interests: ['beauty', 'accessories', 'gourmet treats'],
      aesthetic: { style: ['polished', 'impressive', 'ready-to-gift'], avoids: [] },
      personality: { traits: ['appreciative'], giftReceivingStyle: 'appreciates anything' },
      constraints: ['fast shipping', 'Prime eligible'],
      giftingContext: { previousGifts: [], avoidCategories: [], leanToward: null },
      searchQueries: [
        { q: 'Sol de Janeiro best sellers', interest: 'beauty', strategy: 'brand' },
        { q: 'Tatcha best sellers', interest: 'beauty', strategy: 'brand' },
        { q: 'Mejuri best sellers', interest: 'accessories', strategy: 'brand' },
        { q: 'Kate Spade best sellers', interest: 'accessories', strategy: 'brand' },
        { q: 'Godiva best sellers', interest: 'gourmet treats', strategy: 'brand' },
        { q: 'Lindt best sellers', interest: 'gourmet treats', strategy: 'brand' },
        { q: 'best last minute gifts for women prime shipping 2025', interest: 'beauty', strategy: 'discovery' },
      ],
      summary: 'Impressive last-minute picks that ship fast and still feel thoughtful.',
    },
    faq: [
      {
        question: 'What are the best last-minute gifts for her?',
        answer:
          'Beauty sets, gourmet chocolates, and quality accessories are all available with fast shipping and look anything but last-minute. Focus on items that come in nice packaging \u2014 presentation does the heavy lifting.',
      },
      {
        question: 'What gifts ship fast for her?',
        answer:
          'Most Amazon Prime-eligible beauty, accessories, and gourmet items ship in 1\u20132 days. Brands like Sol de Janeiro, Mejuri, and Godiva are widely available with next-day delivery.',
      },
      {
        question: 'How do I make a last-minute gift look thoughtful?',
        answer:
          'Choose something specific to her interests, not a generic set. A skincare product she\u2019s mentioned, chocolates from a premium brand, or an accessory in her style. Add a handwritten card and it won\u2019t feel rushed.',
      },
      {
        question: 'What are good emergency gift ideas for women?',
        answer:
          'When time is truly tight, go for premium consumables \u2014 quality chocolate, a well-made candle, or a trending beauty mini set. These are widely available, come well-packaged, and always feel appreciated.',
      },
    ],
    cta: 'She loves ',
  },
};

export const LANDING_PAGE_SLUGS = Object.keys(LANDING_PAGES);

export function getLandingPage(slug) {
  return LANDING_PAGES[slug] || null;
}
