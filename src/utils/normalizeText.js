/**
 * Text Normalization & Tokenization Utilities for Jatin AI 3.0
 *
 * Normalizes user input for case-insensitive, punctuation-tolerant matching
 * while preserving technical tokens like c++, c#, node.js, 3.0, and ai/ml.
 */

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'as',
  'into',
  'can',
  'could',
  'would',
  'should',
  'do',
  'does',
  'did',
  'has',
  'have',
  'had',
  'me',
  'my',
  'you',
  'your',
  'he',
  'his',
  'him',
  'it',
  'its',
  'please',
]);

/**
 * Normalizes user input and extracts cleaned tokens.
 *
 * @param {string} rawInput
 * @returns {{ normalized: string, tokens: string[], keywords: string[] }}
 */
export function normalizeText(rawInput) {
  if (typeof rawInput !== 'string') {
    return { normalized: '', tokens: [], keywords: [] };
  }

  const normalized = rawInput
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, '')
    .replace(/\bwhats\b/g, 'what is')
    .replace(/\bwhos\b/g, 'who is')
    .replace(/\bhows\b/g, 'how is')
    .replace(/\bhes\b/g, 'he is')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized
    ? normalized
        .split(' ')
        .map((t) => t.replace(/^[./-]+|[./-]+$/g, ''))
        .filter(Boolean)
    : [];

  const keywords = tokens.filter((t) => !STOP_WORDS.has(t));

  return { normalized, tokens, keywords };
}

/**
 * Alias for backward compatibility with existing utilities and tests.
 */
export const normalizeQuery = normalizeText;

/**
 * Checks whether a normalized query contains a multi-word phrase or single-token keyword.
 *
 * @param {string} normalized
 * @param {Set<string>} tokenSet
 * @param {string} term
 * @returns {boolean}
 */
export function hasTerm(normalized, tokenSet, term) {
  if (!term) return false;
  const cleanTerm = term.toLowerCase().trim();
  if (cleanTerm.includes(' ')) {
    const paddedQuery = ` ${normalized} `;
    return paddedQuery.includes(` ${cleanTerm} `);
  }
  return tokenSet.has(cleanTerm);
}

export default normalizeText;
