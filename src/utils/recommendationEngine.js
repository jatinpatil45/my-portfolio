/**
 * Recommendation Engine for Jatin AI 3.0
 *
 * Generates context-aware quick-reply suggestions using the Knowledge Graph
 * and conversation history while guaranteeing every recommended prompt is
 * recognized by the intent matcher.
 */

import defaultKnowledge from '../data/chatbotKnowledge';
import { INTENTS, CONVERSATIONAL_INTENTS } from '../data/intents';
import { createKnowledgeGraph } from '../data/knowledgeGraph';

const INTENT_SUGGESTIONS_MAP = {
  greeting: CONVERSATIONAL_INTENTS.greeting.defaultSuggestions,
  thanks: CONVERSATIONAL_INTENTS.thanks.defaultSuggestions,
  goodbye: CONVERSATIONAL_INTENTS.goodbye.defaultSuggestions,
  bot_help: [
    "What are Jatin's technical skills?",
    "Show me Jatin's projects",
    'What certifications does Jatin have?',
    'How can I contact Jatin?',
  ],
  about: [
    "What are Jatin's technical skills?",
    "Show me Jatin's projects",
    "What are Jatin's achievements?",
    'How can I contact Jatin?',
  ],
  interests_learning: [
    "What are Jatin's technical skills?",
    'What certifications does Jatin have?',
    "Show me Jatin's projects",
  ],
  education: [
    'What certifications does Jatin have?',
    "What are Jatin's technical skills?",
    "What are Jatin's achievements?",
  ],
  skills: [
    "Show me Jatin's projects",
    'What certifications does Jatin have?',
    'What is Jatin currently learning?',
  ],
  projects: [
    'Tell me about AI Study Assistant',
    'Tell me about AI Web Clone Builder',
    "What are Jatin's technical skills?",
    'How can I contact Jatin?',
  ],
  project_detail: [
    "Show me Jatin's projects",
    "What are Jatin's technical skills?",
    'Share GitHub link',
  ],
  certifications: [
    "What are Jatin's achievements?",
    "What is Jatin's education?",
    "What are Jatin's technical skills?",
  ],
  achievements: [
    "What is Jatin's experience?",
    'What certifications does Jatin have?',
    'How can I contact Jatin?',
  ],
  experience: [
    "Show me Jatin's projects",
    "What are Jatin's achievements?",
    'How can I contact Jatin?',
  ],
  github_link: [
    "Show me Jatin's projects",
    'Share LinkedIn profile',
    'How can I contact Jatin?',
  ],
  linkedin_link: [
    'Share GitHub link',
    "What is Jatin's experience?",
    'How can I contact Jatin?',
  ],
  portfolio_link: [
    "Show me Jatin's projects",
    'How can I contact Jatin?',
  ],
  contact: [
    'Who is Jatin Patil?',
    "Show me Jatin's projects",
    "What are Jatin's technical skills?",
  ],
  fallback: [
    "What are Jatin's technical skills?",
    "Show me Jatin's projects",
    "What is Jatin's education?",
    'What certifications does Jatin have?',
    "What are Jatin's achievements?",
  ],
};

/**
 * Computes context-aware follow-up suggestions for a completed turn.
 *
 * @param {object} matchResult - Output from matchIntent
 * @param {object} [context=null] - Current conversation context
 * @param {object} [knowledge=defaultKnowledge] - Knowledge base
 * @returns {string[]}
 */
export function getRecommendations(matchResult, context = null, knowledge = defaultKnowledge) {
  const intent = matchResult?.intent || 'fallback';
  const kb = knowledge || defaultKnowledge;

  // When looking at a specific project, use the knowledge graph to suggest a related featured project
  if (intent === 'project_detail' && matchResult?.matchedProject) {
    const graph = createKnowledgeGraph(kb);
    const related = graph.getRelatedProjects(matchResult.matchedProject.title);
    const base = [...INTENT_SUGGESTIONS_MAP.project_detail];

    if (related.length > 0) {
      const topRelated = related[0];
      if (topRelated.title.includes('StudyMate')) {
        base.unshift('Tell me about AI Study Assistant');
      } else if (topRelated.title.includes('Clone Builder')) {
        base.unshift('Tell me about AI Web Clone Builder');
      }
    }

    return Array.from(new Set(base)).slice(0, 4);
  }

  // Standard intent recommendations
  const matchedRule = INTENTS.find((r) => r.id === matchResult?.ruleId);
  const baseList =
    INTENT_SUGGESTIONS_MAP[intent] ||
    matchedRule?.defaultSuggestions ||
    INTENT_SUGGESTIONS_MAP.fallback;

  return [...baseList];
}

export default getRecommendations;
