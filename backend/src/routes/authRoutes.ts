import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMe } from '../controllers/authController';

const router = Router();

router.get('/me', authenticate, (req, res, next) => {
  void getMe(req, res, next);
});

export default router;
