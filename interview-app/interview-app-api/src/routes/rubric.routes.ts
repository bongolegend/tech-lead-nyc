import { Router } from 'express';
import {
  getUserFeedback,
  deleteRubric,
  listRubricTemplates,
  createRubric,
} from '../controllers/rubrics.controller';

const router = Router();

router.get("/templates", listRubricTemplates);
router.post("/", createRubric);
router.get("/user/:userEmail/feedback", getUserFeedback);
router.delete("/:id", deleteRubric);


export default router;