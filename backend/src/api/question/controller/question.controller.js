import { StatusCodes } from 'http-status-codes';
import { getSimilarQuestionsService } from '../service/question.service.js';

export const getSimilarQuestionsController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;
    const { k, threshold } = req.query;

    const { data, meta } = await getSimilarQuestionsService({
      questionHash,
      ...(k !== undefined ? { k: Number(k) } : {}),
      ...(threshold !== undefined ? { threshold: Number(threshold) } : {}),
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Similar questions fetched successfully',
      data,
      meta,
    });
  } catch (error) {
    next(error);
  }
};
