/**
 * Response Generator & Confidence System Handler for Jatin AI 3.0
 *
 * Implements:
 * - Verified-only answer synthesis across all 18 intents
 * - Multi-turn contextual response formatting (e.g., resolving "Which one uses Python?" against previous projects)
 * - Side-by-side factual comparisons (projects, skills, domains)
 * - Recruiter & hiring summary generation + Recruiter Mode highlights
 * - Dynamic recommendations response + structured UI cards (Projects, Certifications, Recruiter Brief)
 * - 3-tier confidence handling:
 *     High (>= 0.75): Direct verified answer
 *     Medium (0.45 - 0.74): Clarifying question with disambiguation suggestions
 *     Low (< 0.45): Relevant topics & fallback suggestions
 * - Deduplication of response lines and strict refusal to invent missing facts
 */

import defaultKnowledge, { retrieveKnowledge, PORTFOLIO_LINKS } from '../data/chatbotKnowledge';
import { createKnowledgeGraph } from '../data/knowledgeGraph';
import { classifyConfidence } from './fuzzyMatcher';
import { matchIntent } from './intentMatcher';
import { getRecommendations, getStructuredRecommendations } from './recommendationEngine';

export const EXACT_FALLBACK_MESSAGE =
  "I'm not sure about that yet! You can ask me about Jatin's skills, projects, education, certifications or achievements.";

export const RELEVANT_TOPICS = [
  'Technical Skills & Programming Languages',
  'Featured AI/ML & Full-Stack Projects',
  'Education & Academic Background',
  'Verified Certifications',
  'Hackathons & Achievements',
  'Recruiter & Hiring Information',
  'Contact, GitHub & LinkedIn Links',
];

export const RECRUITER_SUGGESTIONS = [
  'Why should we hire Jatin?',
  "Show me Jatin's projects",
  "What are Jatin's technical skills?",
  'What certifications does Jatin have?',
  'How can I contact Jatin?',
];

/**
 * Removes duplicate bullet lines within a response while preserving paragraph structure.
 *
 * @param {string} text
 * @returns {string}
 */
export function deduplicateResponseLines(text = '') {
  if (typeof text !== 'string' || !text) return '';
  const seenBullets = new Set();
  const lines = text.split('\n');
  const filtered = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•')) {
      const normalizedBullet = trimmed.toLowerCase();
      if (seenBullets.has(normalizedBullet)) {
        continue;
      }
      seenBullets.add(normalizedBullet);
    }
    filtered.push(line);
  }

  return filtered.join('\n');
}

/**
 * Builds structured clickable action links for the UI based on intent and matched entities.
 */
function buildActionLinks(intent, matchResult, kb = defaultKnowledge) {
  const contact = kb.contactInfo || {};
  const links = [];

  if (intent === 'project_detail' && matchResult?.matchedProject) {
    const p = matchResult.matchedProject;
    if (p.liveUrl) {
      links.push({ label: 'Live Demo', url: p.liveUrl, type: 'live' });
    }
    if (p.github) {
      links.push({ label: 'GitHub Repo', url: p.github, type: 'github' });
    }
    links.push({ label: 'Projects Section', url: PORTFOLIO_LINKS.projects, type: 'section' });
    return links;
  }

  switch (intent) {
    case 'projects':
    case 'comparisons':
      links.push(
        { label: 'Projects Section', url: PORTFOLIO_LINKS.projects, type: 'section' },
        { label: 'GitHub Profile', url: contact.github || PORTFOLIO_LINKS.github, type: 'github' }
      );
      break;
    case 'skills':
    case 'programming_languages':
    case 'interests_learning':
      links.push(
        { label: 'Tech Arsenal', url: PORTFOLIO_LINKS.skills, type: 'section' },
        { label: 'Featured Projects', url: PORTFOLIO_LINKS.projects, type: 'section' }
      );
      break;
    case 'education':
      links.push({ label: 'Education Section', url: PORTFOLIO_LINKS.education, type: 'section' });
      break;
    case 'certifications':
      links.push({ label: 'Certifications Section', url: PORTFOLIO_LINKS.certifications, type: 'section' });
      break;
    case 'achievements':
      links.push({ label: 'Hackathon Certificates', url: PORTFOLIO_LINKS.hackathons, type: 'section' });
      break;
    case 'recruiter_info':
    case 'experience':
    case 'contact':
      links.push(
        { label: 'Email Jatin', url: `mailto:${contact.email || 'jatinpatil2233@gmail.com'}`, type: 'email' },
        { label: 'LinkedIn', url: contact.linkedin || PORTFOLIO_LINKS.linkedin, type: 'linkedin' },
        { label: 'GitHub', url: contact.github || PORTFOLIO_LINKS.github, type: 'github' },
        { label: 'Contact Section', url: PORTFOLIO_LINKS.contact, type: 'section' }
      );
      break;
    case 'github_link':
      links.push({ label: 'Open GitHub Profile', url: contact.github || PORTFOLIO_LINKS.github, type: 'github' });
      break;
    case 'linkedin_link':
      links.push({ label: 'Open LinkedIn Profile', url: contact.linkedin || PORTFOLIO_LINKS.linkedin, type: 'linkedin' });
      break;
    case 'about':
    case 'introduction':
      links.push(
        { label: 'About Section', url: PORTFOLIO_LINKS.about, type: 'section' },
        { label: 'Projects Section', url: PORTFOLIO_LINKS.projects, type: 'section' }
      );
      break;
    default:
      links.push({ label: 'Explore Portfolio', url: PORTFOLIO_LINKS.portfolio, type: 'section' });
      break;
  }

  return links;
}

