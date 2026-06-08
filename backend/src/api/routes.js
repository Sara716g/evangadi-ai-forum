import express from "express";

import authRoutes from "./auth/routes/auth.routes.js";
import questionRoutes from "./question/routes/question.routes.js";
import answerRoutes from "./answer/routes/answer.routes.js";
import ragRoutes from "./rag/routes/rag.routes.js";

import draftCoachRoutes from "./questions/routes/question.routes.js";

const mainRouter = express.Router();

mainRouter.use("/auth", authRoutes);

mainRouter.use("/questions", questionRoutes);

mainRouter.use("/answers", answerRoutes);

mainRouter.use("/rag", ragRoutes);

mainRouter.use("/draft-coach", draftCoachRoutes);

export default mainRouter;
