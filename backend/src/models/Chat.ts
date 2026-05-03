import mongoose, { Schema, Document } from 'mongoose';

export type ChatKind = 'ai' | 'direct' | 'group';

export interface IChat extends Document {
  participants: string[];
  kind: ChatKind;
  title?: string;
  /** Clerk ID of user who started the chat */
  createdBy: string;
  lastMessage?: string;
  lastMessageAt: Date;
  /** Optional metadata (e.g. AI thread hints, verse refs) */
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [{ type: String, required: true, index: true }],
    kind: {
      type: String,
      enum: ['ai', 'direct', 'group'],
      default: 'direct',
      index: true,
    },
    title: String,
    createdBy: { type: String, required: true, index: true },
    lastMessage: String,
    lastMessageAt: { type: Date, default: Date.now },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

ChatSchema.index({ kind: 1, participants: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
