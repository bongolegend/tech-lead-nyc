import { Router, Request, Response } from 'express';
import { signToken } from '../auth/jwt';
import { verifyGoogleIdTokenAndGetUser } from '../auth/googleToken';
import { requireJwt } from '../middleware/jwtAuth';

const router = Router();

// --- Google login: exchange Google ID token for our JWT (no redirects, no Passport) ---

router.post('/google/token', async (req: Request, res: Response) => {
  const credential = req.body?.credential as string | undefined;
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid credential (Google ID token)' });
  }
  try {
    const user = await verifyGoogleIdTokenAndGetUser(credential);
    if (!user) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }
    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error('Google token verification failed:', err);
    return res.status(401).json({ error: 'Invalid Google credential' });
  }
});

// --- Current user (requires JWT) ---

router.get('/me', requireJwt, (req: Request, res: Response) => {
  res.json(req.user);
});

// --- Logout (client discards token; no server state) ---

router.get('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

export default router;
