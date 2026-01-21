import { Router } from 'express';
import passport from 'passport';

const router = Router();

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

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res, next) => {
    req.logIn(req.user!, (err) => {
      if (err) return next(err);
      res.redirect('http://localhost:5173/dashboard');
    });
  }
);


// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      res.redirect('http://localhost:5173/dashboard');
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