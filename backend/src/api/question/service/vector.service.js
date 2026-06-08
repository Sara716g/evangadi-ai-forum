import { safeExecute } from "../../../../db/config.js";
import { embedSearchQuery } from "../../../utils/gemini/embedding.service.js";
import {
  parseEmbedding,
  cosineSimilarity,
  // rankVectorsBySimilarity,
} from "../../../utils/vector/vector.utils.js";
import { ServiceUnavailableError } from "../../../utils/errors/index.js";

const RECOMMEND_K = Number.parseInt(process.env.RECOMMEND_K, 10) || 5;
const RECOMMEND_THRESHOLD =
  Number.parseFloat(process.env.RECOMMEND_THRESHOLD) || 0.75;

/**
 * Normalize text by converting to lowercase, applying Unicode NFKC normalization,
 * and collapsing multiple whitespace characters into single spaces.
 * Example: " What's NEW in    AI? " -> "what's new in ai?"
 * @param {string} text - The text to normalize
 * @returns {string} The normalized text
 */
export function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ").normalize("NFKC").toLowerCase();
}

/**
 * Retrieve all active question embeddings from the database
 * @returns {Promise<Array>} Array of objects with question_id and embedding
 */
export async function retrieveReadyEmbeddings() {
  const sql = `
    SELECT question_id, embedding 
    FROM question_vectors 
    WHERE status = 'ready'
  `;
  return safeExecute(sql, []);
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param {number[]} vectorA - First embedding vector
 * @param {number[]} vectorB - Second embedding vector
 * @returns {number} Cosine similarity score between -1 and 1
 */
export function calculateCosineSimilarity(vectorA, vectorB) {
  return cosineSimilarity(vectorA, vectorB);
}

/**
 * Fetch detailed question information for the given question IDs
 * @param {number[]} questionIds - Array of question IDs
 * @param {Map} scoreByQuestionId - Map of question ID to similarity score
 * @returns {Promise<Array>} Array of question objects with metadata
 */
export async function hydrateQuestions(questionIds, scoreByQuestionId) {
  if (!questionIds || questionIds.length === 0) {
    return [];
  }

  const placeholders = questionIds.map(() => "?").join(",");
  const sql = `
    SELECT
      q.question_id AS id,
      q.question_hash AS questionHash,
      q.title,
      q.content,
      q.created_at AS createdAt,
      q.updated_at AS updatedAt,
      u.user_id AS authorId,
      u.first_name AS authorFirstName,
      u.last_name AS authorLastName,
      COUNT(DISTINCT a.answer_id) AS answerCount
    FROM questions q
    INNER JOIN users u ON q.user_id = u.user_id
    LEFT JOIN answers a ON q.question_id = a.question_id
    WHERE q.question_id IN (${placeholders})
    GROUP BY q.question_id, q.question_hash, q.title, q.content, q.created_at, q.updated_at, u.user_id, u.first_name, u.last_name
  `;

  try {
    const rows = await safeExecute(sql, questionIds);

    return rows.map((row) => ({
      id: row.id,
      questionHash: row.questionHash,
      title: row.title,
      content: row.content,
      answerCount: Number(row.answerCount),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.authorId,
        firstName: row.authorFirstName,
        lastName: row.authorLastName,
      },
      score: scoreByQuestionId.get(row.id),
    }));
  } catch (error) {
    console.error("Error hydrating questions:", error);
    throw error;
  }
}

/**
 * Perform semantic search on questions using vector embeddings
 * @param {Object} params - Search parameters
 * @param {string} params.sourceText - The search query text
 * @param {number} [params.threshold] - Minimum similarity threshold (uses RECOMMEND_THRESHOLD if not provided)
 * @param {number} [params.k] - Maximum number of results to return (uses RECOMMEND_K if not provided)
 * @returns {Promise<Object>} Object containing similarQuestions array and metadata
 */
