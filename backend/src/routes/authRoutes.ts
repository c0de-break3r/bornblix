import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Webhook endpoint for Clerk (sync user creation/updates)
router.post('/webhook', async (req: Request, res: Response) => {
  // In production, verify Clerk webhook signature
  console.log('Clerk webhook received:', req.body);
  res.status(200).json({ success: true });
});

router.get('/me', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: "Auth route working. Use Clerk on mobile for primary auth." 
  });
});

export default router;
