import { safeExecute } from "../../../../db/config.js";
import {
  findSimilarQuestionsByText,
  findSimilarQuestionsByQuestionId,
} from "./vector.service.js";

const DEFAULT_K = Number.parseInt(process.env.RECOMMEND_K, 10) || 5;
const DEFAULT_THRESHOLD =
  Number.parseFloat(process.env.RECOMMEND_THRESHOLD) || 0.75;

/**
 * Performs semantic search on questions using vector similarity.
 * @param {Object} params - Search parameters
 * @param {string} params.query - The search query text
 * @param {number} [params.k=5] - Maximum number of similar questions to return
 * @param {number} [params.threshold] - Similarity threshold (uses config default if not provided)
 * @returns {Promise<Object>} Object containing similar questions and search metadata
 */
export const searchQuestionsSemanticService = async ({
  query,
  k = DEFAULT_K,
  threshold = DEFAULT_THRESHOLD,
}) => {
  const result = await findSimilarQuestionsByText({
    sourceText: query,
    threshold,
    k,
  });

  return {
    data: result.similarQuestions,
    meta: {
      total: result.similarQuestions.length,
      k,
      threshold,
      query,
      questionHash: null,
    },
  };
};

/**
 * Find questions similar to a specific question by its ID.
 * @param {Object} params - Search parameters
 * @param {number} params.questionId - The question ID to find similar questions for
 * @param {number} [params.k=5] - Maximum number of results to return
 * @param {number} [params.threshold] - Similarity threshold (uses config default if not provided)
 * @returns {Promise<Object>} Object containing similar questions and metadata
 */
export const getSimilarQuestionsService = async ({
  questionId,
  k = DEFAULT_K,
  threshold = DEFAULT_THRESHOLD,
}) => {
  const result = await findSimilarQuestionsByQuestionId({
    questionId,
    threshold,
    k,
  });

  return {
    data: result.similarQuestions,
    meta: {
      questionId,
      k,
      threshold,
      total: result.similarQuestions.length,
    },
  };
};
