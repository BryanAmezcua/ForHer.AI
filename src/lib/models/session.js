import mongoose from 'mongoose';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongoose';

const sessionSchema = new mongoose.Schema({
  _id: { type: String },
  description: { type: String },
  rows: { type: mongoose.Schema.Types.Mixed, required: true },
  meta: {
    curatedFor: { type: String },
    summary: { type: String },
  },
  tasteProfile: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export const Session =
  mongoose.models.Session ||
  mongoose.model('Session', sessionSchema, 'sessions');

export function saveSession(result, description) {
  const sessionId = crypto.randomUUID().replace(/-/g, '').slice(0, 10);

  connectDB()
    .then(() => Session.create({
      _id: sessionId,
      description: description || null,
      rows: result.rows,
      meta: result.meta,
      tasteProfile: result.tasteProfile,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }))
    .catch(err => console.error('Session save failed:', err.message));

  return sessionId;
}
