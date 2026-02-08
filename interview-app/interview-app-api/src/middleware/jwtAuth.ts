import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/jwt';
import prisma from '../db/client';

const FRONTEND_URL = process.env.FRONTEND_URL!;

/**
 * Require valid JWT. Attaches user to req.user.
 * For API routes: returns 401 JSON.
 * For browser redirects (e.g. dashboard): redirects to frontend login.
 */
export const requireJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    if (req.accepts('json')) {
      return res.status(401).json({ error: 'Unauthorized', code: 'NO_TOKEN' });
    }
    return res.redirect(`${FRONTEND_URL}/login`);
  }

  const payload = verifyToken(token);
  if (!payload) {
    if (req.accepts('json')) {
      return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN' });
    }
    return res.redirect(`${FRONTEND_URL}/login`);
  }

  prisma.user
    .findUnique({ where: { email: payload.email } })
    .then((user) => {
      if (!user) {
        if (req.accepts('json')) {
          return res.status(401).json({ error: 'Unauthorized', code: 'USER_NOT_FOUND' });
        }
        return res.redirect(`${FRONTEND_URL}/login`);
      }
      (req as any).user = user;
      next();
    })
    .catch(next);
};

/**
 * Optional JWT: if valid token present, sets req.user; otherwise continues without user.
 */
export const optionalJwt = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload) return next();

  try {
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (user) (req as any).user = user;
  } catch (_) {}
  next();
};
