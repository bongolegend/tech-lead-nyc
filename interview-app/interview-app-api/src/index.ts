import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import cors from "cors";

import './config/passport';
import dashboardRoutes from './routes/dashboard.routes';
import authRoutes from './routes/auth.routes';
import rubricRoutes from './routes/rubric.routes';


const app = express();
const PORT = process.env.PORT || 3001;

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

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/rubrics', rubricRoutes);
app.use("/rubric-templates", rubricRoutes);

// Home route - redirect to login or dashboard
// app.get('/', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.redirect('/dashboard');
//   } else {
//     res.redirect('/auth/login');
//   }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});