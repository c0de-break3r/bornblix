import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ clerkId: (req as any).user.clerkId });
    
    if (!user) {
      const newUser = await User.create({
        clerkId: (req as any).user.clerkId,
        email: (req as any).user.email,
        firstName: (req as any).user.firstName,
        lastName: (req as any).user.lastName,
        avatar: (req as any).user.imageUrl,
      });
      return res.json({ success: true, data: newUser });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { streak, xp, level, hearts, coins, completedQuests } = req.body;
    const clerkId = (req as any).user.clerkId;

    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        $set: { 
          streak: streak ?? undefined,
          xp: xp ?? undefined,
          level: level ?? undefined,
          hearts: hearts ?? undefined,
          coins: coins ?? undefined,
          completedQuests: completedQuests ?? undefined,
          lastVisitDate: new Date()
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'Progress synced with Bōōns',
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

export const getStreak = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ clerkId: (req as any).user.clerkId })
      .select('streak lastVisitDate level xp');

    res.json({ 
      success: true, 
      data: user || { streak: 0, lastVisitDate: new Date(), level: 1, xp: 0 } 
    });
  } catch (error) {
    next(error);
  }
};

export const syncGamification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { streak, xp, level, hearts, coins, completedQuests, badges } = req.body;
    const clerkId = (req as any).user.clerkId;

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        streak,
        xp,
        level,
        hearts,
        coins,
        completedQuests: completedQuests || [],
        badges: badges || [],
        lastVisitDate: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Gamification state synchronized with the cloud. Bōōns is proud of you.",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
