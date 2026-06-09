import { StatusCodes } from "http-status-codes";

// Services
import {
  createQuestionWithVectorService,
  getSimilarQuestionsService,
} from "../service/question.service.js";

/**
 * @desc Create a new question + generate vector embedding
 */
export const createQuestionController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const newQuestion = await createQuestionWithVectorService({
      title,
      content,
      userId,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question posted successfully.",
      data: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get similar questions using embeddings/vector similarity
 */
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
      message: "Similar questions fetched successfully",
      data,
      meta,
    });
  } catch (error) {
    next(error);
  }
};
