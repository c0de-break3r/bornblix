import Chat from '../models/Chat';
import { AppError } from '../middleware/errorHandler';

export const BOON_SENDER_ID = 'bornblix-boon';

export async function findOrCreateAiChat(clerkId: string) {
  const existing = await Chat.findOne({
    kind: 'ai',
    participants: clerkId,
  }).sort({ updatedAt: -1 });

  if (existing) return existing;

  return Chat.create({
    participants: [clerkId],
    kind: 'ai',
    createdBy: clerkId,
    title: 'Bōōns',
    lastMessageAt: new Date(),
  });
}

export function assertChatMember(chat: { participants: string[] }, clerkId: string): void {
  if (!chat.participants.includes(clerkId)) {
    throw new AppError('Forbidden', 403);
  }
}
