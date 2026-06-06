import express from "express";
import authRoutes from "./auth/routes/auth.routes.js";

export const mainRouter = express.Router();

// Authentication routes
mainRouter.use("/auth", authRoutes);

// Question Route with dynamic testing entries
mainRouter.get("/questions", (req, res) => {
  const isMine = req.query.mine;
  const triggerError = req.query.error; // Looks for an entry like &error=true

  // If "error=true", return a 500 server error
  if (triggerError === "true") {
    return res
      .status(500)
      .json({ error: "Simulated database connection failure." });
  }

  // If "mine=true", return the empty array
  if (isMine === "true") {
    return res.status(200).json([]); // Displays: "You have not asked any questions yet."
  }

  return res.status(200).json([]);
});
