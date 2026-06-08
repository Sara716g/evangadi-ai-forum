import express from 'express';
import authRoutes from './auth/routes/auth.routes.js';
import questionRoutes from './question/routes/question.routes.js';
// Load answer routes dynamically to avoid initialization order issues
let answerRoutes;
try {
	// Top-level await is supported in Node 14+ ESM; this ensures the module is resolved
	const mod = await import('./answer/routes/answer.routes.js');
	answerRoutes = mod.default;
} catch (err) {
	console.warn('Could not load answer routes:', err.message);
	answerRoutes = null;
}

export const mainRouter = express.Router();

// Authentication routes
mainRouter.use('/auth', authRoutes);

// Question routes
mainRouter.use('/questions', questionRoutes);

// Answer routes
if (answerRoutes) {
	mainRouter.use('/answers', answerRoutes);
} else {
	console.warn('Answer routes not mounted');
}

