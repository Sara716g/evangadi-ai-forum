import { body, query, param } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

export const getQuestionsValidation = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .trim(),
  query("mine")
    .optional()
    .isBoolean()
    .withMessage("mine must be a boolean")
    .toBoolean(),

  validationErrorHandler,
];

export const getSingleQuestionValidation = [
  param("questionHash")
    .isString()
    .withMessage("Question hash is required and must be a string")
    .matches(/^[a-f0-9]{16}$/)
    .withMessage(
      "Question hash must be a valid 16-character hexadecimal string",
    ),
  validationErrorHandler,
];
