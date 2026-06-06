import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { getSimilarQuestionsController } from "../controller/question.controller.js";
import { getSimilarQuestionsValidation } from "../validations/question.validation.js";

const router = express.Router();

/**
 * [T-11] @route GET /api/questions/:questionHash/similar
 * @desc Recommend related questions from an existing question vector
 * @access Protected
 */
router.get(
  "/:questionHash/similar",
  authenticateUser,
  getSimilarQuestionsValidation,
  getSimilarQuestionsController,
);

export default router;
