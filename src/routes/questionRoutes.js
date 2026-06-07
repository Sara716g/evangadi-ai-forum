import express from "express";
import { searchQuestions } from "../controllers/questionController.js";

const router = express.Router();

router.get("/search", searchQuestions);

export default router;
