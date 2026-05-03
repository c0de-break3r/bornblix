import type { Request, Response, NextFunction } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clerkId = req.user!.clerkId;
    let user = await User.findOne({ clerkId });

    if (!user) {
      const auth = getAuth(req);
      const u = await clerkClient.users.getUser(auth.userId!);
      const email =
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
        u.emailAddresses[0]?.emailAddress ??
        `${clerkId}@users.bornblix.app`;

      user = await User.create({
        clerkId,
        email,
        firstName: u.firstName ?? undefined,
        lastName: u.lastName ?? undefined,
        avatar: u.imageUrl ?? undefined,
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { streak, xp, level, hearts, coins, completedQuests } = req.body as {
      streak?: number;
      xp?: number;
      level?: number;
      hearts?: number;
      coins?: number;
      completedQuests?: string[];
    };
    const clerkId = req.user!.clerkId;

    const $set: Record<string, unknown> = { lastVisitDate: new Date() };
    if (streak !== undefined) $set.streak = streak;
    if (xp !== undefined) $set.xp = xp;
    if (level !== undefined) $set.level = level;
    if (hearts !== undefined) $set.hearts = hearts;
    if (coins !== undefined) $set.coins = coins;
    if (completedQuests !== undefined) $set.completedQuests = completedQuests;

    const user = await User.findOneAndUpdate({ clerkId }, { $set }, { new: true, upsert: true, runValidators: true });

    res.json({
      success: true,
      message: 'Progress synced with Bōōns',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getStreak = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ clerkId: req.user!.clerkId }).select(
      'streak lastVisitDate level xp'
    );

    res.json({
      success: true,
      data: user ?? { streak: 0, lastVisitDate: new Date(), level: 1, xp: 0 },
    });
  } catch (error) {
    next(error);
  }
};

export const syncGamification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { streak, xp, level, hearts, coins, completedQuests, badges } = req.body as {
      streak?: number;
      xp?: number;
      level?: number;
      hearts?: number;
      coins?: number;
      completedQuests?: string[];
      badges?: { id: string; name: string; icon: string; unlockedAt?: Date }[];
    };
    const clerkId = req.user!.clerkId;

    const $set: Record<string, unknown> = { lastVisitDate: new Date() };
    if (streak !== undefined) $set.streak = streak;
    if (xp !== undefined) $set.xp = xp;
    if (level !== undefined) $set.level = level;
    if (hearts !== undefined) $set.hearts = hearts;
    if (coins !== undefined) $set.coins = coins;
    if (completedQuests !== undefined) $set.completedQuests = completedQuests;
    if (badges !== undefined) $set.badges = badges;

    const user = await User.findOneAndUpdate({ clerkId }, { $set }, { new: true, upsert: true });

    res.json({
      success: true,
      message: 'Gamification state synchronized with the cloud. Bōōns is proud of you.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
