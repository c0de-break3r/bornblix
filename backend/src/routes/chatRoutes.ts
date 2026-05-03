import { Router } from 'express';
import { getChats, createChat, postAiCompanionMessage } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getChats);
router.post('/', authenticate, createChat);
router.post('/ai', authenticate, postAiCompanionMessage);

export default router;
