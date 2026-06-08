import { StatusCodes } from 'http-status-codes';
import { createAnswerService } from '../service/answer.service.js';

/**
 * Controller to create a new answer to a question
 * @route POST /api/answers
 * @access Private (requires authentication)
 */
export const createAnswerController = async (req, res, next) => {
  try {
    const { questionId, content } = req.body;
    const userId = req.user.id;

    const answer = await createAnswerService({
      questionId,
      userId,
      content,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Answer posted successfully',
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};
