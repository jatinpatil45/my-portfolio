/**
 * Unified Public Facade for Jatin AI 3.0 API-Free Intelligence Engine
 *
 * Re-exports all modular NLP, fuzzy matching, intent recognition,
 * context resolution, recommendation, and response generation functions.
 */

export {
  normalizeText,
  normalizeQuery,
  expandContractions,
  normalizeSpellingVariations,
  hasTerm,
  STOP_WORDS,
  CONTRACTIONS_MAP,
  SPELLING_VARIATIONS,
} from './normalizeText';

export {
  CONFIDENCE_THRESHOLDS,
  classifyConfidence,
  levenshteinDistance,
  damerauLevenshteinDistance,
  normalizedEditDistance,
  similarityScore,
  fuzzyMatchToken,
  fuzzyMatchPhrase,
  fuzzyScoreKeywords,
} from './fuzzyMatcher';

export {
  matchIntent,
  scoreIntentRule,
  extractMentionedProjects,
  extractMentionedSkills,
  detectUnverifiedFactQuery,
  detectRecruiterTopic,
} from './intentMatcher';

export {
  createInitialContext,
  resolveContextualFollowUp,
  updateContext,
} from './contextManager';

export {
  getRecommendations,
  getStructuredRecommendations,
} from './recommendationEngine';

export {
  generateResponse,
  matchChatbotResponse,
  deduplicateResponseLines,
  buildCandidateSummaryCard,
  EXACT_FALLBACK_MESSAGE,
  RELEVANT_TOPICS,
  RECRUITER_SUGGESTIONS,
} from './responseGenerator';
