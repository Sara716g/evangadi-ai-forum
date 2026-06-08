import { safeExecute } from '../../../../db/config.js';
import { BadRequestError, NotFoundError } from '../../../utils/errors/index.js';

/**
 * Creates a new answer to a question
 * @param {Object} params - Answer data
 * @param {number} params.questionId - ID of the question being answered
 * @param {number} params.userId - ID of the user posting the answer
 * @param {string} params.content - The answer content (min 20 chars)
 * @returns {Promise<Object>} The created answer object with author info
 * @throws {NotFoundError} If question not found
 * @throws {BadRequestError} If user is answering their own question
 */
export const createAnswerService = async ({ questionId, userId, content }) => {
  // Step 1: Fetch the question to verify it exists and check ownership
  const questionSql = `
    SELECT question_id, user_id 
    FROM questions 
    WHERE question_id = ?
  `;
  const questionRows = await safeExecute(questionSql, [questionId]);

  if (!questionRows || questionRows.length === 0) {
    throw new NotFoundError(`Question with ID ${questionId} not found`);
  }

  const question = questionRows[0];

  // Step 2: Check if user is answering their own question
  if (question.user_id === userId) {
    throw new BadRequestError('You cannot answer your own question');
  }

  // Step 3: Insert the answer into the database
  const insertAnswerSql = `
    INSERT INTO answers (question_id, user_id, content)
    VALUES (?, ?, ?)
  `;
  const result = await safeExecute(insertAnswerSql, [questionId, userId, content]);

  if (!result || !result.insertId) {
    throw new Error('Failed to create answer');
  }

  const answerId = result.insertId;

  // Step 4: Fetch the newly created answer with author information
  const fetchAnswerSql = `
    SELECT
      a.answer_id AS id,
      a.question_id AS questionId,
      a.content,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt,
      u.user_id AS authorId,
      u.first_name AS authorFirstName,
      u.last_name AS authorLastName
    FROM answers a
    INNER JOIN users u ON a.user_id = u.user_id
    WHERE a.answer_id = ?
  `;
  const answerRows = await safeExecute(fetchAnswerSql, [answerId]);

  if (!answerRows || answerRows.length === 0) {
    throw new Error('Failed to retrieve created answer');
  }

  const answer = answerRows[0];

  return {
    id: answer.id,
    questionId: answer.questionId,
    content: answer.content,
    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
    author: {
      id: answer.authorId,
      firstName: answer.authorFirstName,
      lastName: answer.authorLastName,
    },
  };
};
