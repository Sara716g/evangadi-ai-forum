import { body } from 'express-validator';
import { validationErrorHandler } from '../../../middleware/validation-handler.js';

/**
 * Validation for creating an answer
 * - questionId: must be a positive integer
 * - content: must be at least 20 characters
 */
export const createAnswerValidation = [
  body('questionId')
    .isInt({ min: 1 })
    .withMessage('questionId must be a positive integer'),
  body('content')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Answer content must be at least 20 characters'),
  validationErrorHandler,
];
