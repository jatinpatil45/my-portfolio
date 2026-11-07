/**
 * Fuzzy Matcher for Jatin AI 3.0
 *
 * Provides pure-JavaScript Levenshtein edit distance and bounded similarity matching
 * to handle common user typos offline without false-positive matches on unrelated topics.
 */

/**
 * Computes the Levenshtein edit distance between two strings.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshteinDistance(a = '', b = '') {
  const s1 = String(a).toLowerCase();
  const s2 = String(b).toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix = Array.from({ length: s1.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[s1.length][s2.length];
}

/**
 * Computes normalized similarity score between 0 and 1.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function similarityScore(a = '', b = '') {
  const s1 = String(a).toLowerCase().trim();
  const s2 = String(b).toLowerCase().trim();
  if (!s1 && !s2) return 1;
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
}

/**
 * Finds the best fuzzy match for a single query token among candidate keywords.
 * Only evaluates tokens and candidates of length >= 5 to prevent short unrelated words
 * (e.g., "mars", "food") from matching short tech keywords.
 *
 * @param {string} token
 * @param {string[]} candidates
 * @param {number} [minSimilarity=0.8]
 * @returns {{ match: string | null, score: number }}
 */
export function fuzzyMatchToken(token, candidates = [], minSimilarity = 0.8) {
  if (!token || token.length < 5) {
    return { match: null, score: 0 };
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    if (!candidate || candidate.length < 5) continue;
    // First character must match or length difference <= 2 for safe typo tolerance
    if (Math.abs(token.length - candidate.length) > 2) continue;
    if (token[0] !== candidate[0]) continue;

    const score = similarityScore(token, candidate);
    if (score >= minSimilarity && score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return { match: bestMatch, score: bestScore };
}

/**
 * Calculates a fuzzy bonus score when query tokens closely match rule keywords.
 *
 * @param {string[]} tokens
 * @param {string[]} keywords
 * @param {number} [minSimilarity=0.8]
 * @returns {number}
 */
export function fuzzyScoreKeywords(tokens = [], keywords = [], minSimilarity = 0.8) {
  let bonus = 0;
  for (const token of tokens) {
    if (token.length < 5) continue;
    const { match } = fuzzyMatchToken(token, keywords, minSimilarity);
    if (match && match !== token) {
      bonus += 2;
    }
  }
  return bonus;
}

export default {
  levenshteinDistance,
  similarityScore,
  fuzzyMatchToken,
  fuzzyScoreKeywords,
};
