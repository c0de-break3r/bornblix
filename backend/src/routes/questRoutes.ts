import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listQuests } from '../controllers/questController';

const router = Router();

router.get('/', authenticate, listQuests);

export default router;