/**
 * Builds a concise recruiter takeaway badge when Recruiter Mode is active.
 */
function buildRecruiterHighlight(intent, kb = defaultKnowledge) {
  const contact = kb.contactInfo || {};
  switch (intent) {
    case 'skills':
    case 'programming_languages':
      return 'Recruiter Takeaway: Combines Python AI/ML (TensorFlow, OpenCV, Scikit-Learn) with TypeScript/React/Node.js full-stack delivery.';
    case 'projects':
    case 'project_detail':
    case 'comparisons':
      return 'Recruiter Takeaway: Production-deployed AI SaaS apps on Vercel with public GitHub source repositories.';
    case 'education':
      return 'Recruiter Takeaway: 3rd Year (Sem 6) B.E. Computer Engineering student specializing in Data Science.';
    case 'certifications':
    case 'achievements':
      return 'Recruiter Takeaway: 8 verified credentials (Google, Microsoft Learn, IICT, CodeWithHarry) + Google Student Ambassador.';
    default:
      return `Recruiter Takeaway: ${contact.availability || 'Open to internships and engineering roles.'}`;
  }
}

/**
 * Builds response text and metadata for a matched intent result.
 *
 * @param {object} matchResult
 * @param {object} [knowledge=defaultKnowledge]
 * @param {object} [context=null]
 * @param {object} [options={}]
 */
