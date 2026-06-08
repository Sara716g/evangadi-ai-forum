import { StatusCodes } from "http-status-codes";
import { searchQuestionsSemanticService } from "../service/question.service.js";

// export const searchQuestionsSemanticController = async (req, res, next) => {
//   try {
//     const  query, k, threshold } = req.query;
//     const { data, meta } = await searchQuestionsSemanticService({
//       query,
//       ...(k !== undefined ? { k: Number(k) } : {}),
//       ...(threshold !== undefined ? { threshold: Number(threshold) } : {}),
//     });
//     res.status(StatusCodes.OK).json({
//       success: true,
//       message: "Semantic search completed successfully",
//       data,
//       meta,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const searchQuestionsSemanticController = async (req, res, next) => {
  try {
    const result = await searchQuestionsSemanticService({
      query: req.query.query,
      k: req.query.k ? Number(req.query.k) : 5,
      threshold:
        req.query.threshold !== undefined
          ? Number(req.query.threshold)
          : undefined,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Semantic search completed successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};