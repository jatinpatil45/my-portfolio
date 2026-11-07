/**
 * Intent & Entity Matcher for Jatin AI 3.0
 *
 * Combines phrase matching, keyword weighting, entity extraction (projects & skills),
 * typo-tolerant fuzzy matching, and multi-turn conversation context resolution.
 */

import defaultKnowledge from '../data/chatbotKnowledge';
import { INTENTS, CONVERSATIONAL_INTENTS } from '../data/intents';
import { normalizeText, hasTerm } from './normalizeText';
import { fuzzyScoreKeywords, similarityScore } from './fuzzyMatcher';
import { resolveContextualFollowUp } from './contextManager';

const RULE_ID_TO_INTENT = {
  github: 'github_link',
  linkedin: 'linkedin_link',
  portfolioLink: 'portfolio_link',
  interestsAndLearning: 'interests_learning',
  botHelp: 'bot_help',
};

/**
 * Calculates an intent score based on exact phrase matches (weight 6),
 * exact keyword matches (weight 3), and fuzzy typo matches (weight 2).
 */
export function scoreIntentRule(normalized, tokenSet, tokens, phrases = [], keywords = []) {
  let score = 0;

  for (const phrase of phrases) {
    if (hasTerm(normalized, tokenSet, phrase)) {
      score += 6;
    }
  }

  for (const keyword of keywords) {
    if (hasTerm(normalized, tokenSet, keyword)) {
      score += 3;
    }
  }

  if (score === 0 && tokens.length > 0) {
    score += fuzzyScoreKeywords(tokens, keywords, 0.8);
  }

  return score;
}

/**
 * Matches a user input string to a structured intent and extracted entities.
 *
 * @param {string} userInput
 * @param {object} [knowledge=defaultKnowledge]
 * @param {object} [context=null]
 * @returns {{
 *   intent: string,
 *   ruleId: string,
 *   confidence: number,
 *   matchedProject: object | null,
 *   matchedSkill: string | null,
 *   followUpType: string | null,
 *   normalized: string,
 *   tokens: string[]
 * }}
 */
