import express from 'express';
import { authenticateUser } from '../../../middleware/authentication.js';
import { createAnswerController } from '../controller/answer.controller.js';
import { createAnswerValidation } from '../validations/answer.validation.js';

const router = express.Router();

/**
 * @route POST /api/answers
 * @desc Create a new answer to a question
 * @access Private
 */
router.post(
  '/',
  authenticateUser,
  createAnswerValidation,
  createAnswerController,
);

export default router;