export async function findSimilarQuestionsByText({ sourceText, threshold, k }) {
  // Normalize parameters
  const normalizedK = k || RECOMMEND_K;
  const normalizedThreshold =
    threshold !== undefined ? threshold : RECOMMEND_THRESHOLD;

  // Validate sourceText
  if (
    !sourceText ||
    typeof sourceText !== "string" ||
    sourceText.trim().length === 0
  ) {
    throw new Error("sourceText must be a non-empty string");
  }

  // Generate embedding for the search query using RETRIEVAL_QUERY task type
  let queryEmbedding;
  try {
    queryEmbedding = await embedSearchQuery(sourceText);
  } catch (error) {
    console.error("Error generating search query embedding:", error);
    throw new ServiceUnavailableError(
      "Failed to generate embedding for search query. Please try again later.",
    );
  }

  // Retrieve all ready embeddings from the database
  let storedVectors;
  try {
    storedVectors = await retrieveReadyEmbeddings();
  } catch (error) {
    console.error("Error retrieving stored vectors:", error);
    throw error;
  }

  if (!storedVectors || storedVectors.length === 0) {
    return {
      similarQuestions: [],
      metadata: {
        total: 0,
        k: normalizedK,
        threshold: normalizedThreshold,
      },
    };
  }

  // Calculate cosine similarity scores and filter by threshold
  const similarities = [];
  for (const stored of storedVectors) {
    try {
      const storedEmbedding = parseEmbedding(stored.embedding);
      const score = calculateCosineSimilarity(queryEmbedding, storedEmbedding);

      if (score >= normalizedThreshold) {
        similarities.push({
          questionId: stored.question_id,
          score,
        });
      }
    } catch (error) {
      console.warn(
        `Failed to calculate similarity for question ${stored.question_id}:`,
        error.message,
      );
      continue;
    }
  }

  // Sort by score descending and limit to top k results
  similarities.sort((a, b) => b.score - a.score);
  const topResults = similarities.slice(0, normalizedK);

  if (topResults.length === 0) {
    return {
      similarQuestions: [],
      metadata: {
        total: 0,
        k: normalizedK,
        threshold: normalizedThreshold,
      },
    };
  }

  // Fetch detailed question information
  const questionIds = topResults.map((result) => result.questionId);
  const scoreByQuestionId = new Map(
    topResults.map((result) => [result.questionId, result.score]),
  );

  try {
    const questions = await hydrateQuestions(questionIds, scoreByQuestionId);

    return {
      similarQuestions: questions,
      metadata: {
        total: questions.length,
        k: normalizedK,
        threshold: normalizedThreshold,
      },
    };
  } catch (error) {
    console.error("Error hydrating question details:", error);
    throw error;
  }
}

/**
 * Find similar questions to a specific question by its ID
 * @param {Object} params - Search parameters
 * @param {number} params.questionId - The question ID to find similar questions for
 * @param {number} [params.threshold] - Minimum similarity threshold
 * @param {number} [params.k] - Maximum number of results to return
 * @returns {Promise<Object>} Object containing similar questions
 */
export async function findSimilarQuestionsByQuestionId({
  questionId,
  threshold,
  k,
}) {
  // Fetch the source question
  const sourceSql = `SELECT title, content FROM questions WHERE question_id = ?`;
  const sourceRows = await safeExecute(sourceSql, [questionId]);

  if (!sourceRows || sourceRows.length === 0) {
    throw new Error(`Question with ID ${questionId} not found`);
  }

  const { title, content } = sourceRows[0];
  const sourceText = normalizeText(`${title} ${content}`);

  // Retrieve stored embedding for this question
  const vectorSql = `SELECT embedding FROM question_vectors WHERE question_id = ? AND status = 'ready'`;
  const vectorRows = await safeExecute(vectorSql, [questionId]);

  if (!vectorRows || vectorRows.length === 0) {
    throw new Error(`Vector embedding not found for question ${questionId}`);
  }

  const sourceEmbedding = parseEmbedding(vectorRows[0].embedding);

  // Normalize parameters
  const normalizedK = k || RECOMMEND_K;
  const normalizedThreshold =
    threshold !== undefined ? threshold : RECOMMEND_THRESHOLD;

  // Retrieve all ready embeddings except the source question
  const sql = `
    SELECT question_id, embedding 
    FROM question_vectors 
    WHERE status = 'ready' AND question_id != ?
  `;
  const storedVectors = await safeExecute(sql, [questionId]);

  if (!storedVectors || storedVectors.length === 0) {
    return {
      similarQuestions: [],
      metadata: {
        total: 0,
        k: normalizedK,
        threshold: normalizedThreshold,
        sourceQuestionId: questionId,
      },
    };
  }

  // Calculate cosine similarity scores
  const similarities = [];
  for (const stored of storedVectors) {
    try {
      const storedEmbedding = parseEmbedding(stored.embedding);
      const score = calculateCosineSimilarity(sourceEmbedding, storedEmbedding);

      if (score >= normalizedThreshold) {
        similarities.push({
          questionId: stored.question_id,
          score,
        });
      }
    } catch (error) {
      console.warn(
        `Failed to calculate similarity for question ${stored.question_id}:`,
        error.message,
      );
      continue;
    }
  }

  // Sort and limit results
  similarities.sort((a, b) => b.score - a.score);
  const topResults = similarities.slice(0, normalizedK);

  if (topResults.length === 0) {
    return {
      similarQuestions: [],
      metadata: {
        total: 0,
        k: normalizedK,
        threshold: normalizedThreshold,
        sourceQuestionId: questionId,
      },
    };
  }

  // Fetch question details
  const resultQuestionIds = topResults.map((result) => result.questionId);
  const scoreByQuestionId = new Map(
    topResults.map((result) => [result.questionId, result.score]),
  );

  try {
    const questions = await hydrateQuestions(
      resultQuestionIds,
      scoreByQuestionId,
    );

    return {
      similarQuestions: questions,
      metadata: {
        total: questions.length,
        k: normalizedK,
        threshold: normalizedThreshold,
        sourceQuestionId: questionId,
      },
    };
  } catch (error) {
    console.error("Error hydrating question details:", error);
    throw error;
  }
}

/**
 * Get the current vector search configuration values from environment variables or defaults.
 * @returns {Object} The current vector configuration values.
 */
export function getVectorConfig() {
  return {
    recommendThreshold: RECOMMEND_THRESHOLD,
    recommendK: RECOMMEND_K,
  };
}
