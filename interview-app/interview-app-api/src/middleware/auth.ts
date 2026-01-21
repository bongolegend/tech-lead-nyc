import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
};

export const isProfileComplete = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as any;
    if (!user.profileCompleted) {
      return res.redirect('http://localhost:5173/dashboard');
    }
    return next();
  }
  res.redirect('/auth/login');
};