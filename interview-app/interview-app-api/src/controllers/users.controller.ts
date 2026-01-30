import { Request, Response } from 'express';
import prisma from '../db/client';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { professionalLevel, hasBeenHiringManager } = req.body;
    const authenticatedUser = req.user as any;

    // Ensure user can only update their own profile
    if (authenticatedUser && authenticatedUser.email !== email) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        professionalLevel,
        hasBeenHiringManager: hasBeenHiringManager === true || hasBeenHiringManager === 'true',
        profileCompleted: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
