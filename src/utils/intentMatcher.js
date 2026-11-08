/**
 * Intent, Synonym, Entity & Ambiguity Matcher for Jatin AI 3.0
 *
 * Implements:
 * - Recognition for all 18 core & conversational intents
 * - Synonym phrase matching ("Tell me about Jatin", "Who is Jatin?", "Introduce Jatin", etc.)
 * - Fuzzy typo matching via normalized edit distance with confidence thresholds
 * - Multi-turn context resolution (including "Which one uses Python?" against previous results)
 * - Entity extraction for projects, skills, comparisons, and unverified/incomplete facts
 * - Ambiguity & medium-confidence detection for clarifying questions
 */

import defaultKnowledge from '../data/chatbotKnowledge';
import { INTENTS, CONVERSATIONAL_INTENTS, SYNONYM_GROUPS, FOLLOW_UP_PATTERNS } from '../data/intents';
import { normalizeText, hasTerm } from './normalizeText';
import {
  CONFIDENCE_THRESHOLDS,
  classifyConfidence,
  fuzzyMatchToken,
  fuzzyScoreKeywords,
  similarityScore,
} from './fuzzyMatcher';
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
 * exact keyword matches (weight 3), and fuzzy typo matches (weight 2.5).
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
    score += fuzzyScoreKeywords(tokens, keywords, CONFIDENCE_THRESHOLDS.TOKEN_STRONG);
  }

  return score;
}

/**
 * Extracts all projects mentioned in the user query (supports 1 or multiple projects for comparisons).
 */
export function extractMentionedProjects(normalized, tokenSet, tokens, kb = defaultKnowledge) {
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
    { index: 2, terms: ['smart city', 'traffic analyzer', 'traffic flow', 'smart city traffic analyzer'] },
    { index: 3, terms: ['sales forecaster', 'quarterly sales', 'sales trends', 'ai powered sales forecaster'] },
    { index: 4, terms: ['mern stack dashboard', 'mern dashboard', 'administrative dashboard'] },
    { index: 5, terms: ['portfolio engine', 'this portfolio', 'cyberpunk portfolio'] },
  ];

  const matched = [];
  let hasExact = false;

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
      if (exactMatch) hasExact = true;
      matched.push(targetProject);
    }
  }

  return { matchedProjects: matched, hasExact };
}

/**
 * Extracts all skills/languages mentioned in the user query.
 */
export function extractMentionedSkills(normalized, tokenSet, kb = defaultKnowledge) {
  const allSkills = [
    ...(kb.technicalSkills?.coreProgramming || []),
    ...(kb.technicalSkills?.additionalLanguages || []),
    ...(kb.technicalSkills?.webDevelopment || []),
    ...(kb.technicalSkills?.dataScienceAndAI || []),
    ...(kb.technicalSkills?.toolsAndPlatforms || []),
  ];

  const found = [];
  const seen = new Set();

  for (const skill of allSkills) {
    const cleanSkill = skill.toLowerCase();
    if (seen.has(cleanSkill)) continue;
    const isMatch = cleanSkill === 'c' ? tokenSet.has('c') : hasTerm(normalized, tokenSet, cleanSkill);
    if (isMatch) {
      seen.add(cleanSkill);
      found.push(skill);
    }
  }

  return found;
}

/**
 * Detects whether the user is asking about a known unverified/incomplete fact
 * (such as university CGPA/GPA or personal phone/WhatsApp number) so the engine
 * never invents missing facts.
 */
export function detectUnverifiedFactQuery(normalized, tokenSet) {
  const cgpaTerms = ['cgpa', 'gpa', 'spi', 'cpi', 'college marks', 'university grades', 'semester marks'];
  if (cgpaTerms.some((term) => hasTerm(normalized, tokenSet, term))) {
    return 'cgpa';
  }

  const phoneTerms = ['phone', 'mobile', 'whatsapp', 'phone number', 'contact number', 'mobile number', 'cellphone'];
  if (phoneTerms.some((term) => hasTerm(normalized, tokenSet, term))) {
    return 'phone';
  }

  return null;
}

/**
 * Detects ambiguous queries that warrant a medium-confidence clarifying question.
 */
