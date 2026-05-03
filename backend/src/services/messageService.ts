import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AppError } from '../middleware/errorHandler';
import { assertChatMember } from '../utils/chatAccess';
import { broadcastNewMessage } from '../utils/messageBroadcast';

const USER_TYPES = ['text', 'prayer', 'verse', 'image', 'voice'] as const;

export async function appendUserMessage(params: {
  chatId: string;
  clerkId: string;
  content: string;
  type?: string;
}) {
  const { chatId, clerkId, content, type = 'text' } = params;

  if (!mongoose.isValidObjectId(chatId)) {
    throw new AppError('Invalid chat id', 400);
  }
  if (!content?.trim()) {
    throw new AppError('content is required', 400);
  }
  if (!USER_TYPES.includes(type as (typeof USER_TYPES)[number])) {
    throw new AppError('Invalid message type', 400);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  assertChatMember(chat, clerkId);

  const message = await Message.create({
    chatId: chat._id,
    senderId: clerkId,
    content: content.trim(),
    type: type as 'text' | 'prayer' | 'verse' | 'image' | 'voice',
  });

  await Chat.findByIdAndUpdate(chat._id, {
    lastMessage: content.trim().slice(0, 120),
    lastMessageAt: new Date(),
  });

  const chatIdStr = String(chat._id);
  broadcastNewMessage(chatIdStr, {
    _id: message._id,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    createdAt: message.createdAt,
  });

  return { message, chatIdStr };
}
