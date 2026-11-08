/**
 * Conversation Context Manager for Jatin AI 3.0
 *
 * Tracks multi-turn conversation state including:
 * - Last matched intent & category
 * - Previous project list results (`lastProjectsList`) and generic `lastResults`
 * - Active single project (`lastProject`) or skill (`lastSkill`) entity
 * - Visited topics (`visitedIntents`)
 *
 * Resolves multi-turn follow-up questions:
 * 1. List filtering: "Tell me about Jatin's projects" -> "Which one uses Python?"
 * 2. Ordinal references: "Tell me about the first one" / "the second one"
 * 3. Pronoun follow-ups: "Is there a live demo for it?", "What tech stack does it use?"
 * 4. Skill-to-project follow-ups: "Which projects use it?"
 * 5. Certification list filtering: "Which one is from Google?"
 */

import defaultKnowledge from '../data/chatbotKnowledge';
import { FOLLOW_UP_PATTERNS } from '../data/intents';
import { hasTerm } from './normalizeText';

/**
 * Creates a fresh conversation context state object.
 */
export function createInitialContext() {
  return {
    lastIntent: null,
    lastProject: null,
    lastProjectsList: [],
    lastCertificationsList: [],
    lastResults: [],
    lastSkill: null,
    visitedIntents: [],
    turnCount: 0,
    history: [],
  };
}

/**
 * Extracts a technology, language, or category filter from a follow-up query
 * against a list of candidate projects.
 *
 * @param {string} normalized
 * @param {Set<string>} tokenSet
 * @param {object[]} candidateProjects
 * @param {object} kb
 * @returns {{ filterTerm: string | null, matchedProjects: object[] }}
 */
function filterProjectsFromQuery(normalized, tokenSet, candidateProjects = [], kb = defaultKnowledge) {
  const projectsToSearch =
    Array.isArray(candidateProjects) && candidateProjects.length > 0
      ? candidateProjects
      : kb.projects || [];

  // Collect all known technologies, skills, and categories
  const candidateTerms = new Set();
  for (const proj of projectsToSearch) {
    if (proj.category) candidateTerms.add(proj.category);
    for (const tech of proj.tech || []) {
      candidateTerms.add(tech);
    }
  }
  for (const lang of kb.technicalSkills?.coreProgramming || []) candidateTerms.add(lang);
  for (const lang of kb.technicalSkills?.additionalLanguages || []) candidateTerms.add(lang);
  for (const web of kb.technicalSkills?.webDevelopment || []) candidateTerms.add(web);
  for (const ds of kb.technicalSkills?.dataScienceAndAI || []) candidateTerms.add(ds);

  let matchedTerm = null;
  for (const term of candidateTerms) {
    const clean = term.toLowerCase();
    if (clean === 'c' ? tokenSet.has('c') : hasTerm(normalized, tokenSet, clean)) {
      matchedTerm = term;
      break;
    }
  }

  if (!matchedTerm) {
    return { filterTerm: null, matchedProjects: [] };
  }

  const targetLower = matchedTerm.toLowerCase();
  const matchedProjects = projectsToSearch.filter((proj) => {
    const techMatch = (proj.tech || []).some((t) => t.toLowerCase() === targetLower || t.toLowerCase().includes(targetLower));
    const catMatch = (proj.category || '').toLowerCase().includes(targetLower);
    const kwMatch = (proj.keywords || []).some((k) => k.toLowerCase() === targetLower);
    return techMatch || catMatch || kwMatch;
  });

  return { filterTerm: matchedTerm, matchedProjects };
}

/**
 * Resolves whether the current user query is a contextual follow-up referring
 * to previous project results, active project, active skill, or certifications.
 *
 * @param {string} normalized
 * @param {Set<string>} tokenSet
 * @param {object} context
 * @param {object} [knowledge=defaultKnowledge]
 * @returns {{
 *   isFollowUp: boolean,
 *   followUpType: string | null,
 *   targetProject: object | null,
 *   matchedProjects?: object[],
 *   matchedCertifications?: object[],
 *   targetSkill: string | null
 * }}
 */