export function generateResponse(
  matchResult,
  knowledge = defaultKnowledge,
  context = null,
  options = {}
) {
  const kb = knowledge || defaultKnowledge;
  const graph = createKnowledgeGraph(kb);
  const recruiterMode = Boolean(options?.recruiterMode);

  const intro = kb.personalIntroduction || {};
  const eduList = kb.education || [];
  const skills = kb.technicalSkills || {};
  const langList = kb.programmingLanguages || [];
  const projectList = kb.projects || [];
  const certList = kb.certifications || [];
  const achievementList = kb.achievements || [];
  const expList = kb.experience || [];
  const contact = kb.contactInfo || {};

  const intent = matchResult?.intent || 'fallback';
  const confidence = matchResult?.confidence ?? 0;
  const confidenceLevel = matchResult?.confidenceLevel || classifyConfidence(confidence);
  const baseSuggestions = getRecommendations(matchResult, context, kb);
  const suggestions =
    recruiterMode && intent === 'greeting'
      ? RECRUITER_SUGGESTIONS
      : baseSuggestions;
  const recommendations = getStructuredRecommendations(matchResult, context, kb);
  const links = buildActionLinks(intent, matchResult, kb);
  const recruiterHighlight = recruiterMode ? buildRecruiterHighlight(intent, kb) : null;

  const finalize = (payload) => ({
    ...payload,
    reply: deduplicateResponseLines(payload.reply),
    confidence: payload.confidence ?? confidence,
    confidenceLevel: payload.confidenceLevel || confidenceLevel,
    suggestions: payload.suggestions || suggestions,
    recommendations,
    relevantTopics: RELEVANT_TOPICS,
    links: payload.links || links,
    cards: payload.cards || null,
    recruiterHighlight,
  });

  // Handle Medium-Confidence Ambiguous / Clarifying Questions
  if (intent === 'clarification' || (confidenceLevel === 'medium' && matchResult?.clarifyingQuestion)) {
    const clarifyCards =
      Array.isArray(matchResult?.candidateItems) && matchResult.candidateItems.length > 0
        ? { type: 'projects', items: matchResult.candidateItems.slice(0, 3) }
        : null;

    return finalize({
      intent: 'clarification',
      confidence: confidence || 0.58,
      confidenceLevel: 'medium',
      cards: clarifyCards,
      reply:
        `🤔 **Clarification Needed:**\n\n` +
        `${matchResult.clarifyingQuestion}\n\n` +
        `You can select one of the suggested questions below or specify the exact topic:`,
    });
  }

  switch (intent) {
    case 'greeting':
      return finalize({
        intent: 'greeting',
        reply:
          `Hello! 👋 I'm **${kb.config?.botName || 'Jatin AI'}**, Jatin Patil's personal portfolio assistant.\n\n` +
          `How can I help you today? You can ask me about Jatin's **skills**, **projects**, **education**, **certifications**, **achievements**, or **contact links**.`,
      });

    case 'bot_help':
      return finalize({
        intent: 'bot_help',
        reply:
          `I'm **${kb.config?.botName || 'Jatin AI'}** (v${kb.config?.version || '3.0'}) — a custom, **API-free natural-language question matching assistant** built for **${intro.name}**.\n\n` +
          `*Note: I am a deterministic rule-based and knowledge-graph engine (not an LLM or unrestricted reasoning model). I answer strictly from Jatin's verified portfolio data.*\n\n` +
          `Here are topics you can ask me about:\n` +
          `• **Introduction:** Who is Jatin & what are his interests?\n` +
          `• **Skills & Languages:** Programming languages, AI/ML & web stack\n` +
          `• **Projects:** Featured AI/ML & Full-Stack work (plus follow-up questions)\n` +
          `• **Education:** University, degree, year & semester\n` +
          `• **Certifications & Achievements:** Verified credentials & hackathons\n` +
          `• **Recruiter Info, Comparisons & Links:** Hiring summary, project comparisons, GitHub, LinkedIn & Email`,
      });

    case 'about':
    case 'introduction':
      return finalize({
        intent: 'about',
        reply:
          `**${intro.fullName || intro.name}** is a **B.E. Computer Engineering student** (3rd Year, Sem 6) based in **${intro.location}**.\n\n` +
          `${intro.summary}\n\n` +
          `• **Interests:** ${(intro.interests || []).join(', ')}\n` +
          `• **Currently Learning:** ${(intro.currentlyLearning || []).join(', ')}\n` +
          `• **Activities:** ${(intro.activities || []).join(', ')}\n` +
          `• **Portfolio:** ${contact.portfolio}`,
      });

    case 'interests_learning':
      return finalize({
        intent: 'interests_learning',
        reply:
          `Here is what **${intro.name}** is passionate about and currently studying:\n\n` +
          `• **Core Interests:** ${(intro.interests || []).join(', ')}\n` +
          `• **Currently Learning:** ${(intro.currentlyLearning || []).join(', ')}\n` +
          `• **Campus Activity:** ${(intro.activities || []).join(', ')}\n` +
          `• **Skills Section:** ${PORTFOLIO_LINKS.skills}`,
      });

    case 'education': {
      const verifiedEdu = eduList.filter((item) => item.verificationStatus !== 'incomplete');
      const lines = verifiedEdu.map(
        (item) =>
          `• **${item.degree}** — ${item.institution} (${item.period} | ${item.status})`
      );

      const unverifiedPrefix =
        matchResult?.unverifiedTopic === 'cgpa'
          ? `ℹ️ *Note: Jatin's exact university CGPA/SPI for his ongoing B.E. program is not publicly listed on the portfolio, so I do not invent unverified figures. Here is his verified academic record:*\n\n`
          : '';

      return finalize({
        intent: 'education',
        reply:
          `${unverifiedPrefix}🎓 **${intro.name}'s Academic Background:**\n\n` +
          lines.join('\n') +
          `\n\nHe is currently in **3rd Year (Sem 6)**, specializing in **Data Science**.\n` +
          `• **Education Section:** ${PORTFOLIO_LINKS.education}`,
      });
    }

    case 'programming_languages': {
      const langLines = langList.map(
        (lang) => `• **${lang.title}:** ${lang.description}`
      );

      return finalize({
        intent: 'programming_languages',
        reply:
          `💻 **${intro.name}'s Programming Languages:**\n\n` +
          `• **Core Languages:** ${(skills.coreProgramming || []).join(', ')}\n` +
          `• **Additional & Query Languages:** ${(skills.additionalLanguages || []).join(', ')}\n\n` +
          `**Verified Usage Across Portfolio:**\n` +
          langLines.join('\n') +
          `\n\n• **Skills Section:** ${PORTFOLIO_LINKS.skills}`,
      });
    }

    case 'skills': {
      const matchedSkill = matchResult?.matchedSkill;
      let prefix = '';
      let skillProjectCards = null;

      if (matchedSkill) {
        const relatedProjects = graph.getProjectsBySkill(matchedSkill);
        const projectNames = relatedProjects.map((p) => p.title).slice(0, 3);
        const projectNote =
          projectNames.length > 0
            ? ` He has used it in projects like **${projectNames.join(', ')}**.`
            : '';
        prefix = `Yes! **${matchedSkill}** is part of Jatin's technical toolkit.${projectNote}\n\n`;
        if (relatedProjects.length > 0) {
          skillProjectCards = { type: 'projects', items: relatedProjects.slice(0, 2) };
        }
      }

      return finalize({
        intent: 'skills',
        cards: skillProjectCards,
        reply:
          `${prefix}💻 **${intro.name}'s Technical Skills:**\n\n` +
          `• **Programming:** ${[...(skills.coreProgramming || []), ...(skills.additionalLanguages || [])].join(', ')}\n` +
          `• **Web Development:** ${(skills.webDevelopment || []).join(', ')}\n` +
          `• **Data Science & AI:** ${(skills.dataScienceAndAI || []).join(', ')}\n` +
          `• **Cybersecurity & Cloud:** ${(skills.cybersecurityAndCloud || []).join(', ')}\n` +
          `• **Tools & Platforms:** ${(skills.toolsAndPlatforms || []).join(', ')}\n\n` +
          `Explore the full Tech Arsenal at ${PORTFOLIO_LINKS.skills}`,
      });
    }

    case 'project_detail': {
      if (
        matchResult?.followUpType === 'project_list_filter' ||
        matchResult?.followUpType === 'project_list_demo_filter'
      ) {
        const filteredProjects = matchResult.matchedProjects || [];
        const filterLabel =
          matchResult.followUpType === 'project_list_demo_filter'
            ? 'a live interactive demo'
            : `**${matchResult.matchedSkill || 'that technology'}**`;

        if (filteredProjects.length === 0) {
          return finalize({
            intent: 'project_detail',
            reply:
              `None of the previously listed projects in Jatin's portfolio explicitly list ${filterLabel}.\n\n` +
              `His verified projects primarily use **Python, React, TypeScript, Node.js, TensorFlow, OpenCV, Pandas, Firebase, MongoDB, and Tailwind CSS**.\n` +
              `• **Explore Projects:** ${PORTFOLIO_LINKS.projects}`,
          });
        }

        const lines = filteredProjects.map((p) => {
          const itemLinks = [
            p.liveUrl ? `Live: ${p.liveUrl}` : null,
            p.github ? `GitHub: ${p.github}` : null,
          ]
            .filter(Boolean)
            .join(' | ');
          const linkText = itemLinks ? ` (${itemLinks})` : '';
          return `• **${p.title}** (${p.category}): ${p.description} *[Tech: ${(p.tech || []).join(', ')}]*${linkText}`;
        });

        const headingVerb =
          filteredProjects.length === 1
            ? 'this project matches'
            : `these **${filteredProjects.length} projects** match`;

        return finalize({
          intent: 'project_detail',
          cards: { type: 'projects', items: filteredProjects },
          reply:
            `🔍 Resolving against Jatin's projects — ${headingVerb} ${filterLabel}:\n\n` +
            lines.join('\n') +
            `\n\n• **Projects Section:** ${PORTFOLIO_LINKS.projects}`,
        });
      }

      const specificProject = matchResult?.matchedProject;
      if (specificProject) {
        const repoLine = specificProject.github
          ? `\n• **GitHub Repo:** ${specificProject.github}`
          : `\n• **More Code on GitHub:** ${contact.github}`;
        const demoLine = specificProject.liveUrl
          ? `\n• **Live Demo:** ${specificProject.liveUrl}`
          : '';
        const sectionLine = `\n• **Portfolio Section:** ${specificProject.portfolioLink || PORTFOLIO_LINKS.projects}`;

        return finalize({
          intent: 'project_detail',
          cards: { type: 'projects', items: [specificProject] },
          reply:
            `🚀 **${specificProject.title}** (${specificProject.category})\n\n` +
            `${specificProject.description}\n\n` +
            `• **Tech Stack:** ${(specificProject.tech || []).join(', ')}` +
            repoLine +
            demoLine +
            sectionLine,
        });
      }

      return generateResponse({ ...matchResult, intent: 'projects' }, kb, context, options);
    }

    case 'projects': {
      const projectLines = projectList.map((p) => {
        const linkSuffix = p.github ? ` — ${p.github}` : '';
        return `• **${p.title}** (${p.category}): ${p.description} *[${(p.tech || []).join(', ')}]*${linkSuffix}`;
      });

      return finalize({
        intent: 'projects',
        cards: { type: 'projects', items: projectList.slice(0, 4) },
        reply:
          `🚀 **${intro.name}'s Projects:**\n\n` +
          projectLines.join('\n') +
          `\n\n• **Featured Work:** ${PORTFOLIO_LINKS.projects}\n` +
          `• **All Repositories on GitHub:** ${contact.github}`,
      });
    }

    case 'certifications': {
      const targetCerts =
        Array.isArray(matchResult?.matchedCertifications) &&
        matchResult.matchedCertifications.length > 0
          ? matchResult.matchedCertifications
          : certList;

      const certLines = targetCerts.map(
        (c) => `• **${c.title}** — *${c.issuer}*${c.date ? ` (${c.date})` : ''}`
      );

      const header =
        matchResult?.followUpType === 'certification_list_filter'
          ? `📜 **Matching Certifications from Jatin's Credentials:**\n\n`
          : `📜 **${intro.name}'s Verified Certifications:**\n\n`;

      return finalize({
        intent: 'certifications',
        cards: { type: 'certifications', items: targetCerts.slice(0, 4) },
        reply:
          header +
          certLines.join('\n') +
          `\n\nYou can view and verify all certificates at ${PORTFOLIO_LINKS.certifications}`,
      });
    }

    case 'achievements': {
      const achLines = achievementList.map(
        (a) => `• **${a.title}:** ${a.description}`
      );

      return finalize({
        intent: 'achievements',
        reply:
          `🏆 **${intro.name}'s Achievements & Activities:**\n\n` +
          achLines.join('\n') +
          `\n\n• **Hackathon Credentials:** ${PORTFOLIO_LINKS.hackathons}`,
      });
    }

    case 'experience': {
      const verifiedExp = expList.filter((e) => e.verificationStatus !== 'incomplete');
      const expLines = verifiedExp.map(
        (e) => `• **${e.role}** — *${e.organization}* (${e.period}): ${e.details}`
      );

      return finalize({
        intent: 'experience',
        reply:
          `💼 **${intro.name}'s Experience & Leadership:**\n\n` +
          expLines.join('\n') +
          `\n\n**Availability:** ${contact.availability}\n` +
          `• **Portfolio:** ${PORTFOLIO_LINKS.portfolio}`,
      });
    }

    case 'recruiter_info': {
      return finalize({
        intent: 'recruiter_info',
        cards: {
          type: 'projects',
          items: projectList.filter((p) => p.featured).slice(0, 2),
        },
        reply:
          `📋 **Recruiter & Hiring Summary — ${intro.fullName || intro.name}:**\n\n` +
          `• **Current Academic Status:** B.E. Computer Engineering (3rd Year, Sem 6) at UPL University of Sustainable Technology, specializing in **Data Science**.\n` +
          `• **Target Roles:** AI/ML Intern, Data Science Intern, and Full-Stack Web Developer.\n` +
          `• **Core Technical Stack:** Python, JavaScript, TypeScript, Java, React, Node.js, TensorFlow, OpenCV, Pandas, Scikit-Learn, Tailwind CSS, Firebase, MongoDB.\n` +
          `• **Key Production & AI Projects:** AI Study Assistant (StudyMate AI), AI Web Clone Builder, Smart City Traffic Analyzer, and AI-Powered Sales Forecaster.\n` +
          `• **Leadership & Credentials:** Google Student Ambassador, 8 verified certifications (Google/Coursera, Microsoft Learn, IICT, CodeWithHarry, LetsUpgrade), and 2 national hackathon certificates.\n` +
          `• **Availability:** ${contact.availability}\n` +
          `• **Direct Contact:** mailto:${contact.email} | LinkedIn: ${contact.linkedin} | GitHub: ${contact.github}`,
      });
    }

    case 'comparisons': {
      const comparedProjects = matchResult?.matchedProjects || [];
      const comparedSkills = matchResult?.matchedSkills || [];

      if (comparedProjects.length >= 2) {
        const [p1, p2] = comparedProjects;
        return finalize({
          intent: 'comparisons',
          cards: { type: 'projects', items: [p1, p2] },
          reply:
            `⚖️ **Project Comparison: ${p1.title} vs ${p2.title}**\n\n` +
            `• **${p1.title}** (${p1.category}): ${p1.description}\n` +
            `  *Tech Stack:* ${(p1.tech || []).join(', ')}${p1.liveUrl ? ` | Live: ${p1.liveUrl}` : ''}\n` +
            `• **${p2.title}** (${p2.category}): ${p2.description}\n` +
            `  *Tech Stack:* ${(p2.tech || []).join(', ')}${p2.liveUrl ? ` | Live: ${p2.liveUrl}` : ''}\n\n` +
            `• **All Projects:** ${PORTFOLIO_LINKS.projects}`,
        });
      }

      if (comparedSkills.length >= 2) {
        const [s1, s2] = comparedSkills;
        const s1Projects = graph.getProjectsBySkill(s1).map((p) => p.title);
        const s2Projects = graph.getProjectsBySkill(s2).map((p) => p.title);
        return finalize({
          intent: 'comparisons',
          reply:
            `⚖️ **Skill Comparison in Jatin's Portfolio: ${s1} vs ${s2}**\n\n` +
            `• **${s1}:** Used in ${s1Projects.length > 0 ? s1Projects.join(', ') : 'core programming & academic coursework'}.\n` +
            `• **${s2}:** Used in ${s2Projects.length > 0 ? s2Projects.join(', ') : 'core programming & web/software stack'}.\n\n` +
            `• **Skills Section:** ${PORTFOLIO_LINKS.skills}`,
        });
      }

      return finalize({
        intent: 'comparisons',
        cards: { type: 'projects', items: projectList.filter((p) => p.featured).slice(0, 3) },
        reply:
          `⚖️ **Comparing Jatin's Core Engineering Domains:**\n\n` +
          `• **AI/ML & Data Science Track:** Uses **Python, TensorFlow, OpenCV, Pandas, Scikit-Learn, and Linear Regression** in projects like **Smart City Traffic Analyzer** and **AI-Powered Sales Forecaster**.\n` +
          `• **Full-Stack & AI Web Track:** Uses **React, TypeScript, Node.js, Tailwind CSS, Firebase, MongoDB, and Gemini AI** in live SaaS apps like **AI Study Assistant (StudyMate AI)** and **AI Web Clone Builder**.\n\n` +
          `• **Compare Live Projects:** ${PORTFOLIO_LINKS.projects}`,
      });
    }

    case 'recommendations': {
      const projLines = recommendations.projects.map(
        (p) => `• **${p.title}** (${p.category}) — *${p.reason}*: ${p.link}`
      );
      const secLines = recommendations.sections.map(
        (s) => `• **${s.title}:** ${s.reason} (${s.link})`
      );

      return finalize({
        intent: 'recommendations',
        cards: {
          type: 'projects',
          items: projectList.filter((p) => p.featured).slice(0, 3),
        },
        reply:
          `✨ **Recommended Highlights for You:**\n\n` +
          `**Featured Projects to Explore:**\n` +
          projLines.join('\n') +
          `\n\n**Key Skills to Check Out:**\n` +
          `• ${recommendations.skills.join(', ')}\n\n` +
          `**Suggested Portfolio Sections:**\n` +
          secLines.join('\n'),
      });
    }

    case 'github_link':
      return finalize({
        intent: 'github_link',
        reply:
          `🐙 **Jatin's GitHub Profile:**\n${contact.github}\n\n` +
          `Check it out to explore his AI/ML, Data Science, and Full-Stack repositories!`,
      });

    case 'linkedin_link':
      return finalize({
        intent: 'linkedin_link',
        reply:
          `💼 **Jatin's LinkedIn Profile:**\n${contact.linkedin}\n\n` +
          `Feel free to connect with Jatin on LinkedIn for networking, internships, or collaborations!`,
      });

    case 'portfolio_link':
      return finalize({
        intent: 'portfolio_link',
        reply:
          `🌐 **Jatin's Official Portfolio Links:**\n\n` +
          `• **Portfolio Website:** ${contact.portfolio}\n` +
          `• **GitHub:** ${contact.github}\n` +
          `• **LinkedIn:** ${contact.linkedin}`,
      });

    case 'contact': {
      const phoneNote =
        matchResult?.unverifiedTopic === 'phone'
          ? `ℹ️ *Note: Jatin's personal phone/WhatsApp number is not publicly listed on the portfolio for privacy. You can reach him directly via his verified channels below:*\n\n`
          : '';

      return finalize({
        intent: 'contact',
        reply:
          `${phoneNote}📬 **Connect with ${intro.name}:**\n\n` +
          `• **Email:** mailto:${contact.email}\n` +
          `• **LinkedIn:** ${contact.linkedin}\n` +
          `• **GitHub:** ${contact.github}\n` +
          `• **Portfolio:** ${contact.portfolio}\n` +
          `• **Location:** ${contact.location}`,
      });
    }

    case 'thanks':
      return finalize({
        intent: 'thanks',
        reply:
          `You're very welcome! 😊 Let me know if you'd like to explore anything else about Jatin's **projects**, **skills**, or **contact details**.`,
      });

    case 'goodbye':
      return finalize({
        intent: 'goodbye',
        reply:
          `Thanks for stopping by Jatin's portfolio! 👋 Have a great day, and feel free to connect via LinkedIn (${contact.linkedin}) or email (mailto:${contact.email}).`,
      });

    case 'fallback':
    default:
      return finalize({
        intent: 'fallback',
        confidence: 0,
        confidenceLevel: 'low',
        reply: kb.config?.fallbackMessage || EXACT_FALLBACK_MESSAGE,
      });
  }
}

/**
 * Convenience pipeline that matches intent, resolves context, and generates response in one call.
 *
 * @param {string} userInput
 * @param {object} [knowledge=defaultKnowledge]
 * @param {object} [context=null]
 * @param {object} [options={}]
 */
export function matchChatbotResponse(
  userInput,
  knowledge = defaultKnowledge,
  context = null,
  options = {}
) {
  try {
    const kb = knowledge || defaultKnowledge;
    const matchResult = matchIntent(userInput, kb, context);
    const response = generateResponse(matchResult, kb, context, options);
    const retrievedKnowledge = retrieveKnowledge(userInput);
    return {
      ...response,
      matchResult,
      retrievedKnowledge,
    };
  } catch (error) {
    console.error('[Jatin AI 3.0] Response generation error:', error);
    return {
      intent: 'fallback',
      confidence: 0,
      confidenceLevel: 'low',
      reply: EXACT_FALLBACK_MESSAGE,
      suggestions: defaultKnowledge.config?.suggestedQuestions?.slice(0, 4) || [],
      relevantTopics: RELEVANT_TOPICS,
      links: [],
      cards: null,
    };
  }
}

export default generateResponse;
