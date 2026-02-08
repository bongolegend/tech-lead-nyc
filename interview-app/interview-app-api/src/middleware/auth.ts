import { Request, Response, NextFunction } from 'express';

const FRONTEND_URL = process.env.FRONTEND_URL!;

/** Use requireJwt from middleware/jwtAuth for protection. This is only for profile-complete check. */
export const isProfileComplete = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.redirect(`${FRONTEND_URL}/login`);
  }
  if (!user.profileCompleted) {
    return res.redirect(`${FRONTEND_URL}/dashboard`);
  }
  return next();
};