export function resolveContextualFollowUp(
  normalized,
  tokenSet,
  context,
  knowledge = defaultKnowledge
) {
  if (!context || !context.lastIntent) {
    return { isFollowUp: false, followUpType: null, targetProject: null, targetSkill: null };
  }

  const kb = knowledge || defaultKnowledge;

  const hasPronoun =
    tokenSet.has('it') ||
    tokenSet.has('its') ||
    tokenSet.has('that') ||
    tokenSet.has('this') ||
    tokenSet.has('them') ||
    tokenSet.has('those') ||
    tokenSet.has('they');

  const isListFilterQuery =
    FOLLOW_UP_PATTERNS.listFilter.some((p) => hasTerm(normalized, tokenSet, p)) ||
    (tokenSet.has('which') && (tokenSet.has('one') || tokenSet.has('ones') || tokenSet.has('uses') || tokenSet.has('use')));

  // 1. Resolve "Which one uses Python?" / list filter against previous project results
  const hasPreviousProjects =
    context.lastIntent === 'projects' ||
    context.lastIntent === 'project_detail' ||
    (Array.isArray(context.lastProjectsList) && context.lastProjectsList.length > 0);

  if (hasPreviousProjects && isListFilterQuery) {
    const candidateProjects =
      Array.isArray(context.lastProjectsList) && context.lastProjectsList.length > 0
        ? context.lastProjectsList
        : kb.projects || [];

    // Check if filtering by technology/skill/category (e.g., "Which one uses Python?")
    const { filterTerm, matchedProjects } = filterProjectsFromQuery(
      normalized,
      tokenSet,
      candidateProjects,
      kb
    );

    if (filterTerm) {
      return {
        isFollowUp: true,
        followUpType: 'project_list_filter',
        targetProject: matchedProjects[0] || null,
        matchedProjects,
        targetSkill: filterTerm,
      };
    }

    // Check if filtering by live demo availability (e.g., "Which one has a live demo?")
    if (tokenSet.has('demo') || tokenSet.has('live') || tokenSet.has('deployed')) {
      const demoProjects = candidateProjects.filter((p) => Boolean(p.liveUrl));
      return {
        isFollowUp: true,
        followUpType: 'project_list_demo_filter',
        targetProject: demoProjects[0] || null,
        matchedProjects: demoProjects,
        targetSkill: null,
      };
    }
  }

  // 2. Resolve ordinal references ("first one", "second one", "third one") against previous project list
  if (hasPreviousProjects) {
    const candidateProjects =
      Array.isArray(context.lastProjectsList) && context.lastProjectsList.length > 0
        ? context.lastProjectsList
        : kb.projects || [];

    let ordinalIndex = -1;
    if (hasTerm(normalized, tokenSet, 'first one') || hasTerm(normalized, tokenSet, 'the first')) {
      ordinalIndex = 0;
    } else if (hasTerm(normalized, tokenSet, 'second one') || hasTerm(normalized, tokenSet, 'the second')) {
      ordinalIndex = 1;
    } else if (hasTerm(normalized, tokenSet, 'third one') || hasTerm(normalized, tokenSet, 'the third')) {
      ordinalIndex = 2;
    } else if (hasTerm(normalized, tokenSet, 'last one') || hasTerm(normalized, tokenSet, 'the last')) {
      ordinalIndex = candidateProjects.length - 1;
    }

    if (ordinalIndex >= 0 && candidateProjects[ordinalIndex]) {
      return {
        isFollowUp: true,
        followUpType: 'project_ordinal',
        targetProject: candidateProjects[ordinalIndex],
        matchedProjects: [candidateProjects[ordinalIndex]],
        targetSkill: null,
      };
    }
  }

  // 3. Single-project follow-up resolution ("Is there a live demo for it?", "What tech stack does it use?")
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

  // 4. Skill follow-up: user previously asked about a skill (e.g. Python) and now asks "Which projects use it?"
  if (
    context.lastSkill &&
    hasPronoun &&
    (tokenSet.has('project') || tokenSet.has('projects') || tokenSet.has('built') || tokenSet.has('use') || tokenSet.has('used'))
  ) {
    const { matchedProjects } = filterProjectsFromQuery(
      context.lastSkill.toLowerCase(),
      new Set([context.lastSkill.toLowerCase()]),
      kb.projects || [],
      kb
    );
    if (matchedProjects.length > 0) {
      return {
        isFollowUp: true,
        followUpType: 'project_list_filter',
        targetProject: matchedProjects[0] || null,
        matchedProjects,
        targetSkill: context.lastSkill,
      };
    }
  }

  // 5. Certification list follow-up: "Which one is from Google / Microsoft / Python?"
  if (context.lastIntent === 'certifications' && isListFilterQuery) {
    const certs =
      Array.isArray(context.lastCertificationsList) && context.lastCertificationsList.length > 0
        ? context.lastCertificationsList
        : kb.certifications || [];

    const matchedCerts = certs.filter((c) => {
      const text = `${c.title} ${c.issuer} ${(c.skills || []).join(' ')}`.toLowerCase();
      return Array.from(tokenSet).some(
        (tok) =>
          tok.length >= 3 &&
          !['which', 'one', 'ones', 'from', 'the', 'for', 'with', 'about', 'does', 'have'].includes(tok) &&
          text.includes(tok)
      );
    });

    if (matchedCerts.length > 0) {
      return {
        isFollowUp: true,
        followUpType: 'certification_list_filter',
        targetProject: null,
        matchedCertifications: matchedCerts,
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
 * @param {object} [knowledge=defaultKnowledge]
 */
export function updateContext(
  prevContext,
  matchResult,
  userQuery = '',
  knowledge = defaultKnowledge
) {
  const base = prevContext || createInitialContext();
  const kb = knowledge || defaultKnowledge;
  const intent = matchResult?.intent || 'fallback';

  const visitedSet = new Set(base.visitedIntents || []);
  if (intent && intent !== 'fallback' && intent !== 'greeting') {
    visitedSet.add(intent);
  }

  // Track single active project
  let nextProject = base.lastProject;
  if (matchResult?.matchedProject) {
    nextProject = matchResult.matchedProject;
  } else if (Array.isArray(matchResult?.matchedProjects) && matchResult.matchedProjects.length === 1) {
    nextProject = matchResult.matchedProjects[0];
  } else if (intent !== 'project_detail' && intent !== 'projects') {
    nextProject = null;
  }

  // Track previous project list results for follow-up queries like "Which one uses Python?"
  let nextProjectsList = base.lastProjectsList || [];
  if (Array.isArray(matchResult?.matchedProjects) && matchResult.matchedProjects.length > 0) {
    nextProjectsList = matchResult.matchedProjects;
  } else if (intent === 'projects') {
    nextProjectsList = kb.projects || [];
  } else if (intent === 'project_detail' && matchResult?.matchedProject) {
    nextProjectsList =
      Array.isArray(base.lastProjectsList) && base.lastProjectsList.length > 0
        ? base.lastProjectsList
        : [matchResult.matchedProject];
  }

  // Track certification results list
  let nextCertificationsList = base.lastCertificationsList || [];
  if (Array.isArray(matchResult?.matchedCertifications) && matchResult.matchedCertifications.length > 0) {
    nextCertificationsList = matchResult.matchedCertifications;
  } else if (intent === 'certifications') {
    nextCertificationsList = kb.certifications || [];
  }

  const nextSkill =
    matchResult?.matchedSkill !== undefined && matchResult?.matchedSkill !== null
      ? matchResult.matchedSkill
      : base.lastSkill;

  const nextResults =
    intent === 'projects' || Array.isArray(matchResult?.matchedProjects)
      ? nextProjectsList
      : intent === 'certifications'
      ? nextCertificationsList
      : nextProject
      ? [nextProject]
      : base.lastResults || [];

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
    lastProjectsList: nextProjectsList,
    lastCertificationsList: nextCertificationsList,
    lastResults: nextResults,
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
