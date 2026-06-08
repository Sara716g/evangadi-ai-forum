import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { searchQuestionsSemanticController } from "../controller/question.controller.js";
import { searchQuestionsSemanticValidation } from "../validations/question.validation.js";

const router = express.Router();

router.get(
  "/search",
  authenticateUser,
  searchQuestionsSemanticValidation,
  searchQuestionsSemanticController,
);

export default router;
