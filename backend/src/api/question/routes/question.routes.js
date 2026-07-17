import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";

// Controllers
import {
  createQuestionController,
  getSimilarQuestionsController,
} from "../controller/question.controller.js";

// Validations
import {
  createQuestionValidation,
  getSimilarQuestionsValidation,
} from "../validations/question.validation.js";

const router = express.Router();

/**
 * @route  POST /api/questions
 * @desc   Create a new question and generate a vector embedding
 * @access Protected
 */
router.post(
  "/",
  authenticateUser,
  createQuestionValidation,
  createQuestionController,
);

/**
 * @route  GET /api/questions/:questionHash/similar
 * @desc   Get AI-based similar questions using embeddings/vector search
 * @access Protected
 */
router.get(
  "/:questionHash/similar",
  authenticateUser,
  getSimilarQuestionsValidation,
  getSimilarQuestionsController,
);

export default router;
