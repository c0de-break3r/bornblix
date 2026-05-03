import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: string[]; // clerkIds
  title?: string;
  isGroup: boolean;
  lastMessage?: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  participants: [{ type: String, required: true, index: true }],
  title: String,
  isGroup: { type: Boolean, default: false },
  lastMessage: String,
  lastMessageAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

export default mongoose.model<IChat>('Chat', ChatSchema);
