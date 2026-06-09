import express from "express";

import authRoutes from "./auth/routes/auth.routes.js";
import questionRoutes from "./question/routes/question.routes.js";
import answerRoutes from "./answer/routes/answer.routes.js";
import ragRoutes from "./rag/routes/rag.routes.js";
import answerFitRoutes from "./questions/routes/answer-fit.routes.js";

const mainRouter = express.Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/questions", questionRoutes);

// Task 18 route
mainRouter.use("/questions", answerFitRoutes);

mainRouter.use("/answers", answerRoutes);
mainRouter.use("/rag", ragRoutes);

export default mainRouter;