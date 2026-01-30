import { Router } from 'express';
import { updateProfile, getUser } from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.get('/:email', isAuthenticated, getUser);
router.put('/:email/profile', isAuthenticated, updateProfile);

export default router;
