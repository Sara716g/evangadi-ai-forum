import express from 'express';
import { authenticateUser } from '../../../middleware/authentication.js';
import { getSimilarQuestionsController } from '../controller/question.controller.js';
import { getSimilarQuestionsValidation } from '../validations/question.validation.js';

const router = express.Router();

router.get(
  '/:questionHash/similar',
  authenticateUser,
  getSimilarQuestionsValidation,
  getSimilarQuestionsController,
);

export default router;
