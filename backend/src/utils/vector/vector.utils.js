export const parseEmbedding = (embedding) => {
  try {
    if (Array.isArray(embedding)) return embedding;
    if (typeof embedding === 'string') return JSON.parse(embedding);
  } catch (err) {
    console.warn('parseEmbedding: failed to parse embedding:', err?.message ?? err);
    return null;
  }

  // If embedding is neither array nor string, return null to indicate invalid input
  return null;
};

export const cosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) return 0;
  if (vectorA.length === 0 || vectorA.length !== vectorB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const a = Number(vectorA[i]);
    const b = Number(vectorB[i]);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      // invalid numeric entry; bail out
      return 0;
    }
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

export const rankVectorsBySimilarity = (
  sourceVector,
  vectorRows,
  { k = 5, threshold = 0.75, excludeQuestionId = null } = {},
) => {
  if (!Array.isArray(sourceVector) || sourceVector.length === 0) return [];

  const results = [];

  for (const row of vectorRows) {
    if (excludeQuestionId !== null && row.question_id === excludeQuestionId) continue;

    const candidate = parseEmbedding(row.embedding);
    if (!Array.isArray(candidate) || candidate.length !== sourceVector.length) {
      console.warn(
        `rankVectorsBySimilarity: skipping question ${row.question_id} due to invalid or mismatched embedding length`,
      );
      continue;
    }

    const score = cosineSimilarity(sourceVector, candidate);
    if (score >= threshold) results.push({ questionId: row.question_id, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k);
};
