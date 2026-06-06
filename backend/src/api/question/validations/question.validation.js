import { param, query } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

// [T-11] 16-char lowercase hex hash used in question detail and similar-question routes
export const QUESTION_HASH_REGEX = /^[a-f0-9]{16}$/;

// [T-11] Validate questionHash path param plus optional k and threshold query params
export const getSimilarQuestionsValidation = [
  param("questionHash")
    .matches(QUESTION_HASH_REGEX)
    .withMessage("questionHash must be a 16-character lowercase hex string"),
  query("k")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("k must be an integer between 1 and 20")
    .toInt(),
  query("threshold")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("threshold must be a number between 0 and 1")
    .toFloat(),
  validationErrorHandler,
];