function detectAmbiguousQuery(normalized, tokenSet, tokens, context, kb = defaultKnowledge) {
  // 1. Follow-up phrases used without any prior conversation context
  const isBareFollowUp =
    (!context || !context.lastIntent) &&
    (FOLLOW_UP_PATTERNS.moreDetails.some((p) => normalized === p) ||
      FOLLOW_UP_PATTERNS.listFilter.some((p) => normalized === p) ||
      normalized === 'which one' ||
      normalized === 'tell me more' ||
      normalized === 'more details' ||
      normalized === 'elaborate');

  if (isBareFollowUp) {
    return {
      isAmbiguous: true,
      clarificationType: 'missing_context',
      confidence: 0.55,
      candidateTopics: ['Projects', 'Technical Skills', 'Education', 'Certifications'],
      clarifyingQuestion:
        "Could you clarify which topic you'd like more details on? We haven't selected a specific project or section yet.",
      suggestions: [
        "Show me Jatin's projects",
        "What are Jatin's technical skills?",
        "What is Jatin's education?",
        'What certifications does Jatin have?',
      ],
    };
  }

  // 2. Ambiguous singular reference to "the AI project" / "his AI project" (multiple AI projects exist)
  if (
    (hasTerm(normalized, tokenSet, 'the ai project') ||
      hasTerm(normalized, tokenSet, 'his ai project') ||
      normalized === 'ai project' ||
      normalized === 'tell me about the ai project') &&
    !normalized.includes('study') &&
    !normalized.includes('clone') &&
    !normalized.includes('sales') &&
    !normalized.includes('traffic')
  ) {
    const aiProjects = (kb.projects || []).filter(
      (p) => p.category === 'AI/ML' || p.category === 'Deep Learning' || (p.tech || []).some((t) => t.includes('AI'))
    );
    return {
      isAmbiguous: true,
      clarificationType: 'ambiguous_project',
      confidence: 0.62,
      candidateItems: aiProjects,
      clarifyingQuestion:
        'Jatin has built multiple AI and Machine Learning projects. Which one would you like to explore?',
      suggestions: [
        'Tell me about AI Study Assistant',
        'Tell me about AI Web Clone Builder',
        'Tell me about Smart City Traffic Analyzer',
        'Tell me about AI-Powered Sales Forecaster',
      ],
    };
  }

  // 3. Ambiguous singular reference to "the bootcamp" (Python, Java, and JavaScript bootcamps exist)
  if (
    normalized === 'bootcamp' ||
    normalized === 'the bootcamp' ||
    normalized === 'tell me about the bootcamp' ||
    normalized === 'which bootcamp'
  ) {
    return {
      isAmbiguous: true,
      clarificationType: 'ambiguous_certification',
      confidence: 0.6,
      clarifyingQuestion:
        'Jatin has completed multiple programming bootcamps (Python, Java, and JavaScript). Would you like to see all of his certifications or focus on a specific language?',
      suggestions: [
        'What certifications does Jatin have?',
        'What programming languages does Jatin know?',
        "Show me Jatin's projects",
      ],
    };
  }

  return null;
}

/**
 * Matches a user input string to a structured intent, confidence level, and extracted entities.
 *
 * @param {string} userInput
 * @param {object} [knowledge=defaultKnowledge]
 * @param {object} [context=null]
 */
