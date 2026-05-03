import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AppError } from '../middleware/errorHandler';
import { assertChatMember } from '../utils/chatAccess';
import { appendUserMessage } from '../services/messageService';

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawParam = req.params.chatId;
    const chatId = typeof rawParam === 'string' ? rawParam : rawParam?.[0];
    if (!chatId || !mongoose.isValidObjectId(chatId)) {
      next(new AppError('Invalid chat id', 400));
      return;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      next(new AppError('Chat not found', 404));
      return;
    }

    assertChatMember(chat, req.user!.clerkId);

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const rawCursor = req.query.cursor;
    const cursor = typeof rawCursor === 'string' ? rawCursor : undefined;

    const filter: { chatId: mongoose.Types.ObjectId; _id?: { $lt: mongoose.Types.ObjectId } } = {
      chatId: new mongoose.Types.ObjectId(chatId),
    };
    if (cursor && mongoose.isValidObjectId(cursor)) {
      filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const messages = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (e) {
    next(e);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chatId, content, type = 'text' } = req.body as {
      chatId?: string;
      content?: string;
      type?: string;
    };

    if (!chatId) {
      next(new AppError('chatId is required', 400));
      return;
    }

    const { message } = await appendUserMessage({
      chatId,
      clerkId: req.user!.clerkId,
      content: content ?? '',
      type,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent and synced',
      data: message,
    });
  } catch (e) {
    next(e);
  }
};
