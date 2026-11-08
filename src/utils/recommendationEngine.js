/**
 * Context-Aware Recommendation Engine for Jatin AI 3.0
 *
 * Suggests:
 * 1. Follow-up quick-reply questions (`getRecommendations`)
 * 2. Relevant skills, projects, and portfolio sections (`getStructuredRecommendations`)
 * based on the current conversation intent, extracted entities, Knowledge Graph,
 * and previously visited topics.
 */

import defaultKnowledge, { PORTFOLIO_LINKS } from '../data/chatbotKnowledge';
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
  introduction: [
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
  programming_languages: [
    "What are Jatin's technical skills?",
    "Show me Jatin's projects",
    'What certifications does Jatin have?',
  ],
  skills: [
    "Show me Jatin's projects",
    'What programming languages does Jatin know?',
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
    'Why should we hire Jatin?',
    "Show me Jatin's projects",
    "What are Jatin's achievements?",
    'How can I contact Jatin?',
  ],
  recruiter_info: [
    "Show me Jatin's projects",
    "What are Jatin's technical skills?",
    'What certifications does Jatin have?',
    'How can I contact Jatin?',
  ],
  comparisons: [
    'Tell me about AI Study Assistant',
    'Tell me about AI Web Clone Builder',
    "What are Jatin's technical skills?",
  ],
  recommendations: [
    'Tell me about AI Study Assistant',
    'Tell me about AI Web Clone Builder',
    "What are Jatin's technical skills?",
    'Why should we hire Jatin?',
  ],
  clarification: [
    "Show me Jatin's projects",
    "What are Jatin's technical skills?",
    "What is Jatin's education?",
    'What certifications does Jatin have?',
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

const SECTION_CATALOG = [
  {
    id: 'projects',
    intent: 'projects',
    title: 'Featured Projects',
    link: PORTFOLIO_LINKS.projects,
    question: "Show me Jatin's projects",
    reason: 'Explore AI Study Assistant, AI Web Clone Builder, and Deep Learning models.',
  },
  {
    id: 'skills',
    intent: 'skills',
    title: 'Technical Skills & Arsenal',
    link: PORTFOLIO_LINKS.skills,
    question: "What are Jatin's technical skills?",
    reason: 'View Jatin’s programming languages, AI/ML frameworks, and web stack.',
  },
  {
    id: 'certifications',
    intent: 'certifications',
    title: 'Verified Certifications',
    link: PORTFOLIO_LINKS.certifications,
    question: 'What certifications does Jatin have?',
    reason: 'See 8 verified credentials from Google, Microsoft Learn, IICT, and CodeWithHarry.',
  },
  {
    id: 'hackathons',
    intent: 'achievements',
    title: 'Hackathons & Achievements',
    link: PORTFOLIO_LINKS.hackathons,
    question: "What are Jatin's achievements?",
    reason: 'Check out Google Student Ambassador leadership and national hackathon certificates.',
  },
  {
    id: 'education',
    intent: 'education',
    title: 'Academic Background',
    link: PORTFOLIO_LINKS.education,
    question: "What is Jatin's education?",
    reason: 'Learn about his B.E. in Computer Engineering (Data Science specialization).',
  },
  {
    id: 'contact',
    intent: 'contact',
    title: 'Contact & Social Links',
    link: PORTFOLIO_LINKS.contact,
    question: 'How can I contact Jatin?',
    reason: 'Connect via Email, LinkedIn, or GitHub for internships and collaborations.',
  },
];

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

  if (Array.isArray(matchResult?.customSuggestions) && matchResult.customSuggestions.length > 0) {
    return matchResult.customSuggestions.slice(0, 4);
  }

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
      } else if (topRelated.title.includes('Smart City')) {
        base.unshift('Tell me about Smart City Traffic Analyzer');
      }
    }

    return Array.from(new Set(base)).slice(0, 4);
  }

  const matchedRule = INTENTS.find((r) => r.id === matchResult?.ruleId);
  const baseList = [
    ...(INTENT_SUGGESTIONS_MAP[intent] ||
      matchedRule?.defaultSuggestions ||
      INTENT_SUGGESTIONS_MAP.fallback),
  ];

  // If conversation context tracks visited intents, append an unvisited topic suggestion
  const visited = new Set(context?.visitedIntents || []);
  if (visited.size > 0) {
    for (const sec of SECTION_CATALOG) {
      if (!visited.has(sec.intent) && sec.intent !== intent && !baseList.includes(sec.question)) {
        baseList.push(sec.question);
        break;
      }
    }
  }

  return Array.from(new Set(baseList)).slice(0, 5);
}

