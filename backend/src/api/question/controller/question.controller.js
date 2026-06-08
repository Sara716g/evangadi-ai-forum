import { StatusCodes } from "http-status-codes";
import { searchQuestionsSemanticService } from "../service/question.service.js";

export const searchQuestionsSemanticController = async (req, res, next) => {
  try {
    const { query, k, threshold } = req.query;
    const { data, meta } = await searchQuestionsSemanticService({
      query,
      ...(k !== undefined ? { k: Number(k) } : {}),
      ...(threshold !== undefined ? { threshold: Number(threshold) } : {}),
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Semantic search completed successfully",
      data,
      meta,
    });
  } catch (error) {
    next(error);
  }
};
