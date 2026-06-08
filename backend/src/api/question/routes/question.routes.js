import express from "express";

// Controllers
import {
  getQuestionsController,
  getSingleQuestionController,
} from "../controller/question.controller.js";

// Middleware
import {
  getQuestionsValidation,
  getSingleQuestionValidation,
} from "../validations/question.validation.js";

import { authenticateUser } from "../../../middleware/authentication.js";

const router = express.Router();

/**
 * @route   GET /api/questions
 * @desc    Get all questions; supports optional filtering
 * @query   {string}  [search] - Filter questions by title or content (SQL LIKE)
 * @query   {boolean} [mine]   - When true, return only the authenticated user's questions
 * @access  Private
 */
router.get(
  "/",
  authenticateUser,
  getQuestionsValidation,
  getQuestionsController,
);

/**
 * @route GET /api/questions/:questionHash
 * @desc Get one question with answers
 * @access Private
 */
router.get(
  "/:questionHash",
  authenticateUser,
  getSingleQuestionValidation,
  getSingleQuestionController,
);

export default router;
