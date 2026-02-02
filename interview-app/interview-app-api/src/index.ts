import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import cors from "cors";

console.log("SERVER ENTRY STARTED");

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.get("/", (_req, res) => {
  res.send("ok");
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

console.log("ABOUT TO LISTEN", PORT);

let initialized = false;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  if (!initialized) {
    await import('./config/passport');

    const dashboardRoutes = (await import('./routes/dashboard.routes')).default;
    const authRoutes = (await import('./routes/auth.routes')).default;
    const rubricRoutes = (await import('./routes/rubric.routes')).default;
    const usersRoutes = (await import('./routes/users.routes')).default;

    app.use('/auth', authRoutes);
    app.use('/dashboard', dashboardRoutes);
    app.use('/rubrics', rubricRoutes);
    app.use("/rubric-templates", rubricRoutes);
    app.use('/api/users', usersRoutes);

    initialized = true;
    console.log("Passport + routes initialized");
  }
});
