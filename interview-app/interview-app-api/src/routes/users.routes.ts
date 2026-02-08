import { Router } from 'express';
import { updateProfile, getUser } from '../controllers/users.controller';
import { requireJwt } from '../middleware/jwtAuth';

const router = Router();

router.get('/:email', requireJwt, getUser);
router.put('/:email/profile', requireJwt, updateProfile);

export default router;
