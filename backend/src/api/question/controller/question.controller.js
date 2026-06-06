import { StatusCodes } from "http-status-codes";
import { getSimilarQuestionsService } from "../service/question.service.js";

/**
 * [T-11] Handles GET /api/questions/:questionHash/similar requests.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export const getSimilarQuestionsController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;
    const k = req.query.k;
    const threshold = req.query.threshold;

    const { data, meta } = await getSimilarQuestionsService({
      questionHash,
      ...(k !== undefined ? { k } : {}),
      ...(threshold !== undefined ? { threshold } : {}),
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Similar questions fetched successfully",
      data,
      meta,
    });
  } catch (error) {
    next(error);
  }
};
