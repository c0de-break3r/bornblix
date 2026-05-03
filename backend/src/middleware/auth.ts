import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

/**
 * Requires a valid Clerk session JWT (Authorization: Bearer … or cookies).
 * Runs after `clerkMiddleware()`. Attaches `req.user.clerkId`.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    req.user = { clerkId: auth.userId };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}
