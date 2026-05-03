import type { Request, Response, NextFunction } from 'express';
import Quest from '../models/Quest';

export async function listQuests(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const quests = await Quest.find({ isActive: true }).sort({ order: 1, slug: 1 }).lean();
    res.json({ success: true, data: quests });
  } catch (e) {
    next(e);
  }
}
