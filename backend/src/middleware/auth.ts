import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';

export { clerkMiddleware, requireAuth };

/** Attach auth context; inference routes still call requireAuth separately. */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (auth?.userId) {
    res.locals.userId = auth.userId;
  }
  next();
}