export function matchIntent(userInput, knowledge = defaultKnowledge, context = null) {
  const kb = knowledge || defaultKnowledge;
  const { normalized, tokens } = normalizeText(userInput);

  if (!normalized) {
    return {
      intent: 'fallback',
      ruleId: 'fallback',
      confidence: 0,
      matchedProject: null,
      matchedSkill: null,
      followUpType: null,
      normalized: '',
      tokens: [],
    };
  }

  const tokenSet = new Set(tokens);

  // 1. Check specific project mentions (exact terms or fuzzy alias match)
  const defaultProjectMatchers = [
    {
      index: 0,
      terms: ['ai study assistant', 'study assistant', 'studymate', 'studymate ai'],
    },
    {
      index: 1,
      terms: [
        'ai web clone builder',
        'web clone builder',
        'clone builder',
        'ai website builder',
        'website builder',
      ],
    },
    { index: 2, terms: ['smart city', 'traffic analyzer', 'traffic flow'] },
    { index: 3, terms: ['sales forecaster', 'quarterly sales', 'sales trends'] },
    { index: 4, terms: ['mern stack dashboard', 'mern dashboard', 'administrative dashboard'] },
    { index: 5, terms: ['portfolio engine', 'this portfolio'] },
  ];

  for (const pm of defaultProjectMatchers) {
    const targetProject = kb.projects?.[pm.index];
    if (!targetProject) continue;

    const terms = targetProject.aliases || pm.terms;
    const exactMatch = terms.some((term) => hasTerm(normalized, tokenSet, term));
    const fuzzyAliasMatch =
      !exactMatch &&
      tokens.some(
        (tok) =>
          tok.length >= 6 &&
          terms.some((term) => !term.includes(' ') && similarityScore(tok, term) >= 0.82)
      );

    if (exactMatch || fuzzyAliasMatch) {
      return {
        intent: 'project_detail',
        ruleId: 'project_detail',
        confidence: exactMatch ? 0.98 : 0.85,
        matchedProject: targetProject,
        matchedSkill: null,
        followUpType: null,
        normalized,
        tokens,
      };
    }
  }

  // 2. Check multi-turn contextual follow-up (e.g. "tell me more about it", "live demo link")
  const contextual = resolveContextualFollowUp(normalized, tokenSet, context);
  if (contextual.isFollowUp && contextual.targetProject) {
    return {
      intent: 'project_detail',
      ruleId: 'project_detail',
      confidence: 0.9,
      matchedProject: contextual.targetProject,
      matchedSkill: null,
      followUpType: contextual.followUpType,
      normalized,
      tokens,
    };
  }

  // 3. Check specific skill recognition (e.g., "Does Jatin know Python?")
  const allSkills = [
    ...(kb.technicalSkills?.coreProgramming || []),
    ...(kb.technicalSkills?.additionalLanguages || []),
    ...(kb.technicalSkills?.webDevelopment || []),
    ...(kb.technicalSkills?.dataScienceAndAI || []),
    ...(kb.technicalSkills?.toolsAndPlatforms || []),
  ];

  const matchedSpecificSkill =
    allSkills.find((skill) => {
      const cleanSkill = skill.toLowerCase();
      if (cleanSkill === 'c') return tokenSet.has('c');
      return hasTerm(normalized, tokenSet, cleanSkill);
    }) || null;

  // 4. Exact short name queries (e.g., user just types "Jatin" or "Jatin Patil")
  if (
    normalized === 'jatin' ||
    normalized === 'jatin patil' ||
    normalized === 'jatin narayanbhai patil'
  ) {
    return {
      intent: 'about',
      ruleId: 'about',
      confidence: 0.95,
      matchedProject: null,
      matchedSkill: null,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 5. Score all topic intent rules
  let bestRule = null;
  let bestScore = 0;

  for (const rule of INTENTS) {
    const score = scoreIntentRule(normalized, tokenSet, tokens, rule.phrases, rule.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  if (bestScore === 0 && matchedSpecificSkill) {
    return {
      intent: 'skills',
      ruleId: 'skills',
      confidence: 0.88,
      matchedProject: null,
      matchedSkill: matchedSpecificSkill,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  if (bestRule && bestScore > 0) {
    const canonicalIntent = RULE_ID_TO_INTENT[bestRule.id] || bestRule.id;
    const confidence = Math.min(0.99, Number((0.65 + Math.min(bestScore, 12) * 0.028).toFixed(2)));
    return {
      intent: canonicalIntent,
      ruleId: bestRule.id,
      confidence,
      matchedProject: null,
      matchedSkill: canonicalIntent === 'skills' ? matchedSpecificSkill : null,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 6. Conversational intents (checked after topic rules so "Hi, what are your skills?" answers skills)
  const greetingScore = scoreIntentRule(
    normalized,
    tokenSet,
    tokens,
    CONVERSATIONAL_INTENTS.greeting.phrases,
    CONVERSATIONAL_INTENTS.greeting.keywords
  );
  if (greetingScore > 0) {
    return {
      intent: 'greeting',
      ruleId: 'greeting',
      confidence: 0.95,
      matchedProject: null,
      matchedSkill: null,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  const thanksScore = scoreIntentRule(
    normalized,
    tokenSet,
    tokens,
    CONVERSATIONAL_INTENTS.thanks.phrases,
    CONVERSATIONAL_INTENTS.thanks.keywords
  );
  if (thanksScore > 0) {
    return {
      intent: 'thanks',
      ruleId: 'thanks',
      confidence: 0.95,
      matchedProject: null,
      matchedSkill: null,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  const byeScore = scoreIntentRule(
    normalized,
    tokenSet,
    tokens,
    CONVERSATIONAL_INTENTS.goodbye.phrases,
    CONVERSATIONAL_INTENTS.goodbye.keywords
  );
  if (byeScore > 0) {
    return {
      intent: 'goodbye',
      ruleId: 'goodbye',
      confidence: 0.95,
      matchedProject: null,
      matchedSkill: null,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 7. Unrecognized question -> fallback
  return {
    intent: 'fallback',
    ruleId: 'fallback',
    confidence: 0,
    matchedProject: null,
    matchedSkill: null,
    followUpType: null,
    normalized,
    tokens,
  };
}

export default matchIntent;
