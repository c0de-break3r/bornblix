import mongoose, { Schema, Document } from 'mongoose';

export type MessageType = 'text' | 'prayer' | 'verse' | 'image' | 'voice' | 'ai';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'prayer', 'verse', 'image', 'voice', 'ai'],
      default: 'text',
    },
    metadata: Schema.Types.Mixed,
    readBy: [{ type: String }],
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
