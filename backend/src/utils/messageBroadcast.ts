import { BOON_SENDER_ID } from './chatAccess';
import { getSocketServer } from './socketHub';

export function broadcastNewMessage(
  chatId: string,
  doc: {
    _id: unknown;
    senderId: string;
    content: string;
    type: string;
    createdAt?: Date;
  }
): void {
  const io = getSocketServer();
  if (!io) return;
  io.to(`chat-${chatId}`).emit('newMessage', {
    id: String(doc._id),
    chatId,
    senderId: doc.senderId,
    content: doc.content,
    type: doc.type,
    timestamp: doc.createdAt ?? new Date(),
    isFromBoon: doc.senderId === BOON_SENDER_ID,
  });
}

export function broadcastBoonResponse(userClerkId: string, payload: Record<string, unknown>): void {
  const io = getSocketServer();
  io?.to(`user-${userClerkId}`).emit('boonResponse', payload);
}
