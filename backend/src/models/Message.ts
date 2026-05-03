import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: string; // clerkId
  content: string;
  type: 'text' | 'prayer' | 'verse' | 'image' | 'voice';
  metadata?: Record<string, any>; // for AI suggestions, verse refs, etc.
  readBy: string[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chat', 
    required: true,
    index: true 
  },
  senderId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'prayer', 'verse', 'image', 'voice'], 
    default: 'text' 
  },
  metadata: Schema.Types.Mixed,
  readBy: [{ type: String }],
}, {
  timestamps: true
});

MessageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
