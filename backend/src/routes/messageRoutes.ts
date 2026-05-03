import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:chatId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);

export default router;
