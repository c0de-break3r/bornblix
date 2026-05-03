import { Router } from 'express';
import { getChats, createChat, getAIResponse } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getChats);
router.post('/', authenticate, createChat);
router.post('/ai', authenticate, getAIResponse); // AI Companion endpoint

export default router;
