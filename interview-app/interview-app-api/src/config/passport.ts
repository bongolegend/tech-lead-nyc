import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../db/client';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email from Google'));
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: profile.displayName,
            googleId: profile.id,
          },
          create: {
            email,
            name: profile.displayName,
            googleId: profile.id,
            profileCompleted: false,
          },
        });

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