export function matchIntent(userInput, knowledge = defaultKnowledge, context = null) {
  const kb = knowledge || defaultKnowledge;
  const { normalized, tokens, keywords } = normalizeText(userInput);

  if (!normalized) {
    return {
      intent: 'fallback',
      ruleId: 'fallback',
      confidence: 0,
      confidenceLevel: 'low',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
      followUpType: null,
      normalized: '',
      tokens: [],
    };
  }

  const tokenSet = new Set(tokens);

  // 0. Check for unverified/incomplete fact queries (e.g. CGPA, phone number)
  const unverifiedTopic = detectUnverifiedFactQuery(normalized, tokenSet);
  if (unverifiedTopic === 'cgpa') {
    return {
      intent: 'education',
      ruleId: 'education',
      confidence: 0.92,
      confidenceLevel: 'high',
      unverifiedTopic: 'cgpa',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
      followUpType: null,
      normalized,
      tokens,
    };
  }
  if (unverifiedTopic === 'phone') {
    return {
      intent: 'contact',
      ruleId: 'contact',
      confidence: 0.92,
      confidenceLevel: 'high',
      unverifiedTopic: 'phone',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 1. Check multi-turn contextual follow-up FIRST when user uses follow-up patterns
  // (e.g., "Which one uses Python?", "Is there a live demo for it?", "Tell me about the first one")
  const contextual = resolveContextualFollowUp(normalized, tokenSet, context, kb);
  if (contextual.isFollowUp) {
    if (contextual.followUpType === 'project_list_filter' || contextual.followUpType === 'project_list_demo_filter') {
      return {
        intent: 'project_detail',
        ruleId: 'project_detail',
        confidence: 0.94,
        confidenceLevel: 'high',
        matchedProject: contextual.targetProject || null,
        matchedProjects: contextual.matchedProjects || [],
        matchedSkill: contextual.targetSkill || null,
        matchedSkills: contextual.targetSkill ? [contextual.targetSkill] : [],
        followUpType: contextual.followUpType,
        normalized,
        tokens,
      };
    }

    if (contextual.followUpType === 'certification_list_filter') {
      return {
        intent: 'certifications',
        ruleId: 'certifications',
        confidence: 0.92,
        confidenceLevel: 'high',
        matchedProject: null,
        matchedProjects: [],
        matchedCertifications: contextual.matchedCertifications || [],
        matchedSkill: null,
        matchedSkills: [],
        followUpType: contextual.followUpType,
        normalized,
        tokens,
      };
    }

    if (contextual.targetProject) {
      return {
        intent: 'project_detail',
        ruleId: 'project_detail',
        confidence: 0.92,
        confidenceLevel: 'high',
        matchedProject: contextual.targetProject,
        matchedProjects: [contextual.targetProject],
        matchedSkill: null,
        matchedSkills: [],
        followUpType: contextual.followUpType,
        normalized,
        tokens,
      };
    }
  }

  // 2. Check for ambiguous queries requiring medium-confidence clarification
  const ambiguity = detectAmbiguousQuery(normalized, tokenSet, tokens, context, kb);
  if (ambiguity && ambiguity.isAmbiguous) {
    return {
      intent: 'clarification',
      ruleId: 'clarification',
      confidence: ambiguity.confidence,
      confidenceLevel: 'medium',
      isAmbiguous: true,
      clarificationType: ambiguity.clarificationType,
      clarifyingQuestion: ambiguity.clarifyingQuestion,
      candidateItems: ambiguity.candidateItems || [],
      candidateTopics: ambiguity.candidateTopics || [],
      customSuggestions: ambiguity.suggestions,
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 3. Extract mentioned projects and skills
  const { matchedProjects, hasExact: hasExactProject } = extractMentionedProjects(
    normalized,
    tokenSet,
    tokens,
    kb
  );
  const matchedSkills = extractMentionedSkills(normalized, tokenSet, kb);
  const matchedSpecificSkill = matchedSkills[0] || null;

  // 4. Check explicit comparison intent (e.g., "Compare AI Study Assistant and AI Web Clone Builder" or "Python vs JavaScript")
  const isComparisonQuery =
    tokenSet.has('compare') ||
    tokenSet.has('comparison') ||
    tokenSet.has('comparisons') ||
    tokenSet.has('vs') ||
    tokenSet.has('versus') ||
    hasTerm(normalized, tokenSet, 'difference between') ||
    hasTerm(normalized, tokenSet, 'how do they compare');

  if (isComparisonQuery || matchedProjects.length >= 2) {
    return {
      intent: 'comparisons',
      ruleId: 'comparisons',
      confidence: 0.94,
      confidenceLevel: 'high',
      matchedProject: matchedProjects[0] || null,
      matchedProjects,
      matchedSkill: matchedSpecificSkill,
      matchedSkills,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 5. Check single specific project mention (when not asking about a skill + project together)
  if (matchedProjects.length === 1) {
    const conf = hasExactProject ? 0.98 : 0.85;
    return {
      intent: 'project_detail',
      ruleId: 'project_detail',
      confidence: conf,
      confidenceLevel: classifyConfidence(conf),
      matchedProject: matchedProjects[0],
      matchedProjects,
      matchedSkill: matchedSpecificSkill,
      matchedSkills,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 6. Exact short name queries or synonym group matches for Introduction
  if (
    normalized === 'jatin' ||
    normalized === 'jatin patil' ||
    normalized === 'jatin narayanbhai patil' ||
    SYNONYM_GROUPS.introduction.includes(normalized)
  ) {
    return {
      intent: 'about',
      ruleId: 'about',
      confidence: 0.96,
      confidenceLevel: 'high',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 7. Score all topic intent rules
  const scoredRules = [];
  for (const rule of INTENTS) {
    const score = scoreIntentRule(normalized, tokenSet, tokens, rule.phrases, rule.keywords);
    if (score > 0) {
      scoredRules.push({ rule, score });
    }
  }

  scoredRules.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.rule.priority || 0) - (a.rule.priority || 0);
  });

  const bestEntry = scoredRules[0] || null;
  const bestRule = bestEntry?.rule || null;
  const bestScore = bestEntry?.score || 0;

  if (bestScore === 0 && matchedSpecificSkill) {
    return {
      intent: 'skills',
      ruleId: 'skills',
      confidence: 0.88,
      confidenceLevel: 'high',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: matchedSpecificSkill,
      matchedSkills,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  if (bestRule && bestScore > 0) {
    let canonicalIntent = RULE_ID_TO_INTENT[bestRule.id] || bestRule.id;

    // Preserve backward compatibility with `skills` intent while tagging `programming_languages`
    let subIntent = null;
    if (canonicalIntent === 'programming_languages') {
      // If user explicitly asks for programming languages, support both `skills` and `programming_languages` metadata
      subIntent = 'programming_languages';
    }

    const confidence = Math.min(
      0.99,
      Number((0.68 + Math.min(bestScore, 12) * 0.026).toFixed(2))
    );

    return {
      intent: canonicalIntent,
      subIntent,
      ruleId: bestRule.id,
      confidence,
      confidenceLevel: classifyConfidence(confidence),
      matchedProject: null,
      matchedProjects: [],
      matchedSkill:
        canonicalIntent === 'skills' || canonicalIntent === 'programming_languages'
          ? matchedSpecificSkill
          : null,
      matchedSkills,
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 8. Check moderate fuzzy match (0.72 <= similarity < 0.80) for Medium Confidence clarification
  const allIntentKeywords = INTENTS.flatMap((r) =>
    (r.keywords || []).map((kw) => ({ keyword: kw, rule: r }))
  );
  for (const tok of keywords) {
    if (tok.length < 5) continue;
    const candidates = allIntentKeywords.map((item) => item.keyword);
    const { match, score } = fuzzyMatchToken(
      tok,
      candidates,
      CONFIDENCE_THRESHOLDS.TOKEN_MODERATE
    );
    if (match && score >= CONFIDENCE_THRESHOLDS.TOKEN_MODERATE && score < CONFIDENCE_THRESHOLDS.TOKEN_STRONG) {
      const matchedEntry = allIntentKeywords.find((item) => item.keyword === match);
      if (matchedEntry) {
        const candidateIntent =
          RULE_ID_TO_INTENT[matchedEntry.rule.id] || matchedEntry.rule.id;
        return {
          intent: 'clarification',
          ruleId: matchedEntry.rule.id,
          candidateIntent,
          matchedKeyword: match,
          confidence: 0.58,
          confidenceLevel: 'medium',
          isAmbiguous: true,
          clarificationType: 'fuzzy_confirmation',
          clarifyingQuestion: `Did you mean to ask about Jatin's **${match}**? Here are a few related questions you can pick:`,
          customSuggestions: matchedEntry.rule.defaultSuggestions,
          matchedProject: null,
          matchedProjects: [],
          matchedSkill: null,
          matchedSkills: [],
          followUpType: null,
          normalized,
          tokens,
        };
      }
    }
  }

  // 9. Conversational intents (checked after topic rules so "Hi, what are your skills?" answers skills)
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
      confidenceLevel: 'high',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
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
      confidenceLevel: 'high',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
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
      confidenceLevel: 'high',
      matchedProject: null,
      matchedProjects: [],
      matchedSkill: null,
      matchedSkills: [],
      followUpType: null,
      normalized,
      tokens,
    };
  }

  // 10. Unrecognized question -> Low confidence fallback
  return {
    intent: 'fallback',
    ruleId: 'fallback',
    confidence: 0,
    confidenceLevel: 'low',
    matchedProject: null,
    matchedProjects: [],
    matchedSkill: null,
    matchedSkills: [],
    followUpType: null,
    normalized,
    tokens,
  };
}

export default matchIntent;
