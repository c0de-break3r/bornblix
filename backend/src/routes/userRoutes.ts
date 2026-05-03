import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProgress, getStreak, syncGamification } from '../controllers/userController';

const router = Router();

/**
 * Bornblix User Routes
 * Syncs mobile gamification (streak, XP, level, hearts, coins, quests, badges)
 * with backend persistence.
 */

// Get current user profile + gamification state
router.get('/profile', authenticate, getProfile);

// Update user progress from mobile (streak, XP, completed quests)
router.post('/progress', authenticate, updateProgress);

// Get current streak data
router.get('/streak', authenticate, getStreak);

// Full gamification sync (used when mobile Zustand state changes)
router.post('/sync', authenticate, syncGamification);

export default router;
