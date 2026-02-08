import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export type JwtPayload = { email: string };

export function signToken(user: User): string {
  return jwt.sign(
    { email: user.email } as JwtPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}
