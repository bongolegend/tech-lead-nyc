import { Router } from 'express';
import passport from 'passport';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL!;


// // Login page
// router.get('/login', (req, res) => {
//   if (req.isAuthenticated()) {
//     return res.redirect('/dashboard');
//   }
//   res.render('login', { title: 'Login' });
// });

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback (save session to Postgres before redirect so /auth/me sees it)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res, next) => {
    req.logIn(req.user!, (err) => {
      if (err) return next(err);
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        res.redirect(`${FRONTEND_URL}/dashboard`);
      });
    });
  }
);


// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      res.redirect(`${FRONTEND_URL}/dashboard`);
    }
    res.redirect('/auth/login');
  });
});

router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json(null);
    }
    res.json(req.user);
  });
  

export default router;