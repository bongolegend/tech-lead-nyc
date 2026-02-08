import { OAuth2Client } from 'google-auth-library';
import prisma from '../db/client';
import type { User } from '@prisma/client';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token (from mobile or web client) and return our User.
 * Returns null if token is invalid.
 */
export async function verifyGoogleIdTokenAndGetUser(idToken: string): Promise<User | null> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) return null;

  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: {
      name: payload.name ?? undefined,
      googleId: payload.sub,
    },
    create: {
      email: payload.email,
      name: payload.name ?? undefined,
      googleId: payload.sub,
      profileCompleted: false,
    },
  });
  return user;
}
