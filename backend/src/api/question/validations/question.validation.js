import { query } from 'express-validator';
import { validationErrorHandler } from '../../../middleware/validation-handler.js';

export const QUESTION_HASH_REGEX = /^[a-f0-9]{16}$/;

const optionalKValidation = query('k')
  .optional()
  .isInt({ min: 1, max: 20 })
  .withMessage('k must be an integer between 1 and 20')
  .toInt();

const optionalThresholdValidation = query('threshold')
  .optional()
  .isFloat({ min: 0, max: 1 })
  .withMessage('threshold must be a number between 0 and 1')
  .toFloat();

export const searchQuestionsSemanticValidation = [
  query('query')
    .notEmpty()
    .withMessage('query is required')
    .isString()
    .withMessage('query must be a string')
    .trim()
    .isLength({ min: 5 })
    .withMessage('query must be at least 5 characters'),
  optionalKValidation,
  optionalThresholdValidation,
  validationErrorHandler,
];
```
