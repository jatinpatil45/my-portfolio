/**
 * Response Generator for Jatin AI 3.0
 *
 * Synthesizes formatted conversational responses from matched intents,
 * extracted entities, the editable knowledge base, and the knowledge graph.
 */

import defaultKnowledge, { retrieveKnowledge, PORTFOLIO_LINKS } from '../data/chatbotKnowledge';
import { createKnowledgeGraph } from '../data/knowledgeGraph';
import { matchIntent } from './intentMatcher';
import { getRecommendations } from './recommendationEngine';

export const EXACT_FALLBACK_MESSAGE =
  "I'm not sure about that yet! You can ask me about Jatin's skills, projects, education, certifications or achievements.";

/**
 * Builds response text and metadata for a matched intent result.
 *
 * @param {object} matchResult
 * @param {object} [knowledge=defaultKnowledge]
 * @param {object} [context=null]
 * @returns {{ intent: string, reply: string, suggestions: string[], confidence: number }}
 */
export function generateResponse(matchResult, knowledge = defaultKnowledge, context = null) {
  const kb = knowledge || defaultKnowledge;
  const graph = createKnowledgeGraph(kb);

  const intro = kb.personalIntroduction || {};
  const eduList = kb.education || [];
  const skills = kb.technicalSkills || {};
  const projectList = kb.projects || [];
  const certList = kb.certifications || [];
  const achievementList = kb.achievements || [];
  const expList = kb.experience || [];
  const contact = kb.contactInfo || {};

  const intent = matchResult?.intent || 'fallback';
  const suggestions = getRecommendations(matchResult, context, kb);
  const confidence = matchResult?.confidence ?? 0;

  switch (intent) {
    case 'greeting':
      return {
        intent: 'greeting',
        confidence,
        reply:
          `Hello! 👋 I'm **${kb.config?.botName || 'Jatin AI'}**, Jatin Patil's personal portfolio assistant.\n\n` +
          `How can I help you today? You can ask me about Jatin's **skills**, **projects**, **education**, **certifications**, **achievements**, or **contact links**.`,
        suggestions,
      };

    case 'bot_help':
      return {
        intent: 'bot_help',
        confidence,
        reply:
          `I'm **${kb.config?.botName || 'Jatin AI'}** (v${kb.config?.version || '3.0'}) — a fast, offline portfolio assistant built for **${intro.name}**.\n\n` +
          `Here are things you can ask me:\n` +
          `• **Introduction:** Who is Jatin & what are his interests?\n` +
          `• **Skills:** Programming languages, AI/ML & web stack\n` +
          `• **Projects:** Featured AI/ML & Full-Stack work\n` +
          `• **Education:** University, degree, year & semester\n` +
          `• **Certifications & Achievements:** Verified credentials & activities\n` +
          `• **Contact & Links:** GitHub, LinkedIn, Portfolio & Email`,
        suggestions,
      };

    case 'about':
      return {
        intent: 'about',
        confidence,
        reply:
          `**${intro.fullName || intro.name}** is a **B.E. Computer Engineering student** (3rd Year, Sem 6) based in **${intro.location}**.\n\n` +
          `${intro.summary}\n\n` +
          `• **Interests:** ${(intro.interests || []).join(', ')}\n` +
          `• **Currently Learning:** ${(intro.currentlyLearning || []).join(', ')}\n` +
          `• **Activities:** ${(intro.activities || []).join(', ')}\n` +
          `• **Portfolio:** ${contact.portfolio}`,
        suggestions,
      };

    case 'interests_learning':
      return {
        intent: 'interests_learning',
        confidence,
        reply:
          `Here is what **${intro.name}** is passionate about and currently studying:\n\n` +
          `• **Core Interests:** ${(intro.interests || []).join(', ')}\n` +
          `• **Currently Learning:** ${(intro.currentlyLearning || []).join(', ')}\n` +
          `• **Campus Activity:** ${(intro.activities || []).join(', ')}`,
        suggestions,
      };

    case 'education': {
      const verifiedEdu = eduList.filter((item) => item.verificationStatus !== 'incomplete');
      const lines = verifiedEdu.map(
        (item) =>
          `• **${item.degree}** — ${item.institution} (${item.period} | ${item.status})`
      );
      return {
        intent: 'education',
        confidence,
        reply:
          `🎓 **${intro.name}'s Academic Background:**\n\n` +
          lines.join('\n') +
          `\n\nHe is currently in **3rd Year (Sem 6)**, specializing in **Data Science**.\n` +
          `• **Education Section:** ${PORTFOLIO_LINKS.education}`,
        suggestions,
      };
    }

    case 'skills': {
      const matchedSkill = matchResult?.matchedSkill;
      let prefix = '';

      if (matchedSkill) {
        const relatedProjects = graph.getProjectsBySkill(matchedSkill);
        const projectNames = relatedProjects.map((p) => p.title).slice(0, 3);
        const projectNote =
          projectNames.length > 0
            ? ` He has used it in projects like **${projectNames.join(', ')}**.`
            : '';
        prefix = `Yes! **${matchedSkill}** is part of Jatin's technical toolkit.${projectNote}\n\n`;
      }

      return {
        intent: 'skills',
        confidence,
        reply:
          `${prefix}💻 **${intro.name}'s Technical Skills:**\n\n` +
          `• **Programming:** ${[...(skills.coreProgramming || []), ...(skills.additionalLanguages || [])].join(', ')}\n` +
          `• **Web Development:** ${(skills.webDevelopment || []).join(', ')}\n` +
          `• **Data Science & AI:** ${(skills.dataScienceAndAI || []).join(', ')}\n` +
          `• **Cybersecurity & Cloud:** ${(skills.cybersecurityAndCloud || []).join(', ')}\n` +
          `• **Tools & Platforms:** ${(skills.toolsAndPlatforms || []).join(', ')}\n\n` +
          `Explore the full Tech Arsenal at ${PORTFOLIO_LINKS.skills}`,
        suggestions,
      };
    }

    case 'project_detail': {
      const specificProject = matchResult?.matchedProject;
      if (specificProject) {
        const repoLine = specificProject.github
          ? `\n• **GitHub Repo:** ${specificProject.github}`
          : `\n• **More Code on GitHub:** ${contact.github}`;
        const demoLine = specificProject.liveUrl
          ? `\n• **Live Demo:** ${specificProject.liveUrl}`
          : '';
        const sectionLine = `\n• **Portfolio Section:** ${specificProject.portfolioLink || PORTFOLIO_LINKS.projects}`;

        return {
          intent: 'project_detail',
          confidence,
          reply:
            `🚀 **${specificProject.title}** (${specificProject.category})\n\n` +
            `${specificProject.description}\n\n` +
            `• **Tech Stack:** ${(specificProject.tech || []).join(', ')}` +
            repoLine +
            demoLine +
            sectionLine,
          suggestions,
        };
      }
      // Fall through to all projects if no specific project object
      return generateResponse({ ...matchResult, intent: 'projects' }, kb, context);
    }

    case 'projects': {
      const projectLines = projectList.map((p) => {
        const linkSuffix = p.github ? ` — ${p.github}` : '';
        return `• **${p.title}** (${p.category}): ${p.description} *[${(p.tech || []).join(', ')}]*${linkSuffix}`;
      });

      return {
        intent: 'projects',
        confidence,
        reply:
          `🚀 **${intro.name}'s Projects:**\n\n` +
          projectLines.join('\n') +
          `\n\n• **Featured Work:** ${PORTFOLIO_LINKS.projects}\n` +
          `• **All Repositories on GitHub:** ${contact.github}`,
        suggestions,
      };
    }

    case 'certifications': {
      const certLines = certList.map(
        (c) => `• **${c.title}** — *${c.issuer}*${c.date ? ` (${c.date})` : ''}`
      );

      return {
        intent: 'certifications',
        confidence,
        reply:
          `📜 **${intro.name}'s Verified Certifications:**\n\n` +
          certLines.join('\n') +
          `\n\nYou can view and verify all certificates at ${PORTFOLIO_LINKS.certifications}`,
        suggestions,
      };
    }

    case 'achievements': {
      const achLines = achievementList.map(
        (a) => `• **${a.title}:** ${a.description}`
      );

      return {
        intent: 'achievements',
        confidence,
        reply:
          `🏆 **${intro.name}'s Achievements & Activities:**\n\n` +
          achLines.join('\n') +
          `\n\n• **Hackathon Credentials:** ${PORTFOLIO_LINKS.hackathons}`,
        suggestions,
      };
    }

    case 'experience': {
      const verifiedExp = expList.filter((e) => e.verificationStatus !== 'incomplete');
      const expLines = verifiedExp.map(
        (e) => `• **${e.role}** — *${e.organization}* (${e.period}): ${e.details}`
      );

      return {
        intent: 'experience',
        confidence,
        reply:
          `💼 **${intro.name}'s Experience & Leadership:**\n\n` +
          expLines.join('\n') +
          `\n\n**Availability:** ${contact.availability}\n` +
          `• **Portfolio:** ${PORTFOLIO_LINKS.portfolio}`,
        suggestions,
      };
    }

    case 'github_link':
      return {
        intent: 'github_link',
        confidence,
        reply:
          `🐙 **Jatin's GitHub Profile:**\n${contact.github}\n\n` +
          `Check it out to explore his AI/ML, Data Science, and Full-Stack repositories!`,
        suggestions,
      };

    case 'linkedin_link':
      return {
        intent: 'linkedin_link',
        confidence,
        reply:
          `💼 **Jatin's LinkedIn Profile:**\n${contact.linkedin}\n\n` +
          `Feel free to connect with Jatin on LinkedIn for networking, internships, or collaborations!`,
        suggestions,
      };

    case 'portfolio_link':
      return {
        intent: 'portfolio_link',
        confidence,
        reply:
          `🌐 **Jatin's Official Portfolio Links:**\n\n` +
          `• **Portfolio Website:** ${contact.portfolio}\n` +
          `• **GitHub:** ${contact.github}\n` +
          `• **LinkedIn:** ${contact.linkedin}`,
        suggestions,
      };

    case 'contact':
      return {
        intent: 'contact',
        confidence,
        reply:
          `📬 **Connect with ${intro.name}:**\n\n` +
          `• **Email:** mailto:${contact.email}\n` +
          `• **LinkedIn:** ${contact.linkedin}\n` +
          `• **GitHub:** ${contact.github}\n` +
          `• **Portfolio:** ${contact.portfolio}\n` +
          `• **Location:** ${contact.location}`,
        suggestions,
      };

    case 'thanks':
      return {
        intent: 'thanks',
        confidence,
        reply:
          `You're very welcome! 😊 Let me know if you'd like to explore anything else about Jatin's **projects**, **skills**, or **contact details**.`,
        suggestions,
      };

    case 'goodbye':
      return {
        intent: 'goodbye',
        confidence,
        reply:
          `Thanks for stopping by Jatin's portfolio! 👋 Have a great day, and feel free to connect via LinkedIn (${contact.linkedin}) or email (mailto:${contact.email}).`,
        suggestions,
      };

    case 'fallback':
    default:
      return {
        intent: 'fallback',
        confidence: 0,
        reply: kb.config?.fallbackMessage || EXACT_FALLBACK_MESSAGE,
        suggestions,
      };
  }
}

/**
 * Convenience pipeline that matches intent and generates response in one call.
 *
 * @param {string} userInput
 * @param {object} [knowledge=defaultKnowledge]
 * @param {object} [context=null]
 */
export function matchChatbotResponse(userInput, knowledge = defaultKnowledge, context = null) {
  try {
    const kb = knowledge || defaultKnowledge;
    const matchResult = matchIntent(userInput, kb, context);
    const response = generateResponse(matchResult, kb, context);
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
      reply: EXACT_FALLBACK_MESSAGE,
      suggestions: defaultKnowledge.config?.suggestedQuestions?.slice(0, 4) || [],
    };
  }
}

export default generateResponse;
