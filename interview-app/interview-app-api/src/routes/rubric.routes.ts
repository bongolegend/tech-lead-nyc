import { Router } from 'express';
import {
  getRubricsBySessionId,
  getUserFeedback,
  updateRubric,
  deleteRubric,
} from '../controllers/rubrics.controller';

const router = Router();

router.get('/session/:sessionId', getRubricsBySessionId);
router.get('/user/:userEmail/feedback', getUserFeedback);
router.put('/:id', updateRubric);
router.delete('/:id', deleteRubric);

export default router;