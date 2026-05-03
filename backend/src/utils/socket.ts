import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { assertChatMember, BOON_SENDER_ID, findOrCreateAiChat } from '../utils/chatAccess';
import { generateCompanionReply } from '../services/aiChat';
import { appendUserMessage } from '../services/messageService';
import { broadcastBoonResponse, broadcastNewMessage } from '../utils/messageBroadcast';
import { setSocketServer } from './socketHub';

/** clerkId -> socket.id (latest connection per user) */
const onlineUsers = new Map<string, string>();

function clerkSecret(): string {
  const s = process.env.CLERK_SECRET_KEY?.trim();
  if (!s) {
    console.warn('[socket] CLERK_SECRET_KEY missing — socket auth will fail');
  }
  return s ?? '';
}

export const initializeSocket = (io: Server): void => {
  setSocketServer(io);

  io.use(async (socket, next) => {
    try {
      const raw =
        typeof socket.handshake.auth?.token === 'string'
          ? socket.handshake.auth.token
          : typeof socket.handshake.headers?.authorization === 'string'
            ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
            : '';

      if (!raw) {
        next(new Error('Unauthorized'));
        return;
      }

      const secret = clerkSecret();
      if (!secret) {
        next(new Error('Server misconfigured'));
        return;
      }

      const payload = await verifyToken(raw, { secretKey: secret });
      const sub = typeof payload.sub === 'string' ? payload.sub : null;
      if (!sub) {
        next(new Error('Unauthorized'));
        return;
      }

      (socket.data as { userId: string }).userId = sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket.data as { userId?: string }).userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    console.log(`Socket connected: ${socket.id} (user ${userId})`);

    socket.emit('online-users', { userIds: Array.from(onlineUsers.keys()) });
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('user-online', { userId });

    socket.join(`user-${userId}`);

    socket.on('leaveChat', (chatId: string) => {
      if (typeof chatId === 'string') socket.leave(`chat-${chatId}`);
    });

    socket.on('typing', (data: { chatId?: string; isTyping?: boolean }) => {
      if (!data?.chatId) return;
      socket.to(`chat-${data.chatId}`).emit('typing', {
        userId,
        chatId: data.chatId,
        isTyping: Boolean(data.isTyping),
      });
    });

    socket.on('joinChat', async (chatId: string, ack?: (err?: string) => void) => {
      try {
        if (!mongoose.isValidObjectId(chatId)) {
          ack?.('Invalid chat');
          return;
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
          ack?.('Not found');
          return;
        }
        assertChatMember(chat, userId);
        socket.join(`chat-${chatId}`);
        ack?.();
      } catch {
        ack?.('Forbidden');
      }
    });

    socket.on(
      'sendMessage',
      async (
        data: { chatId?: string; content?: string; type?: string },
        ack?: (err?: string, payload?: unknown) => void
      ) => {
        try {
          const { chatId, content, type } = data ?? {};
          if (!chatId) {
            ack?.('Missing chatId');
            return;
          }
          const result = await appendUserMessage({
            chatId,
            clerkId: userId,
            content: content ?? '',
            type,
          });
          ack?.(undefined, { messageId: String(result.message._id) });
        } catch (e) {
          ack?.(e instanceof Error ? e.message : 'Failed');
        }
      }
    );

    socket.on('askBoon', async (question: string) => {
      if (!question?.trim()) return;
      const chat = await findOrCreateAiChat(userId);
      const cid = String(chat._id);

      const userMsg = await Message.create({
        chatId: chat._id,
        senderId: userId,
        content: question.trim(),
        type: 'text',
      });

      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: question.slice(0, 120),
        lastMessageAt: new Date(),
      });

      broadcastNewMessage(cid, {
        _id: userMsg._id,
        senderId: userId,
        content: userMsg.content,
        type: userMsg.type,
        createdAt: userMsg.createdAt,
      });

      const ai = await generateCompanionReply(question.trim());

      const boonMsg = await Message.create({
        chatId: chat._id,
        senderId: BOON_SENDER_ID,
        content: ai.text,
        type: 'ai',
        metadata: { model: ai.model, mock: ai.mock },
      });

      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: ai.text.slice(0, 120),
        lastMessageAt: new Date(),
      });

      broadcastNewMessage(cid, {
        _id: boonMsg._id,
        senderId: BOON_SENDER_ID,
        content: boonMsg.content,
        type: boonMsg.type,
        createdAt: boonMsg.createdAt,
      });

      broadcastBoonResponse(userId, {
        message: ai.text,
        verseSuggestion: question.match(/(\d+:\d+)/)?.[1],
        mood: 'encouraging',
        chatId: cid,
        assistantMessageId: String(boonMsg._id),
      });
    });

    socket.on('disconnect', () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('user-offline', { userId });
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io initialized (Clerk JWT + chat persistence)');
};
