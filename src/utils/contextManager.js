/**
 * Conversation Context Manager for Jatin AI 3.0
 *
 * Tracks multi-turn conversation state including last matched intent,
 * active project or skill entity, visited topics, and resolves pronoun follow-ups
 * (e.g., "Tell me more about it", "What tech stack does it use?", "Live demo link?").
 */

import { FOLLOW_UP_PATTERNS } from '../data/intents';
import { hasTerm } from './normalizeText';

/**
 * Creates a fresh conversation context state object.
 */
export function createInitialContext() {
  return {
    lastIntent: null,
    lastProject: null,
    lastSkill: null,
    visitedIntents: [],
    turnCount: 0,
    history: [],
  };
}

/**
 * Resolves whether the current user query is a contextual follow-up referring
 * to the previously discussed project or topic.
 *
 * @param {string} normalized
 * @param {Set<string>} tokenSet
 * @param {object} context
 * @returns {{ isFollowUp: boolean, followUpType: string | null, targetProject: object | null, targetSkill: string | null }}
 */
export function resolveContextualFollowUp(normalized, tokenSet, context) {
  if (!context || !context.lastIntent) {
    return { isFollowUp: false, followUpType: null, targetProject: null, targetSkill: null };
  }

  const hasPronoun =
    tokenSet.has('it') ||
    tokenSet.has('its') ||
    tokenSet.has('that') ||
    tokenSet.has('this');

  if (context.lastProject) {
    if (
      FOLLOW_UP_PATTERNS.projectDemo.some((p) => hasTerm(normalized, tokenSet, p)) ||
      (hasPronoun && (tokenSet.has('demo') || tokenSet.has('live') || tokenSet.has('link')))
    ) {
      return {
        isFollowUp: true,
        followUpType: 'project_demo',
        targetProject: context.lastProject,
        targetSkill: null,
      };
    }

    if (
      FOLLOW_UP_PATTERNS.projectRepo.some((p) => hasTerm(normalized, tokenSet, p)) ||
      (hasPronoun && (tokenSet.has('github') || tokenSet.has('repo') || tokenSet.has('code')))
    ) {
      return {
        isFollowUp: true,
        followUpType: 'project_repo',
        targetProject: context.lastProject,
        targetSkill: null,
      };
    }

    if (
      FOLLOW_UP_PATTERNS.projectTech.some((p) => hasTerm(normalized, tokenSet, p)) ||
      (hasPronoun && (tokenSet.has('tech') || tokenSet.has('stack') || tokenSet.has('built')))
    ) {
      return {
        isFollowUp: true,
        followUpType: 'project_tech',
        targetProject: context.lastProject,
        targetSkill: null,
      };
    }

    if (FOLLOW_UP_PATTERNS.moreDetails.some((p) => hasTerm(normalized, tokenSet, p))) {
      return {
        isFollowUp: true,
        followUpType: 'project_more',
        targetProject: context.lastProject,
        targetSkill: null,
      };
    }
  }

  return { isFollowUp: false, followUpType: null, targetProject: null, targetSkill: null };
}

/**
 * Returns an updated immutable conversation context after a turn completes.
 *
 * @param {object} prevContext
 * @param {object} matchResult
 * @param {string} userQuery
 */
export function updateContext(prevContext, matchResult, userQuery = '') {
  const base = prevContext || createInitialContext();
  const intent = matchResult?.intent || 'fallback';

  const visitedSet = new Set(base.visitedIntents || []);
  if (intent && intent !== 'fallback' && intent !== 'greeting') {
    visitedSet.add(intent);
  }

  const nextProject =
    matchResult?.matchedProject !== undefined
      ? matchResult.matchedProject
      : intent === 'project_detail'
      ? base.lastProject
      : null;

  const nextSkill =
    matchResult?.matchedSkill !== undefined ? matchResult.matchedSkill : base.lastSkill;

  const nextHistory = [
    ...(base.history || []).slice(-9),
    {
      query: userQuery,
      intent,
      timestamp: Date.now(),
    },
  ];

  return {
    lastIntent: intent,
    lastProject: nextProject,
    lastSkill: nextSkill,
    visitedIntents: Array.from(visitedSet),
    turnCount: (base.turnCount || 0) + 1,
    history: nextHistory,
  };
}

export default {
  createInitialContext,
  resolveContextualFollowUp,
  updateContext,
};
