/**
 * Backward-Compatible Facade for Jatin AI 3.0 Matching Engine
 *
 * Re-exports `normalizeQuery` and `matchChatbotResponse` from the modular
 * Jatin AI 3.0 NLP & response pipeline.
 */

export { normalizeText, normalizeQuery, hasTerm } from './normalizeText';
export { matchIntent } from './intentMatcher';
export { generateResponse, matchChatbotResponse, EXACT_FALLBACK_MESSAGE } from './responseGenerator';
