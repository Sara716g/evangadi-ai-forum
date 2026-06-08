import { GoogleGenAI } from '@google/genai';
import { ServiceUnavailableError } from '../errors/index.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';

let ai = null;
function getAiClient() {
  if (ai) return ai;
  if (!GEMINI_API_KEY) return null; // don't throw at import time
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return ai;
}

export const embedSearchQuery = async (text) => {
  const client = getAiClient();
  if (!client) {
    throw new ServiceUnavailableError('Embedding service not configured (GEMINI_API_KEY missing)');
  }

  try {
    const response = await client.models.embedContent({
      model: GEMINI_EMBEDDING_MODEL,
      contents: text,
      config: { taskType: 'RETRIEVAL_QUERY' },
    });

    // Safe extraction of embedding values. Different SDK versions may return
    // response.embeddings[0].values or response.embedding.values
    const values =
      response?.embeddings?.[0]?.values ?? response?.embedding?.values ?? null;

    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('Gemini returned an empty embedding');
    }

    return values;
  } catch (error) {
    // Wrap SDK errors in a ServiceUnavailableError so callers can surface a 503
    throw new ServiceUnavailableError(`Failed to generate query embedding: ${error?.message ?? error}`);
  }
};
