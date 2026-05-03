import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AppError } from '../middleware/errorHandler';
import { assertChatMember, BOON_SENDER_ID, findOrCreateAiChat } from '../utils/chatAccess';
import { generateCompanionReply } from '../services/aiChat';
import { broadcastBoonResponse, broadcastNewMessage } from '../utils/messageBroadcast';

export const getChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clerkId = req.user!.clerkId;
    const chats = await Chat.find({ participants: clerkId }).sort({ lastMessageAt: -1 }).lean();
    res.json({ success: true, data: chats });
  } catch (e) {
    next(e);
  }
};

export const createChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clerkId = req.user!.clerkId;
    const { kind = 'direct', title, participantIds = [] } = req.body as {
      kind?: 'ai' | 'direct' | 'group';
      title?: string;
      participantIds?: string[];
    };

    if (kind === 'ai') {
      const chat = await findOrCreateAiChat(clerkId);
      res.status(201).json({ success: true, data: chat });
      return;
    }

    const others = participantIds.filter((id) => id && id !== clerkId);
    if (kind === 'direct' && others.length !== 1) {
      next(new AppError('Direct chat requires exactly one other participantId', 400));
      return;
    }

    const participants = [...new Set([clerkId, ...others])];

    const chat = await Chat.create({
      participants,
      kind,
      title: title ?? (kind === 'direct' ? 'Chat' : 'Group'),
      createdBy: clerkId,
      lastMessageAt: new Date(),
    });

    res.status(201).json({ success: true, data: chat });
  } catch (e) {
    next(e);
  }
};

/** POST /api/chat/ai — AI companion turn (persists user + assistant messages). */
export const postAiCompanionMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clerkId = req.user!.clerkId;
    const { prompt, chatId: rawChatId } = req.body as { prompt?: string; chatId?: string };

    if (!prompt?.trim()) {
      next(new AppError('prompt is required', 400));
      return;
    }

    let resolved =
      rawChatId && mongoose.isValidObjectId(rawChatId) ? await Chat.findById(rawChatId) : null;

    if (resolved) {
      assertChatMember(resolved, clerkId);
      if (resolved.kind !== 'ai') {
        next(new AppError('Chat is not an AI companion thread', 400));
        return;
      }
    } else {
      resolved = await findOrCreateAiChat(clerkId);
    }

    const chat = resolved;

    const cid = String(chat._id);

    const userMsg = await Message.create({
      chatId: chat._id,
      senderId: clerkId,
      content: prompt.trim(),
      type: 'text',
    });

    await Chat.findByIdAndUpdate(chat._id, {
      lastMessage: prompt.slice(0, 120),
      lastMessageAt: new Date(),
    });

    broadcastNewMessage(cid, {
      _id: userMsg._id,
      senderId: clerkId,
      content: userMsg.content,
      type: userMsg.type,
      createdAt: userMsg.createdAt,
    });

    const ai = await generateCompanionReply(prompt.trim());

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

    broadcastBoonResponse(clerkId, {
      message: ai.text,
      verseSuggestion: extractVerseSuggestion(ai.text),
      mood: 'encouraging',
      chatId: cid,
      assistantMessageId: String(boonMsg._id),
    });

    res.json({
      success: true,
      data: {
        chatId: cid,
        userMessageId: String(userMsg._id),
        assistantMessageId: String(boonMsg._id),
        response: ai.text,
        model: ai.model,
        mock: ai.mock,
        suggestedFollowUps: [
          'What does this mean for my life?',
          'Generate a prayer',
          'Show me related verses',
        ],
      },
    });
  } catch (e) {
    next(e);
  }
};

function extractVerseSuggestion(text: string): string | undefined {
  const m = text.match(/\b([1-3]?\s?[A-Za-z]+)\s+(\d{1,3}):(\d{1,3}(?:[-–]\d{1,3})?)\b/);
  return m ? m[0] : undefined;
}
