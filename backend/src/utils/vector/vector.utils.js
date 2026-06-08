export const parseEmbedding = embedding => {
  if (Array.isArray(embedding)) return embedding;
  if (typeof embedding === 'string') return JSON.parse(embedding);
  return embedding;
};

export const cosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length === 0 || vectorA.length !== vectorB.length) {
    return 0;
  }
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

export const rankVectorsBySimilarity = (sourceVector, vectorRows, { k, threshold, excludeQuestionId = null }) => {
  return vectorRows
    .filter(row => excludeQuestionId === null || row.question_id !== excludeQuestionId)
    .map(row => ({
      questionId: row.question_id,
      score: cosineSimilarity(sourceVector, parseEmbedding(row.embedding)),
    }))
    .filter(match => match.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};
