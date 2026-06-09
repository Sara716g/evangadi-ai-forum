import pool from "../db/db.js";
import { createEmbedding } from "../services/embeddingService.js";
import cosineSimilarity from "../utils/cosineSimilarity.js";

export const searchQuestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const queryEmbedding = await createEmbedding(q);

    const [questions] = await pool.query("SELECT * FROM questions");

    const results = questions.map((question) => {
      const storedEmbedding = JSON.parse(question.embedding);

      const score = cosineSimilarity(queryEmbedding, storedEmbedding);

      return {
        id: question.id,
        title: question.title,
        description: question.description,
        similarity: score,
      };
    });

    results.sort((a, b) => b.similarity - a.similarity);

    res.status(200).json({
      success: true,
      query: q,
      results: results.slice(0, 10),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
