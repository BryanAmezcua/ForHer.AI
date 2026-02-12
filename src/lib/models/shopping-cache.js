import mongoose from 'mongoose';

const shoppingCacheSchema = new mongoose.Schema({
  _id: { type: String },
  query: {
    raw: { type: String, required: true },
    normalized: { type: String, required: true },
    locale: {
      country: { type: String, default: 'US' },
      currency: { type: String, default: 'USD' },
      lang: { type: String, default: 'en' },
    },
  },
  provider: { type: String, default: 'serper' },
  fetchedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  results: [{
    title: String,
    link: String,
    price: String,
    source: String,
    imageUrl: String,
  }],
});

export const ShoppingCache =
  mongoose.models.ShoppingCache ||
  mongoose.model('ShoppingCache', shoppingCacheSchema, 'shopping-cache');
