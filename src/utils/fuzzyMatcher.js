/**
 * Fuzzy Matcher & Confidence Threshold Utilities for Jatin AI 3.0
 *
 * Implements:
 * - Levenshtein & Damerau-Levenshtein edit distance
 * - Normalized edit distance (0 to 1) and similarity score (0 to 1)
 * - Token-level and phrase-level typo matching
 * - Explicit confidence thresholds (High / Medium / Low)
 */

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.75,
  MEDIUM: 0.45,
  LOW: 0.0,
  TOKEN_STRONG: 0.8,
  TOKEN_MODERATE: 0.72,
  PHRASE_STRONG: 0.82,
};

/**
 * Classifies a numeric confidence score (0..1) into 'high', 'medium', or 'low'.
 *
 * @param {number} confidence
 * @returns {'high' | 'medium' | 'low'}
 */
export function classifyConfidence(confidence = 0) {
  const numeric = typeof confidence === 'number' && !Number.isNaN(confidence) ? confidence : 0;
  if (numeric >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (numeric >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

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
 * Computes Damerau-Levenshtein (Optimal String Alignment) distance,
 * treating adjacent character transpositions (e.g. "pyhton" -> "python") as 1 edit.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function damerauLevenshteinDistance(a = '', b = '') {
  const s1 = String(a).toLowerCase();
  const s2 = String(b).toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix = Array.from({ length: s1.length + 1 }, () =>
    new Array(s2.length + 1).fill(0)
  );

  for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );

      if (
        i > 1 &&
        j > 1 &&
        s1[i - 1] === s2[j - 2] &&
        s1[i - 2] === s2[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[s1.length][s2.length];
}

/**
 * Computes normalized edit distance between 0 (identical) and 1 (completely distinct).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function normalizedEditDistance(a = '', b = '') {
  const s1 = String(a).toLowerCase().trim();
  const s2 = String(b).toLowerCase().trim();
  if (!s1 && !s2) return 0;
  if (!s1 || !s2) return 1;
  if (s1 === s2) return 0;

  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return dist / maxLen;
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

  return 1 - normalizedEditDistance(s1, s2);
}

/**
 * Finds the best fuzzy match for a single query token among candidate keywords.
 * Only evaluates tokens and candidates of length >= 5 to prevent short unrelated words
 * (e.g., "mars", "food") from matching short tech keywords.
 *
 * @param {string} token
 * @param {string[]} candidates
 * @param {number} [minSimilarity=0.8]
 * @returns {{ match: string | null, score: number, distance: number }}
 */
export function fuzzyMatchToken(
  token,
  candidates = [],
  minSimilarity = CONFIDENCE_THRESHOLDS.TOKEN_STRONG
) {
  if (!token || token.length < 5) {
    return { match: null, score: 0, distance: Infinity };
  }

  const cleanToken = String(token).toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    if (!candidate || candidate.length < 5) continue;
    const cleanCand = String(candidate).toLowerCase().trim();
    if (Math.abs(cleanToken.length - cleanCand.length) > 2) continue;

    // Require same starting letter or adjacent first-two-letter transposition
    const sameStart = cleanToken[0] === cleanCand[0];
    const transposedStart =
      cleanToken.length >= 2 &&
      cleanCand.length >= 2 &&
      cleanToken[0] === cleanCand[1] &&
      cleanToken[1] === cleanCand[0];

    if (!sameStart && !transposedStart) continue;

    const maxLen = Math.max(cleanToken.length, cleanCand.length);
    const dist = damerauLevenshteinDistance(cleanToken, cleanCand);
    const score = (maxLen - dist) / maxLen;

    if (score >= minSimilarity && score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
      bestDistance = dist;
    }
  }

  return { match: bestMatch, score: bestScore, distance: bestDistance };
}

/**
 * Finds the best fuzzy match for a normalized query against multi-word candidate phrases.
 *
 * @param {string} normalizedQuery
 * @param {string[]} phrases
 * @param {number} [minSimilarity=0.82]
 * @returns {{ match: string | null, score: number }}
 */
export function fuzzyMatchPhrase(
  normalizedQuery,
  phrases = [],
  minSimilarity = CONFIDENCE_THRESHOLDS.PHRASE_STRONG
) {
  if (!normalizedQuery || normalizedQuery.length < 6) {
    return { match: null, score: 0 };
  }

  const q = normalizedQuery.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const phrase of phrases) {
    if (!phrase || phrase.length < 5) continue;
    const p = phrase.toLowerCase().trim();
    const score = similarityScore(q, p);
    if (score >= minSimilarity && score > bestScore) {
      bestScore = score;
      bestMatch = phrase;
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
export function fuzzyScoreKeywords(
  tokens = [],
  keywords = [],
  minSimilarity = CONFIDENCE_THRESHOLDS.TOKEN_STRONG
) {
  let bonus = 0;
  for (const token of tokens) {
    if (token.length < 5) continue;
    const { match } = fuzzyMatchToken(token, keywords, minSimilarity);
    if (match) {
      bonus += match === token ? 3 : 2.5;
    }
  }
  return bonus;
}

export default {
  CONFIDENCE_THRESHOLDS,
  classifyConfidence,
  levenshteinDistance,
  damerauLevenshteinDistance,
  normalizedEditDistance,
  similarityScore,
  fuzzyMatchToken,
  fuzzyMatchPhrase,
  fuzzyScoreKeywords,
};
