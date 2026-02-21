import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    label: { type: String, required: true },
    tasteProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
    birthday: { type: Date, default: null },
    reminders: {
      birthday: { type: Boolean, default: true },
      holidays: { type: [String], default: [] },
    },
    giftHistory: [
      {
        sessionId: String,
        date: { type: Date, default: Date.now },
        occasion: String,
      },
    ],
  },
  { timestamps: true }
);

export const Recipient =
  mongoose.models.Recipient ||
  mongoose.model('Recipient', recipientSchema, 'recipients');
