import mongoose, { Schema, Document } from 'mongoose';

export interface IQuest extends Document {
  slug: string;
  title: string;
  description: string;
  xpReward: number;
  order: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema = new Schema<IQuest>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    xpReward: { type: Number, default: 50 },
    order: { type: Number, default: 0 },
    category: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IQuest>('Quest', QuestSchema);
