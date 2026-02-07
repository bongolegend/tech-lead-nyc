import 'dotenv/config';

import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { Pool } from 'pg';

console.log("SERVER ENTRY STARTED");

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const isProd = process.env.NODE_ENV === 'production';

app.get("/", (_req, res) => {
  res.send("ok");
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration (Postgres store so sessions persist across Cloud Run instances)
app.set('trust proxy', 1);

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      createTableIfMissing: true,
    }),
    name: 'sid',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    },
  })
);



// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Startup env validation
const requiredEnv = [
  'SESSION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'FRONTEND_URL',
  'API_URL',
];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error('Missing required env:', missingEnv.join(', '));
  process.exit(1);
}

(async () => {
  await import('./config/passport');

  const dashboardRoutes = (await import('./routes/dashboard.routes')).default;
  const authRoutes = (await import('./routes/auth.routes')).default;
  const rubricRoutes = (await import('./routes/rubric.routes')).default;
  const usersRoutes = (await import('./routes/users.routes')).default;

  app.use('/auth', authRoutes);
  app.use('/dashboard', dashboardRoutes);
  app.use('/rubrics', rubricRoutes);
  app.use('/rubric-templates', rubricRoutes);
  app.use('/api/users', usersRoutes);

  // Global error handler (must be after routes)
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: 'Internal Server Error',
      ...(!isProduction && { details: err.message, stack: err.stack }),
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Passport + routes initialized');
  });
})();
