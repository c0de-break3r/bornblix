import mongoose, { Schema, Document } from 'mongoose';

/** Short passages for reflections, quests, and AI context — not a full Bible module */
export interface IBibleSnippet extends Document {
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  text: string;
  translation: string;
  themes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BibleSnippetSchema = new Schema<IBibleSnippet>(
  {
    reference: { type: String, required: true, index: true },
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    verseStart: { type: Number, required: true },
    verseEnd: Number,
    text: { type: String, required: true },
    translation: { type: String, default: 'WEB' },
    themes: [{ type: String }],
  },
  { timestamps: true }
);

BibleSnippetSchema.index({ book: 1, chapter: 1, verseStart: 1 });

export default mongoose.model<IBibleSnippet>('BibleSnippet', BibleSnippetSchema);