/**
 * Returns structured recommendations for relevant skills, projects, and profile sections
 * based on the current conversation turn and history.
 *
 * @param {object} matchResult
 * @param {object} [context=null]
 * @param {object} [knowledge=defaultKnowledge]
 * @returns {{
 *   questions: string[],
 *   skills: string[],
 *   projects: Array<{ id: string, title: string, category: string, link: string, reason: string }>,
 *   sections: Array<{ id: string, title: string, link: string, reason: string }>
 * }}
 */
export function getStructuredRecommendations(
  matchResult,
  context = null,
  knowledge = defaultKnowledge
) {
  const kb = knowledge || defaultKnowledge;
  const graph = createKnowledgeGraph(kb);
  const intent = matchResult?.intent || 'fallback';
  const visited = new Set(context?.visitedIntents || []);
  const activeSkill = matchResult?.matchedSkill || context?.lastSkill || null;
  const activeProject = matchResult?.matchedProject || context?.lastProject || null;

  // 1. Recommended Projects
  let recommendedProjects = [];
  if (activeSkill) {
    const bySkill = graph.getProjectsBySkill(activeSkill);
    recommendedProjects = bySkill.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      link: p.liveUrl || p.github || p.portfolioLink || PORTFOLIO_LINKS.projects,
      reason: `Uses ${activeSkill}`,
    }));
  } else if (activeProject) {
    const related = graph.getRelatedProjects(activeProject.title);
    recommendedProjects = related.slice(0, 3).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      link: p.liveUrl || p.github || p.portfolioLink || PORTFOLIO_LINKS.projects,
      reason: `Shares technologies with ${activeProject.title}`,
    }));
  }

  if (recommendedProjects.length === 0) {
    recommendedProjects = (kb.projects || [])
      .filter((p) => p.featured)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        link: p.liveUrl || p.github || p.portfolioLink || PORTFOLIO_LINKS.projects,
        reason: `Featured ${p.category} project`,
      }));
  }

  // 2. Recommended Skills
  let recommendedSkills = [];
  if (activeProject && Array.isArray(activeProject.tech)) {
    recommendedSkills = [...activeProject.tech];
  } else if (intent === 'education' || intent === 'interests_learning') {
    recommendedSkills = ['Python', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'Google Cloud Cybersecurity'];
  } else {
    recommendedSkills = ['Python', 'JavaScript', 'React', 'TypeScript', 'Node.js', 'TensorFlow'];
  }

  // 3. Recommended Profile Sections (prioritizing unvisited sections)
  const unvisitedSections = SECTION_CATALOG.filter(
    (s) => !visited.has(s.intent) && s.intent !== intent
  );
  const sectionsPool = unvisitedSections.length >= 2 ? unvisitedSections : SECTION_CATALOG;
  const recommendedSections = sectionsPool.slice(0, 3).map((s) => ({
    id: s.id,
    title: s.title,
    link: s.link,
    reason: s.reason,
  }));

  const questions = getRecommendations(matchResult, context, kb);

  return {
    questions,
    skills: Array.from(new Set(recommendedSkills)).slice(0, 6),
    projects: recommendedProjects.slice(0, 3),
    sections: recommendedSections,
  };
}

export default getRecommendations;
