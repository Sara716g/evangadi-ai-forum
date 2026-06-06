import { safeExecute } from "../../../../db/config.js";
import { NotFoundError } from "../../../utils/errors/index.js";

const DEFAULT_K = Number.parseInt(process.env.RECOMMEND_K, 10) || 5;
const DEFAULT_THRESHOLD =
  Number.parseFloat(process.env.RECOMMEND_THRESHOLD) || 0.75;

// [T-11] Normalize embedding values stored as JSON in MySQL
const parseEmbedding = (embedding) => {
  if (Array.isArray(embedding)) {
    return embedding;
  }

  if (typeof embedding === "string") {
    return JSON.parse(embedding);
  }

  return embedding;
};

// [T-11] Cosine similarity via dot product: cos(a,b) = (a·b) / (||a|| * ||b||)
const cosineSimilarity = (vectorA, vectorB) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorB.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
};

// [T-11] Load question + author fields for the ranked similar-question IDs
const hydrateQuestionsByIds = async (rankedMatches, scoreByQuestionId) => {
  if (rankedMatches.length === 0) {
    return [];
  }
  const questionIds = rankedMatches.map((match) => match.questionId);
  const placeholders = questionIds.map(() => "?").join(", ");

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
      COUNT(a.answer_id) AS answerCount
    FROM questions q
    INNER JOIN users u ON q.user_id = u.user_id
    LEFT JOIN answers a ON q.question_id = a.question_id
    WHERE q.question_id IN (${placeholders})
    GROUP BY
      q.question_id,
      q.question_hash,
      q.title,
      q.content,
      q.created_at,
      q.updated_at,
      u.user_id,
      u.first_name,
      u.last_name
  `;

  const rows = await safeExecute(sql, questionIds);
  const rowById = new Map(rows.map((row) => [row.id, row]));

  return rankedMatches
    .map((match) => {
      const row = rowById.get(match.questionId);
      if (!row) {
        return null;
      }

      return {
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
        score: scoreByQuestionId.get(match.questionId),
      };
    })
    .filter(Boolean);
};

/**
 * [T-11] Recommend related questions from an existing question's embedding vector.
 *
 * @param {Object} params
 * @param {string} params.questionHash - Source question hash from the URL.
 * @param {number} [params.k=5] - Maximum number of similar questions to return.
 * @param {number} [params.threshold=0.75] - Minimum cosine similarity score.
 * @returns {Promise<{ data: Array, meta: Object }>}
 */
export const getSimilarQuestionsService = async ({
  questionHash,
  k = DEFAULT_K,
  threshold = DEFAULT_THRESHOLD,
}) => {
  // [T-11] Step 1: find the source question and its ready vector embedding
  const sourceSql = `
    SELECT q.question_id, q.question_hash, qv.embedding
    FROM questions q
    INNER JOIN question_vectors qv ON q.question_id = qv.question_id
    WHERE q.question_hash = ? AND qv.status = 'ready'
    LIMIT 1
  `;
  const sourceRows = await safeExecute(sourceSql, [questionHash]);

  if (sourceRows.length === 0) {
    throw new NotFoundError("Question not found or vector not ready");
  }

  const sourceQuestion = sourceRows[0];
  const sourceVector = parseEmbedding(sourceQuestion.embedding);

  // [T-11] Step 2: fetch all other ready vectors, excluding the source question
  const vectorsSql = `
    SELECT question_id, embedding
    FROM question_vectors
    WHERE status = 'ready' AND question_id != ?
  `;
  const vectorRows = await safeExecute(vectorsSql, [
    sourceQuestion.question_id,
  ]);

  // [T-11] Step 3: compute cosine similarity for every candidate vector
  const scoredMatches = vectorRows
    .map((row) => ({
      questionId: row.question_id,
      score: cosineSimilarity(sourceVector, parseEmbedding(row.embedding)),
    }))
    // [T-11] Step 4: keep matches above threshold, sort desc, then limit to k
    .filter((match) => match.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  const scoreByQuestionId = new Map(
    scoredMatches.map((match) => [match.questionId, match.score]),
  );

  // [T-11] Step 5: hydrate title, content, author, and answer counts
  const data = await hydrateQuestionsByIds(scoredMatches, scoreByQuestionId);

  return {
    data,
    meta: {
      total: data.length,
      k,
      threshold,
      query: null,
      questionHash,
    },
  };
};
